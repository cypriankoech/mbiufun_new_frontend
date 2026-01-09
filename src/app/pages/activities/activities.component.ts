import { Component, OnInit, OnDestroy, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
        <h1 class="text-2xl sm:text-3xl font-bold text-[#0b4d57] mb-1">Activities & Vibes</h1>
        <p class="text-gray-600 text-sm sm:text-base">Discover activities and connect with your community</p>
      </div>

      <!-- Activities Grid -->
      <div class="space-y-6">
      <div class="space-y-6">
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

        <!-- Filters Row -->
        <div class="mb-4 flex flex-col sm:flex-row gap-3">
          <!-- Search Chip -->
          <div *ngIf="isVibesSearching" class="flex items-center gap-2">
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

          <!-- Activity Filter -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-gray-700">Filter by Activity:</label>
            <select
              [(ngModel)]="selectedActivityFilter"
              (ngModelChange)="onActivityFilterChange($event)"
              class="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#70AEB9] focus:border-transparent"
            >
              <option [value]="null">All Activities</option>
              <option *ngFor="let game of allGames" [value]="game.id">{{ game.name }}</option>
            </select>
          </div>
        </div>

        <!-- Games Grid -->
        <div *ngIf="displayedVibesGames.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          <div
            *ngFor="let game of displayedVibesGames"
            class="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg flex flex-col"
            (click)="goToActivityDetail(game)"
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
                  {{ game.game_mode === 'non_competitive' ? 'Vibes' : 'Competitive' }}
                </span>
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
          <p class="text-gray-600 text-lg font-semibold mb-2">No Activities Selected Yet</p>
          <p class="text-gray-500 text-sm mb-6">Choose your favorite activities to get started!</p>
          <button (click)="updateSelectedVibes()" class="px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 font-semibold">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Select Activities</span>
          </button>
        </div>

        <!-- Post Composer -->
        <div *ngIf="selectedActivityFilter" class="mt-6">
          <app-post-composer
            [activityId]="selectedActivityFilter"
            (postCreated)="onPostCreated()">
          </app-post-composer>
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
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthenticationService);
  private readonly dialog = inject(MatDialog);

  posts: FeedPost[] = [];
  loading = false;
  targetPostId: number | null = null;

  // Vibes related properties
  vibesGames: Game[] = [];
  selectedVibes: Game[] = [];
  vibesSearchText = '';
  vibesLoading = false;
  hasMorePosts = true;
  currentPage = 1;
  isOffline = false;
  hasNewPosts = false;

  // Activity filtering
  allGames: Game[] = [];
  selectedActivityFilter: number | null = null;

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
    this.loadAllGames();

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Check for postId query parameter to scroll to specific post
    this.route.queryParams.subscribe(params => {
      if (params['postId']) {
        this.targetPostId = parseInt(params['postId']);
        // Try to scroll immediately, and also after feed loads
        if (this.targetPostId) {
          setTimeout(() => this.scrollToPost(this.targetPostId!), 500);
        }
      }
    });
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
    
    // Convert null to 'all' for "All Activities" option
    const activityParam = this.selectedActivityFilter === null ? 'all' : this.selectedActivityFilter;
    this.feedService.getUnifiedFeed(page, 20, undefined, activityParam).subscribe({
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

        // Check if we need to scroll to a specific post
        this.checkForPostIdScroll();
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

  loadAllGames(): void {
    this.gamesService.getGames().subscribe({
      next: (games) => {
        this.allGames = games;
      },
      error: (error) => {
        console.error('Failed to load all games:', error);
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

  onActivityFilterChange(activityId: number | null): void {
    this.selectedActivityFilter = activityId;
    this.loadFeed(1); // Reload feed with new filter
  }

  onPostCreated(): void {
    // Reload the feed to show the new post
    this.loadFeed(1);
  }

  goToActivityDetail(game: Game) {
    console.log('Navigating to activity detail for:', game);

    // Store the activity data in sessionStorage for the detail page
        sessionStorage.setItem('selectedActivity', JSON.stringify(game));

    // Navigate to activity detail page
    this.router.navigate(['/app/activity-detail', game.id]);
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

  private checkForPostIdScroll(): void {
    if (this.targetPostId) {
      // Small delay to ensure DOM is updated
      setTimeout(() => this.scrollToPost(this.targetPostId), 100);
    }
  }

  private scrollToPost(postId: number | null): void {
    if (!postId) return;

    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
      postElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      // Add a highlight effect
      postElement.classList.add('ring-4', 'ring-[#70AEB9]', 'ring-opacity-50');
      setTimeout(() => {
        postElement.classList.remove('ring-4', 'ring-[#70AEB9]', 'ring-opacity-50');
      }, 3000);
      // Clear the target post ID and URL parameter
      this.targetPostId = null;
      this.router.navigate([], {
        queryParams: { postId: null },
        queryParamsHandling: 'merge'
      });
    } else {
      console.log(`Post ${postId} not found in current feed, might be on another page`);
    }
  }
}