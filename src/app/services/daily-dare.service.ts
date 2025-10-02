import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';

export interface DailyDare {
  id: number;
  title: string;
  description: string;
  date?: string;
  challenge_type?: string;
  points?: number;
  image_url?: string;
  is_completed?: boolean;
  user_score?: number | null;
  _img?: string;
}

export interface QuizDare extends DailyDare {
  questions?: any[];
}

@Injectable({ providedIn: 'root' })
export class DailyDareService {
  constructor(private http: HttpClient, private auth: AuthenticationService) {}

  private get headers(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token,
      Authorization: `Bearer ${token}`,
    });
  }

  fetchAll(params?: { page?: number; date__gte?: string; challenge_type?: string }): Observable<DailyDare[]> {
    let queryParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) queryParams = queryParams.set(k, String(v));
      });
    }
    return this.http.get<DailyDare[]>(`${environment.apiUrl}api/v1/game/daily-dare/`, {
      headers: this.headers,
      params: queryParams,
    });
  }

  fetchToday(): Observable<DailyDare[]> {
    return this.http.get<DailyDare[]>(`${environment.apiUrl}api/v1/game/daily-dare/detail/`, {
      headers: this.headers,
    });
  }

  fetchTodayQuiz(): Observable<QuizDare[]> {
    return this.http.get<QuizDare[]>(`${environment.apiUrl}api/v1/game/daily-dare/quiz/`, {
      headers: this.headers,
    });
  }

  fetchById(id: number): Observable<QuizDare | DailyDare> {
    // Note: Backend doesn't have /daily-dare/{id}/ endpoint
    // Try fetching from list and filter, or use today's endpoint
    const params = new HttpParams().set('id', String(id));
    return this.http.get<DailyDare>(`${environment.apiUrl}api/v1/game/daily-dare/`, {
      headers: this.headers,
      params
    }).pipe((source: any) => source); // allow consumers to map as needed
  }

  fetchQuizById(id: number): Observable<QuizDare> {
    // Try fetching quiz with ID as query param
    const params = new HttpParams().set('id', String(id));
    return this.http.get<QuizDare>(`${environment.apiUrl}api/v1/game/daily-dare/quiz/`, {
      headers: this.headers,
      params
    });
  }

  submitQuizAnswers(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/v1/game/daily-dare/quiz/submit/`, payload, {
      headers: this.headers,
    });
  }

  fetchHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}api/v1/game/daily-dare/history/`, {
      headers: this.headers,
    });
  }
}


