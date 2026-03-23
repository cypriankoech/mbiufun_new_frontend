import { User } from './user';
import { Tribe } from './user';

export interface Challenge {
  id: number;
  title: string;
  type: string;
  play_count: number;
  description?: string;
  reward: number;
  min_reward: number;
  challenge_image?: string;
  created_by?: User;
  active: boolean;
  status?: string;
  season?: any;
  tournament?: any;
  starts_at?: string;
  ends_at?: string;
  created_by_staff?: any;
  approved_by?: any;
  is_featured: boolean;
  submission_methods?: any;
  tribes?: Tribe[];
  liked_by?: User[];
  village?: any;
  level?: any;
  challenge_data?: any;
  time_limit: number;
}

export interface ChallengeAttempt {
  id: number;
  challenge: Challenge;
  user: User;
  try_data?: any;
  attached_files?: any;
  created_at: string;
  status: string;
  approved_by?: any;
  pen_data?: string;
  liked_by?: User[];
  text_data?: string;
}


