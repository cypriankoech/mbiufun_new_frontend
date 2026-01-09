import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

import { FeedService, FeedPost, UnifiedFeedResponse } from '@app/services/feed.service';
import { GamesService } from '@app/services/games.service';
import { Game } from '@app/models/game';
import { PostComposerComponent } from '@app/components/post-composer/post-composer.component';
import { FeedCardComponent } from '@app/components/feed-card/feed-card.component';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule, PostComposerComponent, FeedCardComponent],
  templateUrl: './activity-detail.component.html',
  styleUrls: ['./activity-detail.component.scss']
})
export class ActivityDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly feedService = inject(FeedService);
  private readonly gamesService = inject(GamesService);
  private readonly snackBar = inject(MatSnackBar);

  currentActivity: Game | null = null;
  posts: FeedPost[] = [];
  loading = false;
  hasMorePosts = true;
  currentPage = 1;
  isOffline = false;
  hasNewPosts = false;

  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.checkOnlineStatus();
    this.loadActivity();
    this.loadActivityPosts();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
  }

  private loadActivity(): void {
    const activityId = this.route.snapshot.params['activityId'];

    if (!activityId) {
      console.error('No activity ID provided');
      this.goBack();
      return;
    }

    // First try to get from sessionStorage
    const storedActivity = sessionStorage.getItem('selectedActivity');
    if (storedActivity) {
      try {
        const activity = JSON.parse(storedActivity) as Game;
        if (activity && activity.id === +activityId) {
          this.currentActivity = activity;
          return;
        }
      } catch (error) {
        console.error('Error parsing stored activity:', error);
      }
    }

    // Fallback to API call
    this.gamesService.getGameById(+activityId).subscribe({
      next: (activity) => {
        this.currentActivity = activity;
      },
      error: (error) => {
        console.error('Error loading activity:', error);
        this.snackBar.open('Failed to load activity', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.goBack();
      }
    });
  }

  private loadActivityPosts(page: number = 1): void {
    this.loading = true;
    console.log('🔄 Loading posts - page:', page, 'activity:', this.currentActivity?.id);

    // Filter posts by the current activity
    this.feedService.getUnifiedFeed(page, 20, undefined, this.currentActivity?.id).subscribe({
      next: (response: UnifiedFeedResponse) => {
        console.log('✅ Posts loaded successfully:', response);
        console.log('📊 Number of posts:', response.results?.length);
        
        if (page === 1) {
          this.posts = response.results;
        } else {
          this.posts = [...this.posts, ...response.results];
        }
        this.hasMorePosts = !!response.next;
        this.currentPage = page;
        this.loading = false;
        
        console.log('📝 Total posts in component:', this.posts.length);
      },
      error: (error) => {
        console.error('❌ Failed to load posts:', error);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error message:', error.message);
        this.loading = false;

        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else if (!navigator.onLine) {
          this.loadCachedPosts();
        } else {
          this.snackBar.open('Failed to load posts. Please try again.', 'Retry', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }).onAction().subscribe(() => {
            this.loadActivityPosts(page);
          });
        }
      }
    });
  }

  loadMorePosts(): void {
    if (!this.hasMorePosts || this.loading) return;
    this.loadActivityPosts(this.currentPage + 1);
  }

  onPostCreated(): void {
    console.log('📝 Post created on activity page, currentActivity:', this.currentActivity);
    this.loadActivityPosts(1);
  }

  onComment(postId: number): void {
    console.log('Comment on post:', postId);
    this.snackBar.open('Comments coming soon! 💬', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  onDelete(postId: number): void {
    this.feedService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter(p => p.id !== postId);
        this.snackBar.open('Post deleted', 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      },
      error: (error) => {
        console.error('Failed to delete post:', error);
        this.snackBar.open('Failed to delete post', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/activities']);
  }

  checkOnlineStatus(): void {
    this.isOffline = !navigator.onLine;
  }

  handleOnline(): void {
    this.isOffline = false;
    this.loadActivityPosts(1);
    this.snackBar.open('Back online! 🎉', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  handleOffline(): void {
    this.isOffline = true;
    this.loadCachedPosts();
  }

  cachePosts(posts: FeedPost[]): void {
    try {
      localStorage.setItem('cached_feed', JSON.stringify(posts));
    } catch (e) {
      console.error('Failed to cache posts:', e);
    }
  }

  loadCachedPosts(): void {
    try {
      const cached = localStorage.getItem('cached_feed');
      if (cached) {
        this.posts = JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to load cached posts:', e);
    }
  }

  trackByPostId(index: number, post: FeedPost): number {
    return post.id;
  }
}
