import { Game } from './game';
import { SafariLevel } from './level';

export interface User {
  user_id: number;
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  password?: string;
  password_conf?: string;
  email: string;
  is_active: string;
  location: string;
  scores: number;
  last_login: string;
  profile_image: string;
  date_joined: string;
  i_follow: boolean;
  follows_me: boolean;
  followers: number;
  follows: number;
  profile?: any;
  tribe: Tribe;
  token?: any;
  is_followed: boolean;
  follow_count: number;
  following_count: number;
  mwandas: number;
  user_points: number;
  since: string;
  mbiu_username: string;
  display_name: string;
  display_username: boolean;
  level: SafariLevel;
  mwandas_left: number;
  artifact_used: boolean;
  unused_cheatcodes: number;
  bio: string;
  hobbies: string;
  selected_vibes: Game[];
  referral_code: string;
  referral_url: string;
}

export interface Tribe {
  description: string;
  id: number;
  name: string;
  slug: string;
  main_image: string;
  mwandas: number;
  user_points: number;
}

export interface UserRegistration {
  first_name: string;
  last_name: string;
  password: string;
  location: string;
  email: string;
  confirm: string;
  referer?: string;
  tribe: number;
}