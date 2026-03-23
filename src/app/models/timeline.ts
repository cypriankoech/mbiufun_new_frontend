import { MbiuPost } from './post';

export interface Timeline {
  id: number;
  posts: MbiuPost[];
  hasMore: boolean;
  nextPage?: string;
}