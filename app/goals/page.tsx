"use client";

import { Header } from "@/components/layout/header";
import { GoalCard } from "@/components/progress/goal-card";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { GoalDialog } from "@/components/progress/goal-dialog";
import { getGoals, getGoalStatistics } from "@/lib/goals";
import { useToast } from "@/hooks/use-toast";
import type { Goal, GoalStatistics } from "@/types/goals";

export default function GoalsPage() {
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // サンプルチャートデータ
  const chartData = useMemo(() => [
    { date: '1月', selfEsteem: 65, beautyGoals: 70 },
    { date: '2月', selfEsteem: 68, beautyGoals: 72 },
    { date: '3月', selfEsteem: 75, beautyGoals: 78 },
    { date: '4月', selfEsteem: 80, beautyGoals: 82 },
    { date: '5月', selfEsteem: 85, beautyGoals: 88 },
    { date: '6月', selfEsteem: 82, beautyGoals: 85 },
  ], []);

  const loadGoals = async () => {
    try {
      const [goalsResponse, statsResponse] = await Promise.all([
        getGoals(),
        getGoalStatistics()
      ]);

      if (goalsResponse.error) throw goalsResponse.error;
      if (statsResponse.error) throw statsResponse.error;

      setGoals(goalsResponse.data || []);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading goals:', error);
      toast({
        title: "エラー",
        description: "目標データの読み込みに失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []); // Remove toast from dependencies to avoid unnecessary re-renders

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">目標管理</h1>
            <Button onClick={() => setShowGoalDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              新しい目標を設定
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <ProgressChart
              data={chartData}
              title="進捗チャート"
              description="自己肯定感スコアと美容目標の達成度推移"
            />
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">統計情報</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold">
                    {stats ? `${Math.round(stats.averageProgress)}%` : '-'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    目標達成率（平均）
                  </div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold">
                    {stats?.completedGoals || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    達成済み目標数
                  </div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold">
                    {stats?.activeGoals || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    進行中の目標数
                  </div>
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <div className="text-2xl font-bold">
                    {stats?.totalPoints || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    獲得ポイント
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">現在の目標</h2>
          {loading ? (
            <div className="text-center py-8">読み込み中...</div>
          ) : goals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              目標が設定されていません
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  {...goal}
                  onProgressUpdated={loadGoals}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <GoalDialog
        open={showGoalDialog}
        onOpenChange={setShowGoalDialog}
        onGoalCreated={loadGoals}
      />
    </>
  );
}