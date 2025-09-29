import { User } from './user';
import { Tribe } from './user';

export interface LeaderboardEntry {
  id: number;
  rank: number;
  user: User;
  points: number;
  games_played: number;
  win_rate: number;
  tribe?: Tribe;
  level?: any;
  change?: number; // Position change from previous period
}

export interface Leaderboard {
  id: number;
  name: string;
  type: 'global' | 'tribe' | 'weekly' | 'monthly' | 'seasonal';
  entries: LeaderboardEntry[];
  total_entries: number;
  user_rank?: number;
  user_entry?: LeaderboardEntry;
  last_updated: string;
  period_start?: string;
  period_end?: string;
}


