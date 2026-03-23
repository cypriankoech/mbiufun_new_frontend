import { User } from './user';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  user: User;
  read: boolean;
  created_at: string;
  data?: any;
  action_url?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  game_invites: boolean;
  challenge_updates: boolean;
  tribe_updates: boolean;
}


