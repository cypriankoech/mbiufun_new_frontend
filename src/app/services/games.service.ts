import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Game, GameResult, GameResultWithGame, UserGameHistory, GameMode } from '../models/game';

@Injectable({
  providedIn: 'root'
})
export class GamesService {

  constructor(private apiService: ApiService) { }

  // Get all available games
  getGames(): Observable<Game[]> {
    return this.apiService.get('game/');
  }

  // Get competitive games only
  getCompetitiveGames(): Observable<Game[]> {
    return this.apiService.get('game/', { game_mode: 'competitive' });
  }

  // Get non-competitive games (vibes)
  getNonCompetitiveGames(): Observable<Game[]> {
    return this.apiService.get('game/', { game_mode: 'non_competitive' });
  }

  // Get user's game history
  getUserGameHistory(userId?: number): Observable<UserGameHistory[]> {
    const params = userId ? { user_id: userId } : {};
    return this.apiService.get('game/history/', params);
  }

  // Create a new game match
  createMatch(matchData: any): Observable<any> {
    return this.apiService.post('game/create-match/', matchData);
  }

  // Get match details
  getMatchDetails(matchId: number): Observable<GameResultWithGame> {
    return this.apiService.get(`game/match/${matchId}/`);
  }

  // Confirm match winner
  confirmWinner(matchId: number, winnerData: any): Observable<any> {
    return this.apiService.post(`game/confirm-winner/${matchId}/`, winnerData);
  }

  // Get leaderboard
  getLeaderboard(type: string = 'global', period?: string): Observable<any> {
    const params: any = { type };
    if (period) {
      params.period = period;
    }
    return this.apiService.get('game/leaderboard/', params);
  }

  // Get user's ranking
  getUserRanking(userId: number): Observable<any> {
    return this.apiService.get(`game/user-ranking/${userId}/`);
  }

  // Update user's selected vibes
  updateUserVibes(vibeIds: number[]): Observable<any> {
    return this.apiService.post('user/update-vibes/', { vibes: vibeIds });
  }

  // Get available vibes for user selection
  getAvailableVibes(): Observable<Game[]> {
    return this.apiService.get('game/vibes/');
  }
}
