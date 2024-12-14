export interface Goal {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: string;
  deadline: Date;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface GoalProgress {
  id: number;
  goal_id: number;
  user_id: string;
  progress: number;
  note?: string;
  recorded_at: Date;
}

export interface GoalAchievement {
  id: number;
  goal_id: number;
  user_id: string;
  points: number;
  achievement_date: Date;
}

export interface GoalStatistics {
  totalGoals: number;
  completedGoals: number;
  averageProgress: number;
  totalPoints: number;
  activeGoals: number;
}