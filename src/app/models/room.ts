import { User } from './user';

export interface ChatRoom {
  id: number;
  name: string;
  type: 'direct' | 'group' | 'tribe';
  participants: User[];
  created_at: string;
  last_message?: ChatMessage;
  unread_count: number;
}

export interface ChatMessage {
  id: number;
  room: ChatRoom;
  sender: User;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  read_by: User[];
}


