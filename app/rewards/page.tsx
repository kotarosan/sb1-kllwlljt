"use client";

import { Header } from "@/components/layout/header";
import { RewardCard } from "@/components/rewards/reward-card";
import { Card } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useState, useEffect } from "react";
import { RewardRecommendations } from "@/components/rewards/reward-recommendations";
import { getAvailablePoints, getRewards } from "@/lib/rewards";
import { useToast } from "@/hooks/use-toast";
import type { Reward } from "@/types/rewards";

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      const [rewardsResponse, pointsResponse] = await Promise.all([
        getRewards(),
        getAvailablePoints()
      ]);

      if (rewardsResponse.error || pointsResponse.error) {
        const error = rewardsResponse.error || pointsResponse.error;
        console.error('Data loading error:', error);
        toast({
          title: "データ読み込みエラー",
          description: error instanceof Error ? error.message : "データの読み込みに失敗しました",
          variant: "destructive",
        });
        return;
      }

      setRewards(rewardsResponse.data);
      setPoints(pointsResponse.data || 0);
    } catch (error) {
      console.error('Error loading rewards:', error);
      toast({
        title: "エラー",
        description: "特典データの読み込み中にエラーが発生しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">ポイント交換</h1>

          <Card className="p-6 mb-8 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">利用可能なポイント</p>
                <p className="text-3xl font-bold">{points.toLocaleString()} pt</p>
              </div>
            </div>
          </Card>

          <RewardRecommendations />

          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              現在交換可能な特典はありません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  {...reward}
                  userPoints={points}
                  onExchange={loadData}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}