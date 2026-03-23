import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { AuthenticationService } from './authentication.service';

export interface Activity {
  id: number;
  title: string;
  description: string;
  category: 'social' | 'entertainment' | 'outdoor' | 'sports' | 'wellness' | 'learning';
  location: string;
  date: string;
  time: string;
  link?: string;
  host: {
    id: number;
    username: string;
    profile_image?: string;
  };
  participants_count: number;
  max_participants?: number;
  hobby?: {
    id: number;
    name: string;
    icon?: string;
  };
  image_url?: string;
  is_joined: boolean;
  created_at: string;
}

export interface CreateActivityPayload {
  event_title: string;
  text: string; // description
  event_date: string;
  event_time: string;
  event_link?: string;
  hobby_id?: number;
  post_type: 'event';
}

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthenticationService);
  private baseUrl = `${environment.apiUrl}api/v1/`;

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'mbiu-token': token
    });
  }

  /**
   * Get all activities (event-type posts)
   * Uses the existing posts/unified_feed endpoint filtered by post_type=event
   */
  getActivities(params?: {
    page?: number;
    per_page?: number;
    hobby_id?: number;
    location?: string;
    date_filter?: 'today' | 'weekend' | 'week';
  }): Observable<{ results: Activity[]; next: string | null; count: number }> {
    let httpParams = new HttpParams();
    
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.per_page) httpParams = httpParams.set('per_page', params.per_page.toString());
    if (params?.hobby_id) httpParams = httpParams.set('hobby_id', params.hobby_id.toString());
    
    // Add post_type filter for events
    httpParams = httpParams.set('post_type', 'event');

    return this.http.get<any>(`${this.baseUrl}posts/unified_feed/`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      map(response => {
        // Transform backend posts to Activity format
        const activities = (response.results || []).map((post: any) => this.transformPostToActivity(post));
        
        // Apply client-side filters if needed
        let filtered = activities;
        
        if (params?.location) {
          filtered = filtered.filter((a: Activity) => 
            a.location?.toLowerCase().includes(params.location!.toLowerCase())
          );
        }

        if (params?.date_filter) {
          filtered = this.filterByDate(filtered, params.date_filter);
        }

        return {
          results: filtered,
          next: response.next,
          count: filtered.length
        };
      })
    );
  }

  /**
   * Create a new activity (event post)
   */
  createActivity(formData: FormData): Observable<Activity> {
    return this.http.post<any>(`${this.baseUrl}posts/create/`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authService.getToken()}`,
        'mbiu-token': this.authService.getToken()
      })
    }).pipe(
      map(response => this.transformPostToActivity(response.data || response))
    );
  }

  /**
   * Join an activity (like the post to express interest)
   */
  joinActivity(activityId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}likes/toggle/`, 
      { post_id: activityId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Leave an activity (unlike the post)
   */
  leaveActivity(activityId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}likes/toggle/`, 
      { post_id: activityId },
      { headers: this.getHeaders() }
    );
  }

  /**
   * Transform backend post to Activity interface
   */
  private transformPostToActivity(post: any): Activity {
    // Infer category from hobby or default to 'social'
    let category: Activity['category'] = 'social';
    if (post.hobby?.name) {
      const hobbyName = post.hobby.name.toLowerCase();
      if (hobbyName.includes('sport') || hobbyName.includes('game')) category = 'sports';
      else if (hobbyName.includes('music') || hobbyName.includes('art')) category = 'entertainment';
      else if (hobbyName.includes('hike') || hobbyName.includes('outdoor')) category = 'outdoor';
      else if (hobbyName.includes('yoga') || hobbyName.includes('wellness')) category = 'wellness';
      else if (hobbyName.includes('learn') || hobbyName.includes('study')) category = 'learning';
    }

    return {
      id: post.id,
      title: post.event_details?.title || post.name || 'Activity',
      description: post.text || post.description || '',
      category,
      location: this.extractLocation(post.text || post.description || ''),
      date: post.event_details?.date || post.created_at?.split('T')[0] || '',
      time: post.event_details?.time || '',
      link: post.event_details?.link,
      host: {
        id: post.user?.id || post.author?.id || 0,
        username: post.user?.username || post.author?.username || 'Unknown',
        profile_image: post.user?.profile_image || post.author?.profile_image
      },
      participants_count: post.likes_count || 0,
      hobby: post.hobby,
      image_url: post.post_img || post.media?.[0],
      is_joined: post.is_liked || false,
      created_at: post.created_at
    };
  }

  /**
   * Extract location from text (simple regex for now)
   */
  private extractLocation(text: string): string {
    // Look for common location patterns
    const locationMatch = text.match(/(?:@|at|in)\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z][a-zA-Z\s]+)?)/);
    if (locationMatch) return locationMatch[1].trim();
    
    // Default locations for Kenya
    const kenyaLocations = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];
    for (const loc of kenyaLocations) {
      if (text.includes(loc)) return loc;
    }
    
    return 'Kenya';
  }

  /**
   * Filter activities by date
   */
  private filterByDate(activities: Activity[], filter: 'today' | 'weekend' | 'week'): Activity[] {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.date);
      const dayOfWeek = activityDate.getDay(); // 0 = Sunday, 6 = Saturday
      
      if (filter === 'today') {
        return activity.date === today;
      }
      
      if (filter === 'weekend') {
        return dayOfWeek === 0 || dayOfWeek === 6;
      }
      
      if (filter === 'week') {
        const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return activityDate >= now && activityDate <= oneWeekFromNow;
      }
      
      return true;
    });
  }

  /**
   * Get mock activities for demonstration (fallback when no events exist)
   */
  getMockActivities(): Activity[] {
    return [
      {
        id: 1,
        title: 'Morning Run at Karura Forest',
        description: 'Join us for an easy-paced 5km loop through Karura. All fitness levels welcome! We meet at the main gate.',
        category: 'outdoor',
        location: 'Nairobi',
        date: this.getTodayDate(),
        time: '07:00 AM',
        host: {
          id: 1,
          username: 'runner_ke',
          profile_image: 'https://ui-avatars.com/api/?name=Runner+KE&background=70AEB9&color=fff'
        },
        participants_count: 12,
        max_participants: 20,
        hobby: { id: 1, name: 'Running', icon: '🏃' },
        is_joined: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Board Game Night',
        description: 'Catan, Ticket to Ride, and more! Snacks and drinks provided. RSVP to confirm your spot.',
        category: 'entertainment',
        location: 'Westlands',
        date: this.getWeekendDate(),
        time: '06:00 PM',
        link: 'https://meet.google.com/abc-defg-hij',
        host: {
          id: 2,
          username: 'boardgame_master',
          profile_image: 'https://ui-avatars.com/api/?name=Game+Master&background=4ECDC4&color=fff'
        },
        participants_count: 8,
        max_participants: 12,
        hobby: { id: 2, name: 'Board Games', icon: '🎲' },
        is_joined: true,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'Coffee & Create',
        description: 'Casual meet-up for creatives. Bring your projects, share ideas, get feedback. Great coffee guaranteed!',
        category: 'social',
        location: 'Kilimani',
        date: this.getTodayDate(),
        time: '04:00 PM',
        host: {
          id: 3,
          username: 'creative_hub',
          profile_image: 'https://ui-avatars.com/api/?name=Creative+Hub&background=FFD700&color=000'
        },
        participants_count: 15,
        hobby: { id: 3, name: 'Art', icon: '🎨' },
        is_joined: false,
        created_at: new Date().toISOString()
      }
    ];
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getWeekendDate(): string {
    const now = new Date();
    const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
    const saturday = new Date(now.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000);
    return saturday.toISOString().split('T')[0];
  }
}

