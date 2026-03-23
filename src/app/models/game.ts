export interface Game {
  name: string;
  id: number;
  points: number;
  img_url?: string;
  game_mode?: GameMode;
}

export type GameMode = 'competitive' | 'non_competitive';

export interface GameResult extends MatchRequestObject {
  game: number;
  challenger_email: string;
  opponent_email: string;
  winner_email: string;
  date_played: string;
  winner_approved: boolean;
  id: number;
  game_mode?: GameMode;
}

export interface MatchRequestObject {
  game: number;
  date_played: string;
  participants: Participant[];
  images_urls?: string[];
  images_data?: MatchImage[];
}

export interface Participant {
  user_identifier: string;
  is_challenger: boolean;
}

export interface MatchImage {
  imageUrl: string;
  caption: string;
  location: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    google_place_id: string;
  };
}

export interface GameResultWithGame extends GameResult {
  gamePlayed?: Game;
}

export interface UserGameHistory {
  date_played: string;
  game_name: string;
  match_id: number;
  opponent: string;
  result: 'won' | 'lost' | 'drew' | 'pending';
  images: MatchImage[];
}