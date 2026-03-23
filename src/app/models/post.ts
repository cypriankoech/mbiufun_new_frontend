import { MbiuComment } from './comment';
import { MbiuLike } from './like';
import { User } from './user';

export interface MbiuPost {
  id: number;
  user: User;
  text: string;
  created_at: string;
  timestring: string;
  post_img?: string;
  post_video?: string;
  likes: MbiuLike[];
  comment_count: number;
  comments: MbiuComment[];
}

export interface MbiuPostFeed {
  id: number;
  user: number;
  text: string;
  created_at: string;
  post_img?: string;
  post_video?: string;
  room?: string;
  likes: number;
  liked: boolean;
  comments: MbiuComment[];
  tagged_users: any[];
}