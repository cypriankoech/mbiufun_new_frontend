import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { FeedService, FeedPost, UnifiedFeedResponse } from '@app/services/feed.service';
import { AuthenticationService } from '@app/services/authentication.service';
import { GamesService } from '@app/services/games.service';
import { Game, GameMode } from '@app/models/game';
import { PostComposerComponent } from '@app/components/post-composer/post-composer.component';
import { FeedCardComponent } from '@app/components/feed-card/feed-card.component';
import { UpdateVibesDialogComponent } from '@app/components/update-vibes-dialog.component';

@Component({
  selector: 'app-activities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PostComposerComponent, FeedCardComponent],
  template: `
    <div class="min-h-full pb-20 sm:pb-24">
      <!-- Page Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-[#0b4d57] mb-1">Vibes & Activities</h1>
        <p class="text-gray-600 text-sm sm:text-base">Discover activities and connect with your community</p>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-4 sm:mb-6">
        <div class="relative flex bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-1 sm:p-1.5 shadow-inner border border-gray-200/50">
          <!-- Sliding indicator -->
          <div 
            class="absolute top-1 sm:top-1.5 bottom-1 sm:bottom-1.5 transition-all duration-300 ease-out rounded-xl bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] shadow-lg"
            [class.left-1]="activeTab === 'posts'"
            [class.sm:left-1.5]="activeTab === 'posts'"
            [class.right-1]="activeTab === 'vibes'"
            [class.sm:right-1.5]="activeTab === 'vibes'"
            [style.width]="'calc(50% - 0.5rem)'"
            [style.width.sm]="'calc(50% - 0.75rem)'"
          ></div>
          
          <button
            (click)="activeTab = 'posts'"
            [class.text-white]="activeTab === 'posts'"
            [class.text-gray-600]="activeTab !== 'posts'"
            class="relative z-10 flex-1 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 focus:outline-none flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 touch-manipulation min-h-[48px]"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span class="leading-none">Posts</span>
          </button>
          
          <button
            (click)="activeTab = 'vibes'"
            [class.text-white]="activeTab === 'vibes'"
            [class.text-gray-600]="activeTab !== 'vibes'"
            class="relative z-10 flex-1 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 focus:outline-none flex items-center justify-center gap-1.5 sm:gap-2 active:scale-95 touch-manipulation min-h-[48px]"
          >
            <svg class="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="leading-none">Vibes</span>
          </button>
        </div>
      </div>

      <!-- Posts Tab Content -->
      <div *ngIf="activeTab === 'posts'" class="space-y-6">
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
        <div class="mb-6 sm:mb-8">
          <app-post-composer
            (postCreated)="onPostCreated()"
          ></app-post-composer>
        </div>

        <!-- Empty State: No Posts -->
        <div
          *ngIf="!loading && posts.length === 0"
          class="py-16 sm:py-20 text-center animate-fadeIn"
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
          *ngIf="posts.length > 0"
          class="space-y-4 sm:space-y-6"
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
        class="py-12 sm:py-16 flex justify-center"
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
          class="py-10 sm:py-12 text-center animate-fadeIn"
        >
          <div class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-50 text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>You're all caught up! 🎉</span>
          </div>
        </div>
      </div>

      <!-- Vibes Tab Content -->
      <div *ngIf="activeTab === 'vibes'" class="space-y-6">
        <!-- Search Bar -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="vibesSearchText"
            (ngModelChange)="updateVibesSearch($event)"
            placeholder="Search for an Activity..."
            class="block w-full bg-white border border-gray-200 rounded-full py-3 pl-10 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#70AEB9] focus:border-transparent transition-all"
          >
        </div>

        <!-- Edit Vibes Button - Always show -->
        <div *ngIf="!isVibesSearching" class="mb-6 flex justify-end">
          <button (click)="updateSelectedVibes()"
                  class="px-4 py-2.5 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-semibold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span class="text-sm">Edit Vibes</span>
          </button>
        </div>

        <!-- Search Chip -->
        <div *ngIf="isVibesSearching" class="mb-4 flex items-center gap-2">
          <span class="inline-flex items-center px-3 py-1 rounded-full bg-[#70AEB9]/10 text-[#70AEB9] text-sm font-medium">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
            {{ vibesSearchText }}
            <button (click)="clearVibesSearch()" class="ml-2 text-[#70AEB9] hover:text-[#5d96a1] focus:outline-none">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>

        <!-- Games Grid -->
        <div *ngIf="displayedVibesGames.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <div
            *ngFor="let game of displayedVibesGames"
            class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col"
            (click)="goToCreateMatch(game.id, 'non_competitive')"
          >
            <div class="w-full h-32 sm:h-32 md:h-36 flex-shrink-0 bg-gray-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
              <img
                [src]="game.img_url || getTempIcon()"
                [alt]="game.name"
                class="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>

            <div class="p-3 sm:p-4 flex flex-col justify-between flex-grow">
              <div>
                <p class="font-semibold text-gray-800 text-sm sm:text-base break-words leading-tight">{{ game.name }}</p>
              </div>

              <div class="flex items-center justify-between mt-2 sm:mt-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  Vibes
                </span>

                <div class="flex items-center gap-1">
                  <svg class="h-4 w-4 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span class="font-bold text-sm text-gray-700">{{ game.points }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results Message (Search) -->
        <div *ngIf="displayedVibesGames.length === 0 && isVibesSearching" class="flex flex-col items-center justify-center py-12">
          <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <p class="text-gray-500 text-lg">No activities found for "{{ vibesSearchText }}"</p>
          <button (click)="clearVibesSearch()" class="mt-4 px-4 py-2 bg-[#70aeb9] text-white rounded-lg hover:bg-[#5d96a1] transition-colors">Clear Search</button>
        </div>

        <!-- Empty State (No Vibes Selected) -->
        <div *ngIf="displayedVibesGames.length === 0 && !isVibesSearching" class="flex flex-col items-center justify-center py-12">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p class="text-gray-600 text-lg font-semibold mb-2">No Vibes Selected Yet</p>
          <p class="text-gray-500 text-sm mb-6">Choose your favorite activities to get started!</p>
          <button (click)="updateSelectedVibes()" class="px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-semibold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Select Vibes</span>
          </button>
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
  private readonly gamesService = inject(GamesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly dialog = inject(MatDialog);

  posts: FeedPost[] = [];
  activeTab: 'posts' | 'vibes' = 'posts';
  loading = false;

  // Vibes related properties
  vibesGames: Game[] = [];
  selectedVibes: Game[] = [];
  vibesSearchText = '';
  vibesLoading = false;
  hasMorePosts = true;
  currentPage = 1;
  isOffline = false;
  hasNewPosts = false;

  // User info for header
  currentUserId: number = 0;
  currentUserAvatar: string = '';


  private subscriptions: Subscription[] = [];
  private isLoadingMore = false;

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkOnlineStatus();
    this.loadFeed();
    this.subscribeToNewPosts();

    // Load vibes data
    this.loadVibesGames();
    this.loadSelectedVibes();

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


  loadFeed(page: number = 1): void {
    this.loading = true;
    
    this.feedService.getUnifiedFeed(page, 20).subscribe({
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


  // Vibes computed properties
  get isVibesSearching(): boolean {
    return !!this.vibesSearchText && this.vibesSearchText.trim() !== '';
  }

  get displayedVibesGames(): Game[] {
    if (this.isVibesSearching) {
      return this.vibesGames.filter((game: Game) =>
        game.name.toLowerCase().includes(this.vibesSearchText.toLowerCase())
      );
    } else {
      console.log('Displaying selected vibes:', this.selectedVibes);
      return this.selectedVibes;
    }
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

  // Vibes methods
  loadVibesGames(): void {
    this.vibesLoading = true;
    this.gamesService.getNonCompetitiveGames().subscribe({
      next: (games) => {
        this.vibesGames = games.map((game) => ({
          ...game,
          img_url: game.img_url ?? this.getTempIcon()
        }));
        this.vibesLoading = false;
      },
      error: (error) => {
        console.error('Failed to load vibes games:', error);
        this.vibesLoading = false;
      }
    });
  }

  loadSelectedVibes(): void {
    // Fetch fresh user data from API to ensure we have complete vibe information
    this.authService.getUserProfile().subscribe({
      next: (response: any) => {
        const userData = response.data;
        console.log('Loaded fresh user data:', userData);
        console.log('User selected_vibes from API:', userData?.selected_vibes);
        
        if (userData?.selected_vibes && userData.selected_vibes.length > 0) {
          this.selectedVibes = userData.selected_vibes;
          console.log('Using user selected vibes:', this.selectedVibes);
          
          // Update the cached user data
          if (this.authService.currentUserValue) {
            this.authService.currentUserValue.selected_vibes = userData.selected_vibes;
            this.authService.updateUserData(this.authService.currentUserValue);
          }
        } else {
          // If no vibes selected, show empty array
          this.selectedVibes = [];
          console.log('No vibes selected');
        }
      },
      error: (err: any) => {
        console.error('Error loading user vibes:', err);
        // Fallback to cached data if API fails
        const user = this.authService.currentUserValue;
        this.selectedVibes = user?.selected_vibes || [];
      }
    });
  }

  updateVibesSearch(text: string): void {
    this.vibesSearchText = text;
  }

  clearVibesSearch(): void {
    this.vibesSearchText = '';
  }

  goToCreateMatch(gameId: number, gameMode?: GameMode) {
    const queryParams = gameMode ? { game_mode: gameMode } : {};

    this.router.navigate(
      ['/app/create-match', gameId],
      {
        queryParams: queryParams
      }
    );
  }

  updateSelectedVibes(): void {
    // Pass the actual user's selected vibes, not the displayed ones
    const user = this.authService.currentUserValue;
    const currentUserVibes = user?.selected_vibes || [];
    
    console.log('Opening vibes dialog with current user vibes:', currentUserVibes);
    
    this.dialog.open(UpdateVibesDialogComponent, {
      maxWidth: '95vw',
      width: '95vw',
      position: { top: '25%' },
      disableClose: false,
      data: { selectedVibes: currentUserVibes }
    }).afterClosed().subscribe((res: any) => {
      console.log('Vibes dialog closed with result:', res);
      
      if (res && Array.isArray(res)) {
        // Update the displayed vibes
        this.selectedVibes = res;
        
        // Update the current user's selected vibes
        if (this.authService.currentUserValue) {
          this.authService.currentUserValue.selected_vibes = res;
          this.authService.updateUserData(this.authService.currentUserValue);
          console.log('Updated user selected vibes:', res);
        }
        
        // Show success message
        this.snackBar.open('Vibes updated successfully! 🎉', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    });
  }

  getTempIcon(): string {
    const iconsList = Array.from({ length: 20 }, (_, i) => `${i + 1}.svg`);
    const i = Math.floor(Math.random() * iconsList.length);
    return `assets/games/${iconsList[i]}`;
  }
}