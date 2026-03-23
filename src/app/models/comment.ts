import { User } from './user';

export interface MbiuComment {
  id: number;
  user: User;
  text: string;
  created_at: string;
  parent_comment?: number;
  timestring: string;
  likes: number;
  reply_count: number;
  replies: Comment[];
}

export interface MbiuPostComment {
  id: number;
  user: string;
  text: string;
  post?: number;
  created_at: string;
  timestring: string;
  likes: number;
  reply_count: number;
  replies: Comment[];
  tagged_users: any[];
}