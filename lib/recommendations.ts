import { supabase } from './supabase';
import type { RewardRecommendation } from '@/types/rewards';

export async function getRewardRecommendations(userId: string) {
  try {
    // ユーザーの過去の交換履歴を取得
    const { data: history, error: historyError } = await supabase
      .from('reward_exchanges')
      .select(`
        *,
        rewards (
          id,
          title,
          description,
          points,
          category,
          stock
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (historyError) throw historyError;

    // ユーザーの目標達成履歴を取得
    const { data: achievements, error: achievementsError } = await supabase
      .from('goal_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('achievement_date', { ascending: false });

    if (achievementsError) throw achievementsError;

    // 利用可能なポイントを取得
    const { data: points, error: pointsError } = await supabase
      .from('goal_achievements')
      .select('points')
      .eq('user_id', userId)
      .sum('points')
      .single();

    if (pointsError) throw pointsError;

    const availablePoints = points?.sum || 0;

    // お気に入りカテゴリーを分析
    const categoryPreferences = history?.reduce((acc, exchange) => {
      const category = exchange.rewards.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteCategories = Object.entries(categoryPreferences || {})
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category);

    // 全特典を取得
    const { data: allRewards, error: rewardsError } = await supabase
      .from('rewards')
      .select('*')
      .gt('stock', 0)
      .order('points', { ascending: true });

    if (rewardsError) throw rewardsError;

    // レコメンデーション生成
    const recommendations: RewardRecommendation[] = [];

    // 1. 予算内のおすすめ（お気に入りカテゴリー優先）
    const budgetRecommendations = allRewards
      ?.filter(reward => reward.points <= availablePoints)
      .sort((a, b) => {
        const aCategoryIndex = favoriteCategories.indexOf(a.category);
        const bCategoryIndex = favoriteCategories.indexOf(b.category);
        if (aCategoryIndex === bCategoryIndex) {
          return b.points - a.points; // より高額な特典を優先
        }
        return aCategoryIndex - bCategoryIndex;
      })
      .slice(0, 3)
      .map(reward => ({
        ...reward,
        reason: 'あなたの利用可能ポイント内でおすすめの特典です'
      }));

    recommendations.push(...(budgetRecommendations || []));

    // 2. 人気の特典
    const { data: popularRewards, error: popularError } = await supabase
      .from('reward_exchanges')
      .select(`
        reward_id,
        count,
        rewards (*)
      `)
      .gt('rewards.stock', 0)
      .not('reward_id', 'in', `(${recommendations.map(r => r.id).join(',')})`)
      .group('reward_id')
      .order('count', { ascending: false })
      .limit(2);

    if (!popularError && popularRewards) {
      const popularRecommendations = popularRewards.map(({ rewards }) => ({
        ...rewards,
        reason: '多くのユーザーに選ばれている人気の特典です'
      }));
      recommendations.push(...popularRecommendations);
    }

    // 3. 目標達成パターンに基づくレコメンド
    const recentAchievements = achievements?.slice(0, 5) || [];
    const achievementCategories = recentAchievements.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topAchievementCategory = Object.entries(achievementCategories)
      .sort(([, a], [, b]) => b - a)
      .map(([category]) => category)[0];

    if (topAchievementCategory) {
      const { data: categoryRewards } = await supabase
        .from('rewards')
        .select('*')
        .eq('category', topAchievementCategory)
        .gt('stock', 0)
        .not('id', 'in', `(${recommendations.map(r => r.id).join(',')})`)
        .limit(1);

      if (categoryRewards?.[0]) {
        recommendations.push({
          ...categoryRewards[0],
          reason: `${topAchievementCategory}カテゴリーでの目標達成が多いあなたにおすすめです`
        });
      }
    }

    return { data: recommendations, error: null };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return { data: null, error };
  }
}