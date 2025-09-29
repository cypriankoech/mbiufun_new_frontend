import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '@environments/environment';

export interface FeedPost {
  id: number;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
  caption: string;
  hobby?: {
    id: number;
    name: string;
    icon?: string;
  };
  image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_friend_post?: boolean;
  post_type?: 'user' | 'event';
  event_details?: {
    title: string;
    date: string;
    time: string;
    link: string;
  };
}

export interface UnifiedFeedResponse {
  results: FeedPost[];
  next?: string;
  previous?: string;
  count: number;
}

export interface CreatePostPayload {
  caption: string;
  hobby_id?: number;
  image?: File;
}

export interface AICaptionSuggestion {
  text: string;
  tone: 'casual' | 'excited' | 'reflective';
}

@Injectable({
  providedIn: 'root'
})
export class FeedService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}api/v1/`;
  
  // Subject to notify components of new posts
  private newPostsAvailable$ = new BehaviorSubject<boolean>(false);
  public newPostsNotification$ = this.newPostsAvailable$.asObservable();

  /**
   * Fetch unified feed (hobby posts + friend posts)
   */
  getUnifiedFeed(page: number = 1, perPage: number = 20, hobbyFilter?: number): Observable<UnifiedFeedResponse> {
    const token = localStorage.getItem('mbiu-token');
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());
    
    if (hobbyFilter) {
      params = params.set('hobby_id', hobbyFilter.toString());
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.get<UnifiedFeedResponse>(
      `${this.baseUrl}posts/unified_feed/`,
      { headers, params }
    ).pipe(
      tap(response => console.log('📰 Feed loaded:', response)),
      catchError(error => {
        console.error('❌ Feed fetch error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user's active post count
   */
  getUserActivePostCount(): Observable<{ count: number; limit: number }> {
    const token = localStorage.getItem('mbiu-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.get<{ count: number; limit: number }>(
      `${this.baseUrl}posts/my_active_count/`,
      { headers }
    ).pipe(
      catchError(error => {
        console.error('❌ Post count error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create a new post
   */
  createPost(payload: CreatePostPayload): Observable<FeedPost> {
    const token = localStorage.getItem('mbiu-token');
    const formData = new FormData();
    
    formData.append('caption', payload.caption);
    if (payload.hobby_id) {
      formData.append('hobby_id', payload.hobby_id.toString());
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    const headers = new HttpHeaders({
      'mbiu-token': token || ''
      // Don't set Content-Type for FormData, browser will set it with boundary
    });

    return this.http.post<FeedPost>(
      `${this.baseUrl}posts/create/`,
      formData,
      { headers }
    ).pipe(
      tap(post => {
        console.log('✅ Post created:', post);
        this.notifyNewPosts();
      }),
      catchError(error => {
        console.error('❌ Post creation error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generate AI caption suggestions
   */
  getAICaptionSuggestions(context?: string): Observable<AICaptionSuggestion[]> {
    const token = localStorage.getItem('mbiu-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.post<{ suggestions: AICaptionSuggestion[] }>(
      `${this.baseUrl}posts/ai_captions/`,
      { context },
      { headers }
    ).pipe(
      map(response => response.suggestions),
      catchError(error => {
        console.error('❌ AI caption error:', error);
        // Return fallback suggestions
        return [
          { text: 'Just shared something awesome! ✨', tone: 'excited' as const },
          { text: 'Loving this moment 💙', tone: 'casual' as const },
          { text: 'Here's what I've been up to lately', tone: 'reflective' as const }
        ];
      })
    );
  }

  /**
   * Like a post
   */
  likePost(postId: number): Observable<{ likes_count: number }> {
    const token = localStorage.getItem('mbiu-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.post<{ likes_count: number }>(
      `${this.baseUrl}posts/${postId}/like/`,
      {},
      { headers }
    ).pipe(
      tap(() => console.log('👍 Post liked:', postId)),
      catchError(error => {
        console.error('❌ Like error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Unlike a post
   */
  unlikePost(postId: number): Observable<{ likes_count: number }> {
    const token = localStorage.getItem('mbiu-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.post<{ likes_count: number }>(
      `${this.baseUrl}posts/${postId}/unlike/`,
      {},
      { headers }
    ).pipe(
      tap(() => console.log('👎 Post unliked:', postId)),
      catchError(error => {
        console.error('❌ Unlike error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add comment to post
   */
  addComment(postId: number, text: string): Observable<any> {
    const token = localStorage.getItem('mbiu-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.post(
      `${this.baseUrl}posts/${postId}/comment/`,
      { text },
      { headers }
    ).pipe(
      tap(() => console.log('💬 Comment added to post:', postId)),
      catchError(error => {
        console.error('❌ Comment error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a post
   */
  deletePost(postId: number): Observable<void> {
    const token = localStorage.getItem('mbiu-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.delete<void>(
      `${this.baseUrl}posts/${postId}/delete/`,
      { headers }
    ).pipe(
      tap(() => console.log('🗑️ Post deleted:', postId)),
      catchError(error => {
        console.error('❌ Delete error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Notify components that new posts are available
   */
  notifyNewPosts(): void {
    this.newPostsAvailable$.next(true);
  }

  /**
   * Clear new posts notification
   */
  clearNewPostsNotification(): void {
    this.newPostsAvailable$.next(false);
  }

  /**
   * Get user's selected hobbies
   */
  getUserHobbies(): Observable<Array<{ id: number; name: string; icon?: string }>> {
    const token = localStorage.getItem('mbiu-token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    });

    return this.http.get<{ hobbies: Array<{ id: number; name: string; icon?: string }> }>(
      `${this.baseUrl}user/hobbies/`,
      { headers }
    ).pipe(
      map(response => response.hobbies || []),
      catchError(error => {
        console.error('❌ Hobbies fetch error:', error);
        return [];
      })
    );
  }
}