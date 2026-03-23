import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StreakData } from '../models/streak';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private readonly apiBaseUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthenticationService
  ) {}

  private get headers() {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Get user's current streak data
   * Called after successful login to show streak dialog
   */
  getStreak(): Observable<StreakData> {
    const url = `${this.apiBaseUrl}api/v1/game/streak/`;
    return this.http.get<StreakData>(url, { headers: this.headers });
  }

  /**
   * Get available streak rewards
   */
  getStreakRewards(): Observable<any> {
    const url = `${this.apiBaseUrl}api/v1/game/streak/rewards/`;
    return this.http.get<any>(url, { headers: this.headers });
  }

  /**
   * Claim 3-day streak reward
   */
  claim3dayStreakReward(): Observable<any> {
    const url = `${this.apiBaseUrl}api/v1/game/streak/claim/3/`;
    return this.http.post<any>(url, {}, { headers: this.headers });
  }

  /**
   * Claim 7-day streak reward
   */
  claim7dayStreakReward(): Observable<any> {
    const url = `${this.apiBaseUrl}api/v1/game/streak/claim/7/`;
    return this.http.post<any>(url, {}, { headers: this.headers });
  }
}
