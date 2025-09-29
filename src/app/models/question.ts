import { User } from './user';

export interface Question {
  id: number;
  title: string;
  content: string;
  author: User;
  created_at: string;
  answers_count: number;
  tags?: string[];
  is_featured: boolean;
  reward_points: number;
  accepted_answer?: Answer;
}

export interface Answer {
  id: number;
  question: Question;
  author: User;
  content: string;
  created_at: string;
  is_accepted: boolean;
  votes_count: number;
  user_vote?: number; // 1 for upvote, -1 for downvote, 0 for no vote
}

export interface QuestionsResponse {
  questions: Question[];
  total_pages: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
}


