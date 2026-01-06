import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map, switchMap } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuthenticationService } from '@app/services/authentication.service';

// Backend response structure
interface BackendPost {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    profile_image?: string;
  };
  text: string;
  hobby?: {
    id: number;
    name: string;
    icon?: string;
  };
  post_img?: string;
  image_urls?: string[];
  location?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    google_place_id: string;
  };
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
  bubble_tags?: {
    id: string;
    name: string;
  }[];
}

// Frontend interface
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
  image_urls?: string[];
  location?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    google_place_id: string;
  };
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
  bubble_tags?: {
    id: string;
    name: string;
  }[];
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
  images?: File[]; // TODO: Backend currently only supports single image
  location?: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    google_place_id: string;
  };
  visibility?: {
    is_public: boolean;
    bubbles: string[];
    individuals: number[];
    groups: number[];
  };
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
  private readonly authService = inject(AuthenticationService);
  
  // Subject to notify components of new posts
  private newPostsAvailable$ = new BehaviorSubject<boolean>(false);
  public newPostsNotification$ = this.newPostsAvailable$.asObservable();

  /**
   * Fetch unified feed (hobby posts + friend posts)
   */
  getUnifiedFeed(page: number = 1, perPage: number = 20, hobbyFilter?: number): Observable<UnifiedFeedResponse> {
    const token = this.authService.getToken();
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    if (hobbyFilter !== undefined && hobbyFilter !== null) {
      params = params.set('hobby_id', hobbyFilter.toString());
      console.log('🔍 Filtering feed by hobby_id:', hobbyFilter);
    } else {
      console.log('🔍 Loading all hobbies (no filter)');
    }

    const fullUrl = `${this.baseUrl}posts/unified_feed/?${params.toString()}`;
    console.log('📡 Full API URL:', fullUrl);

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    // Primary: enhanced unified feed
    return this.http.get<{ results: BackendPost[]; next?: string; previous?: string; count: number }>(
      `${this.baseUrl}posts/unified_feed/`,
      { headers, params }
    ).pipe(
      map(response => {
        console.log(`✅ Feed loaded: ${response.results.length} posts`);
        return {
          results: response.results.map(post => this.mapBackendToFrontend(post)),
          next: response.next,
          previous: response.previous,
          count: response.count
        };
      }),
      tap(data => {
        if (hobbyFilter) {
          console.log('📊 Posts with hobby filter:', data.results.map(p => ({ 
            id: p.id, 
            hobby: p.hobby?.name || 'none',
            is_friend: p.is_friend_post 
          })));
        }
      }),
      catchError(error => {
        // Fallback to legacy feed if server errors (e.g., DB schema mismatch)
        if (error && error.status && error.status >= 500) {
          console.warn('Unified feed failed, falling back to legacy posts/feed/ endpoint.');
          // Include hobby_id in fallback if present
          let legacyParams = new HttpParams().set('page', page.toString()).set('per_page', perPage.toString());
          if (hobbyFilter) legacyParams = legacyParams.set('hobby_id', hobbyFilter.toString());
          return this.http.get<{ data: BackendPost[] }>(
            `${this.baseUrl}posts/feed/`,
            { headers, params: legacyParams }
          ).pipe(
            map(legacy => ({
              results: (legacy.data || []).map(post => this.mapBackendToFrontend(post)),
              next: undefined,
              previous: undefined,
              count: (legacy.data || []).length
            }))
          );
        }
        console.error('Feed fetch error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Map backend post structure to frontend interface
   */
  private mapBackendToFrontend(backendPost: BackendPost): FeedPost {
    return {
      id: backendPost.id,
      author: {
        id: backendPost.user.id,
        first_name: backendPost.user.first_name,
        last_name: backendPost.user.last_name,
        profile_image: backendPost.user.profile_image
      },
      caption: backendPost.text,
      hobby: backendPost.hobby,
      // Prioritize image_urls array, fallback to post_img for backward compatibility
      image_urls: backendPost.image_urls && backendPost.image_urls.length > 0 
        ? backendPost.image_urls 
        : (backendPost.post_img ? [backendPost.post_img] : []),
      location: backendPost.location,
      created_at: backendPost.created_at,
      likes_count: backendPost.likes_count,
      comments_count: backendPost.comments_count,
      is_liked: backendPost.is_liked,
      is_friend_post: backendPost.is_friend_post,
      post_type: backendPost.post_type,
      event_details: backendPost.event_details,
      bubble_tags: backendPost.bubble_tags
    };
  }

  /**
   * Get user's active post count
   */
  getUserActivePostCount(): Observable<{ count: number; limit: number }> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
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
    const token = this.authService.getToken();

    if (!token) {
      console.warn('No authentication token found');
      return throwError(() => ({ status: 401, error: { error: 'Session expired. Please log in again.' } }));
    }

    const requestUrl = `${this.baseUrl}posts/create/`;
    console.log('Making POST request to:', requestUrl);
    console.log('Token present:', !!token);

    // If there are images, use FormData
    if (payload.images && payload.images.length > 0) {
      const formData = new FormData();
      formData.append('caption', payload.caption);
      if (payload.hobby_id !== null && payload.hobby_id !== undefined) {
        formData.append('hobby_id', payload.hobby_id.toString());
      }
      // Send location as JSON string if present
      if (payload.location) {
        formData.append('location', JSON.stringify(payload.location));
      }
      // Send visibility as JSON string if present
      if (payload.visibility) {
        formData.append('visibility', JSON.stringify(payload.visibility));
      }
      // Send multiple images with indexed names
      payload.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });

      console.log('📦 Sending FormData with image');
      console.log('📍 Location being sent:', payload.location);
      for (const [key, value] of (formData as any).entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File: ${value.name} (${value.size} bytes)` : value);
      }

      const headers = new HttpHeaders({
        'mbiu-token': token || '',
        'Authorization': `Bearer ${token}`
      });

      return this.http.post<BackendPost>(
        requestUrl,
        formData,
        { headers }
      ).pipe(
        tap(backendPost => {
          console.log('✅ Backend response:', backendPost);
          console.log('📍 Location in response:', backendPost.location);
        }),
        map(backendPost => this.mapBackendToFrontend(backendPost)),
        tap(mappedPost => {
          console.log('🗺️ Mapped post:', mappedPost);
          console.log('📍 Location in mapped post:', mappedPost.location);
          console.log('Post created successfully');
          this.notifyNewPosts();
        }),
        catchError(error => {
          console.error('Post creation error:', error);
          return throwError(() => error);
        })
      );
    } else {
      // No image, send as JSON
      const jsonData = {
        caption: payload.caption,
        ...(payload.hobby_id !== null && payload.hobby_id !== undefined && { hobby_id: payload.hobby_id }),
        ...(payload.location && { location: payload.location }),
        ...(payload.visibility && { visibility: payload.visibility })
      };

      console.log('Sending JSON data:', jsonData);

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'mbiu-token': token,
        'Authorization': `Bearer ${token}`
      });

      return this.http.post<BackendPost>(
        requestUrl,
        jsonData,
        { headers }
      ).pipe(
        map(backendPost => this.mapBackendToFrontend(backendPost)),
        tap(() => {
          console.log('Post created successfully');
          this.notifyNewPosts();
        }),
        catchError(error => {
          console.error('Post creation error:', error);
          return throwError(() => error);
        })
      );
    }
  }

  /**
   * Generate AI caption suggestions
   */
  getAICaptionSuggestions(context?: string): Observable<AICaptionSuggestion[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post<{ suggestions: AICaptionSuggestion[] }>(
      `${this.baseUrl}posts/ai_captions/`,
      { context },
      { headers }
    ).pipe(
      map(response => response.suggestions),
      catchError(error => {
        console.error('❌ AI caption error:', error);
        return of([
          { text: 'Just shared something awesome! ✨', tone: 'excited' as const },
          { text: 'Loving this moment 💙', tone: 'casual' as const },
          { text: "Here's what I've been up to lately", tone: 'reflective' as const }
        ]);
      })
    );
  }

  /**
   * Like a post
   */
  likePost(postId: number): Observable<{ likes_count: number }> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post<{ likes_count: number }>(
      `${this.baseUrl}posts/${postId}/like/`,
      {},
      { headers }
    ).pipe(
      tap(() => console.log('Post liked')),
      catchError(error => {
        console.error('Like error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Unlike a post
   */
  unlikePost(postId: number): Observable<{ likes_count: number }> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post<{ likes_count: number }>(
      `${this.baseUrl}posts/${postId}/unlike/`,
      {},
      { headers }
    ).pipe(
      tap(() => console.log('Post unliked')),
      catchError(error => {
        console.error('Unlike error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add comment to post
   */
  addComment(postId: number, text: string): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.post(
      `${this.baseUrl}posts/${postId}/comment/`,
      { text },
      { headers }
    ).pipe(
      tap(() => console.log('Comment added')),
      catchError(error => {
        console.error('Comment error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a post
   */
  deletePost(postId: number): Observable<void> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.delete<void>(
      `${this.baseUrl}posts/${postId}/delete/`,
      { headers }
    ).pipe(
      tap(() => console.log('Post deleted')),
      catchError(error => {
        console.error('Delete error:', error);
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
   * Get user's selected hobbies/vibes
   */
  getUserHobbies(): Observable<Array<{ id: number; name: string; icon?: string }>> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    return this.http.get<{ hobbies: Array<{ id: number; name: string; icon?: string }> }>(
      `${this.baseUrl}user/hobbies/`,
      { headers }
    ).pipe(
      map(response => response.hobbies || []),
      tap(() => console.log('User hobbies loaded')),
      catchError(error => {
        console.error('Hobbies fetch error:', error);
        return throwError(() => error);
      })
    );
  }
}