import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { FeedService, FeedPost, UnifiedFeedResponse } from '@app/services/feed.service';
import { AuthenticationService } from '@app/services/authentication.service';
import { PostComposerComponent } from '@app/components/post-composer/post-composer.component';
import { FeedCardComponent } from '@app/components/feed-card/feed-card.component';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PostComposerComponent, FeedCardComponent],
  template: `
    <div class="min-h-full pb-4 sm:pb-6">
      <!-- Simple Page Title -->
      <div class="mb-4 sm:mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-[#0b4d57]">Vibes & Activities</h1>
        <p class="text-gray-600 text-sm mt-1">Discover and share activities with your community</p>
      </div>


      <!-- Filter Chips for Feed -->
      <div class="mb-4 sm:mb-6 relative z-10">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filter by Hobby</h2>
          <span *ngIf="selectedFilter !== null" class="text-xs text-gray-500">
            {{ getFilteredPostsCount() }} posts
          </span>
        </div>
        <div
          *ngIf="hobbies.length > 0 && !noHobbiesSelected"
          class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
          role="tablist"
          aria-label="Feed filters"
        >
          <button
            (click)="selectFilter(null)"
            [class.bg-gradient-to-r]="selectedFilter === null"
            [class.from-[#70AEB9]]="selectedFilter === null"
            [class.to-[#4ECDC4]]="selectedFilter === null"
            [class.text-white]="selectedFilter === null"
            [class.shadow-md]="selectedFilter === null"
            [class.scale-105]="selectedFilter === null"
            [class.bg-white]="selectedFilter !== null"
            [class.text-gray-700]="selectedFilter !== null"
            class="flex-shrink-0 px-4 py-2 rounded-full font-medium text-sm border border-gray-200 transition-all duration-200 hover:border-[#70AEB9] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
            role="tab"
            [attr.aria-selected]="selectedFilter === null"
          >
            All
          </button>
          <button
            *ngFor="let hobby of hobbies"
            (click)="selectFilter(hobby.id)"
            [class.bg-gradient-to-r]="selectedFilter === hobby.id"
            [class.from-[#70AEB9]]="selectedFilter === hobby.id"
            [class.to-[#4ECDC4]]="selectedFilter === hobby.id"
            [class.text-white]="selectedFilter === hobby.id"
            [class.shadow-md]="selectedFilter === hobby.id"
            [class.scale-105]="selectedFilter === hobby.id"
            [class.bg-white]="selectedFilter !== hobby.id"
            [class.text-gray-700]="selectedFilter !== hobby.id"
            class="flex-shrink-0 px-4 py-2.5 rounded-full font-medium text-sm border border-gray-200 transition-all duration-200 hover:border-[#70AEB9] hover:scale-105 active:scale-95 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 max-w-[180px]"
            role="tab"
            [attr.aria-selected]="selectedFilter === hobby.id"
          >
            <span *ngIf="hobby.icon" class="text-base flex-shrink-0 leading-none">{{ hobby.icon }}</span>
            <span class="truncate leading-none">{{ hobby.name }}</span>
          </button>
        </div>
      </div>

      <!-- New Posts Notification -->
      <div
        *ngIf="hasNewPosts"
        class="mb-4 animate-slideDown"
        role="status"
        aria-live="polite"
      >
            <button 
          (click)="loadNewPosts()"
          class="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
          New posts available • Tap to refresh
            </button>
          </div>

      <!-- Offline Banner -->
      <div
        *ngIf="isOffline"
        class="mb-4 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex items-center gap-3"
        role="alert"
      >
        <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
        <span>You're offline. Showing cached posts.</span>
              </div>

      <!-- Post Composer -->
      <app-post-composer
        *ngIf="!noHobbiesSelected"
        (postCreated)="onPostCreated()"
      ></app-post-composer>


      <!-- Empty State: No Hobbies -->
      <div
        *ngIf="noHobbiesSelected"
        class="py-12 sm:py-16 text-center animate-fadeIn"
      >
        <div class="max-w-md mx-auto px-4">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#70AEB9]/20 to-[#4ECDC4]/20 flex items-center justify-center">
            <svg class="w-10 h-10 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Choose Your Hobbies</h2>
          <p class="text-gray-600 mb-6">
            Select hobbies you're interested in to see posts from people who share your passions!
          </p>
          <button
            (click)="goToHobbySelection()"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
          >
            Select Hobbies
          </button>
                </div>
              </div>

      <!-- Empty State: No Posts -->
      <div
        *ngIf="!noHobbiesSelected && !loading && posts.length === 0"
        class="py-12 sm:py-16 text-center animate-fadeIn"
      >
        <div class="max-w-md mx-auto px-4">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#70AEB9]/20 to-[#4ECDC4]/20 flex items-center justify-center">
            <svg class="w-10 h-10 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Be the First!</h2>
          <p class="text-gray-600 mb-6">
            No posts yet. Share something awesome and start the conversation! 🌟
          </p>
        </div>
              </div>

      <!-- Feed Posts -->
      <div
        *ngIf="!noHobbiesSelected && posts.length > 0"
        class="space-y-3 sm:space-y-4"
        role="feed"
        aria-busy="loading"
      >
        <app-feed-card
          *ngFor="let post of posts; trackBy: trackByPostId"
          [post]="post"
          (like)="onLike($event)"
          (unlike)="onUnlike($event)"
          (comment)="onComment($event)"
          (delete)="onDelete($event)"
        ></app-feed-card>
              </div>

      <!-- Loading Spinner -->
      <div
        *ngIf="loading"
        class="py-8 flex justify-center"
        role="status"
        aria-live="polite"
      >
        <div class="flex flex-col items-center gap-3">
          <svg class="animate-spin h-10 w-10 text-[#70AEB9]" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-600 text-sm">Loading feed...</span>
            </div>
          </div>

      <!-- End of Feed Message -->
      <div
        *ngIf="!loading && posts.length > 0 && !hasMorePosts"
        class="py-8 text-center animate-fadeIn"
      >
        <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>You're all caught up! 🎉</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out;
    }
    .animate-slideDown {
      animation: slideDown 0.3s ease-out;
    }
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  private readonly feedService = inject(FeedService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);

  posts: FeedPost[] = [];
  hobbies: Array<{ id: number; name: string; icon?: string }> = [];
  selectedFilter: number | null = null;
  loading = false;
  hasMorePosts = true;
  currentPage = 1;
  isOffline = false;
  hasNewPosts = false;
  noHobbiesSelected = false;

  // User info for header
  currentUserId: number = 0;
  currentUserAvatar: string = '';


  private subscriptions: Subscription[] = [];
  private isLoadingMore = false;

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkOnlineStatus();
    this.loadHobbies();
    this.loadFeed();
    this.subscribeToNewPosts();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  loadUserInfo(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.currentUserId = user.id;
      this.currentUserAvatar = user.profile_image;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('online', () => this.handleOnline());
    window.removeEventListener('offline', () => this.handleOffline());
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.isNearBottom() && !this.loading && this.hasMorePosts && !this.isLoadingMore) {
      this.loadMorePosts();
    }
  }

  loadHobbies(): void {
    this.feedService.getUserHobbies().subscribe({
      next: (hobbies) => {
        this.hobbies = hobbies;
        this.noHobbiesSelected = hobbies.length === 0;
      },
      error: (error) => {
        console.error('Failed to load hobbies:', error);
      }
    });
  }

  loadFeed(page: number = 1): void {
    this.loading = true;
    
    // Convert null to undefined for the API call
    const hobbyFilter = this.selectedFilter !== null ? this.selectedFilter : undefined;
    
    console.log('Loading feed with filter:', hobbyFilter); // Debug log
    
    this.feedService.getUnifiedFeed(page, 20, hobbyFilter).subscribe({
      next: (response: UnifiedFeedResponse) => {
        if (page === 1) {
          this.posts = response.results;
        } else {
          this.posts = [...this.posts, ...response.results];
        }
        this.hasMorePosts = !!response.next;
        this.currentPage = page;
        this.loading = false;
        this.isLoadingMore = false;

        // Cache posts for offline access
        this.cachePosts(this.posts);
      },
      error: (error) => {
        console.error('Failed to load feed:', error);
        this.loading = false;
        this.isLoadingMore = false;

        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else if (!navigator.onLine) {
          this.loadCachedPosts();
        } else {
          this.snackBar.open('Failed to load feed. Please try again.', 'Retry', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }).onAction().subscribe(() => {
            this.loadFeed(page);
          });
        }
      }
    });
  }

  loadMorePosts(): void {
    if (!this.hasMorePosts || this.isLoadingMore) return;
    this.isLoadingMore = true;
    this.loadFeed(this.currentPage + 1);
  }

  loadNewPosts(): void {
    this.hasNewPosts = false;
    this.feedService.clearNewPostsNotification();
    this.loadFeed(1);
  }

  selectFilter(hobbyId: number | null): void {
    if (this.selectedFilter === hobbyId) {
      // Already selected, do nothing
      return;
    }

    console.log('Filter changed to:', hobbyId); // Debug log

    this.selectedFilter = hobbyId;
    this.currentPage = 1;
    this.hasMorePosts = true;
    this.posts = [];
    this.loading = true;
    
    // Scroll to top of feed smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Show feedback
    const hobbyName = hobbyId !== null
      ? this.hobbies.find(h => h.id === hobbyId)?.name || 'hobby'
      : 'all hobbies';
    
    this.snackBar.open(
      `Filtering by ${hobbyName}`, 
      '', 
      { 
        duration: 1500, 
        horizontalPosition: 'center', 
        verticalPosition: 'bottom' 
      }
    );
    
    this.loadFeed(1);
  }

  getFilteredPostsCount(): number {
    return this.posts.length;
  }

  onPostCreated(): void {
    this.loadFeed(1);
  }

  onLike(postId: number): void {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    post.is_liked = true;
    post.likes_count++;

    this.feedService.likePost(postId).subscribe({
      next: (response) => {
        post.likes_count = response.likes_count;
      },
      error: (error) => {
        console.error('Failed to like post:', error);
        // Revert optimistic update
        post.is_liked = false;
        post.likes_count--;
        this.snackBar.open('Failed to like post', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  onUnlike(postId: number): void {
    const post = this.posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    post.is_liked = false;
    post.likes_count--;

    this.feedService.unlikePost(postId).subscribe({
      next: (response) => {
        post.likes_count = response.likes_count;
      },
      error: (error) => {
        console.error('Failed to unlike post:', error);
        // Revert optimistic update
        post.is_liked = true;
        post.likes_count++;
        this.snackBar.open('Failed to unlike post', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  onComment(postId: number): void {
    // TODO: Open comment dialog or navigate to detail view
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

  goToHobbySelection(): void {
    // TODO: Navigate to hobby selection page
    this.router.navigate(['/app/profile', 'hobbies']);
  }

  subscribeToNewPosts(): void {
    const sub = this.feedService.newPostsNotification$.subscribe(hasNew => {
      this.hasNewPosts = hasNew;
    });
    this.subscriptions.push(sub);
  }

  checkOnlineStatus(): void {
    this.isOffline = !navigator.onLine;
  }

  handleOnline(): void {
    this.isOffline = false;
    this.loadFeed(1);
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


  isNearBottom(): boolean {
    const threshold = 300;
    const position = window.scrollY + window.innerHeight;
    const height = document.documentElement.scrollHeight;
    return position > height - threshold;
  }

  trackByPostId(index: number, post: FeedPost): number {
    return post.id;
  }
}