export interface DialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export interface ConfirmWinnerData {
  match_id: number;
  winner_id: number;
  loser_id: number;
  game_name: string;
  winner_name: string;
  loser_name: string;
}


