import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
    return this.http.get<DailyDare[]>(`${environment.apiUrl}api/v1/games/daily-dare/`, {
      headers: this.headers,
      params: queryParams,
    });
  }

  fetchToday(): Observable<DailyDare[]> {
    return this.http.get<DailyDare[]>(`${environment.apiUrl}api/v1/games/daily-dare/detail/`, {
      headers: this.headers,
    });
  }

  fetchTodayQuiz(): Observable<QuizDare[]> {
    return this.http.get<QuizDare[]>(`${environment.apiUrl}api/v1/games/daily-dare/quiz/`, {
      headers: this.headers,
    });
  }

  fetchById(id: number): Observable<QuizDare | DailyDare> {
    // Note: Backend doesn't have /daily-dare/{id}/ endpoint
    // Try fetching from list and filter, or use today's endpoint
    const params = new HttpParams().set('id', String(id));
    return this.http.get<DailyDare>(`${environment.apiUrl}api/v1/games/daily-dare/`, {
      headers: this.headers,
      params
    }).pipe((source: any) => source); // allow consumers to map as needed
  }

  fetchQuizById(id: number): Observable<QuizDare> {
    // The ID here is actually the dare ID (parent), not the quiz ID
    // Fetch all quizzes for this dare and return the first one (or the one with matching ID if found)
    const params = new HttpParams().set('id', String(id));
    return this.http.get<any>(`${environment.apiUrl}api/v1/games/daily-dare/quiz/`, {
      headers: this.headers,
      params
    }).pipe(
      map((response: any) => {
        console.log('fetchQuizById: Raw API response:', response);
        console.log('fetchQuizById: Response is array?', Array.isArray(response));
        
        // If response is an array, try to find quiz with matching ID first
        if (Array.isArray(response)) {
          console.log('fetchQuizById: API returned array of', response.length, 'quizzes');
          
          // First, try to find exact match by ID
          let quiz = response.find((q: any) => q.id === id);
          
          // If not found, just use the first quiz
          if (!quiz && response.length > 0) {
            console.log('fetchQuizById: No exact ID match, using first quiz from array');
            quiz = response[0];
          }
          
          if (quiz) {
            console.log('fetchQuizById: Selected quiz:', {
              id: quiz.id,
              title: quiz.title,
              hasQuestions: !!quiz.questions,
              questionCount: quiz.questions?.length
            });
            return quiz;
          }
          
          console.error('fetchQuizById: Empty array returned from API');
          return null;
        }
        
        // If response is a single object, return it
        console.log('fetchQuizById: API returned single quiz object');
        return response;
      })
    );
  }

  submitQuizAnswers(payload: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}api/v1/games/daily-dare/quiz/submit/`, payload, {
      headers: this.headers,
    });
  }

  fetchQuizResults(dareId: number): Observable<QuizSubmissionResponse> {
    return this.http.get<QuizSubmissionResponse>(`${environment.apiUrl}api/v1/games/daily-dare/${dareId}/results/`, {
      headers: this.headers,
    });
  }

  fetchHistory(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}api/v1/games/daily-dare/history/`, {
      headers: this.headers,
    });
  }
}

export interface QuizSubmissionResponse {
  status: string;
  score: number;
  total_possible: number;
  responses: Array<{
    question_id: number;
    is_correct: boolean;
    points_earned: number;
    selected_option_id: number | null;
  }>;
  questions?: QuizDareQuestion[];
  completed_at?: string;
}

export interface QuizDareQuestion {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  options: QuizDareOption[];
  order?: number;
}

export interface QuizDareOption {
  id: number;
  option_text: string;
  is_correct: boolean;
}


