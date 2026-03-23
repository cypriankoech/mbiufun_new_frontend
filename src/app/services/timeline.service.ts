import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthenticationService } from '@app/services/authentication.service';

export interface TimelineUser {
  id: number;
  username?: string;
  display_name?: string;
  profile_image?: string;
}

export interface TimelineEntry {
  id: number;
  user: TimelineUser;
  type: string;
  title: string;
  link?: string;
  media?: string;
  like_count: number;
  is_liked: boolean;
  created_at: string;
  description: string;
  timestring: string;
}

export interface UserSummary {
  id: number;
  username: string;
  user_points?: number;
  scores?: number;
  mwandas?: number;
  followers?: number;
  follows?: number;
}

@Injectable({ providedIn: 'root' })
export class TimelineService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthenticationService);
  private readonly baseUrl = `${environment.apiUrl}api/v1/user/`;

  private get authHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getTimeline(userId?: number): Observable<TimelineEntry[]> {
    const url = userId ? `${this.baseUrl}get_timeline/${userId}` : `${this.baseUrl}get_timeline/`;
    return this.http.get<{ data: TimelineEntry[] }>(url, { headers: this.authHeaders }).pipe(
      map(res => res?.data ?? [])
    );
  }

  getCurrentUser(): Observable<UserSummary> {
    return this.http.get<UserSummary>(`${this.baseUrl}me/`, { headers: this.authHeaders });
  }
}




