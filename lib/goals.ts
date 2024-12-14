import { supabase } from './supabase';
import type { Goal, GoalProgress } from '@/types/goals';

export async function createGoal(
  title: string,
  description: string,
  category: string,
  deadline: Date
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title,
        description,
        category,
        deadline: deadline.toISOString(),
        progress: 0
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating goal:', error);
    return { data: null, error };
  }
}

export async function getGoals() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      data: data.map(goal => ({
        ...goal,
        deadline: new Date(goal.deadline)
      })) as Goal[],
      error: null
    };
  } catch (error) {
    console.error('Error fetching goals:', error);
    return { data: null, error };
  }
}

export async function updateGoalProgress(
  goalId: number,
  progress: number,
  note?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    // トランザクション的な処理
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .select('progress')
      .eq('id', goalId)
      .single();

    if (goalError) throw goalError;

    // 進捗記録を追加
    const { error: progressError } = await supabase
      .from('goal_progress')
      .insert({
        goal_id: goalId,
        user_id: user.id,
        progress,
        note
      });

    if (progressError) throw progressError;

    // 目標の進捗を更新
    const { error: updateError } = await supabase
      .from('goals')
      .update({ progress })
      .eq('id', goalId);

    if (updateError) throw updateError;

    // 目標が100%達成された場合、達成報酬を記録
    if (progress === 100) {
      const { error: achievementError } = await supabase
        .from('goal_achievements')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          points: 100 // 基本ポイント
        });

      if (achievementError) throw achievementError;
    }

    return { error: null };
  } catch (error) {
    console.error('Error updating goal progress:', error);
    return { error };
  }
}

export async function getGoalProgress(goalId: number) {
  try {
    const { data, error } = await supabase
      .from('goal_progress')
      .select('*')
      .eq('goal_id', goalId)
      .order('recorded_at', { ascending: true });

    if (error) throw error;

    return {
      data: data.map(progress => ({
        ...progress,
        recorded_at: new Date(progress.recorded_at)
      })) as GoalProgress[],
      error: null
    };
  } catch (error) {
    console.error('Error fetching goal progress:', error);
    return { data: null, error };
  }
}

export async function getGoalStatistics() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('認証が必要です');

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('progress')
      .eq('user_id', user.id);

    if (goalsError) throw goalsError;

    const { data: achievements, error: achievementsError } = await supabase
      .from('goal_achievements')
      .select('points')
      .eq('user_id', user.id);

    if (achievementsError) throw achievementsError;

    const totalGoals = goals?.length || 0;
    const completedGoals = goals?.filter(g => g.progress === 100).length || 0;
    const averageProgress = goals?.reduce((acc, g) => acc + g.progress, 0) / totalGoals || 0;
    const totalPoints = achievements?.reduce((acc, a) => acc + a.points, 0) || 0;

    return {
      data: {
        totalGoals,
        completedGoals,
        averageProgress,
        totalPoints,
        activeGoals: totalGoals - completedGoals
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching goal statistics:', error);
    return { data: null, error };
  }
}