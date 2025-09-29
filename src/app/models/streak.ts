export interface Streak {
  id: number;
  user_id: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  streak_type: 'daily_login' | 'games_played' | 'challenges_completed';
  multiplier: number;
  rewards_earned: number[];
}

export interface StreakData {
  current_streak: number;
  last_login_date: string;
  streak_rewards_claimed: Record<string, boolean>;
  longest_streak: number;
  canClaim3Day?: boolean;
  canClaim7Day?: boolean;
}
