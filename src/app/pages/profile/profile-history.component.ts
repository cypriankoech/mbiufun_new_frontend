import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service';
import { Subscription } from 'rxjs';
import { TimelineService, TimelineEntry } from '@app/services/timeline.service';

@Component({
  selector: 'app-profile-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-1">{{ getHistoryTitle() }}</h1>
            <p class="text-gray-600">A timeline of challenges, activities, achievements, and social moments</p>
          </div>
          <button (click)="goBack()" 
                  class="text-[#70AEB9] hover:text-[#5a9aa3] transition-colors duration-200 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Back</span>
          </button>
        </div>

        <!-- Offline banner -->
        <div *ngIf="isOffline" class="mb-4 px-4 py-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 flex items-center gap-3" role="alert">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <span>You are offline. Showing cached items if available.</span>
        </div>

        <!-- Stats snapshot -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ stats.points }}</div>
            <div class="text-gray-600 text-sm">Points earned</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ stats.challenges }}</div>
            <div class="text-gray-600 text-sm">Challenges</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ stats.activities }}</div>
            <div class="text-gray-600 text-sm">Activities</div>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-4 text-center">
            <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ stats.social }}</div>
            <div class="text-gray-600 text-sm">Social</div>
          </div>
        </div>

        <!-- Achievements & badges -->
        <div *ngIf="badges.length > 0" class="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-semibold text-gray-800">Achievements & Badges</h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let b of badges" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm bg-gradient-to-r from-[#70AEB9]/10 to-[#4ECDC4]/10 text-[#0b4d57] border border-[#70AEB9]/20">
              <span *ngIf="b.icon">{{ b.icon }}</span>
              <span class="font-medium">{{ b.name }}</span>
            </span>
          </div>
        </div>

        <div *ngIf="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AEB9] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading activity history...</p>
        </div>

        <div *ngIf="!isLoading && activities.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Your journey is just beginning</h3>
          <p class="text-gray-600">{{ isOwnProfile ? 'Complete a Daily Dare or join an Activity to start building your Kumbu!' : 'No history yet.' }}</p>
        </div>

        <div *ngIf="!isLoading && activities.length > 0" class="space-y-6">
          <!-- Filters & view toggle -->
          <div class="bg-white rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div class="flex gap-2">
                <button *ngFor="let filter of filters" 
                        (click)="setActiveFilter(filter.key)"
                        [class]="activeFilter === filter.key ? 'bg-[#70AEB9] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                        class="px-4 py-2 rounded-full text-sm transition-colors duration-200">
                  {{ filter.label }}
                </button>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="setViewMode('list')" [class]="viewMode==='list' ? 'bg-[#70AEB9] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'" class="px-3 py-2 rounded-lg text-sm">List</button>
                <button (click)="setViewMode('cards')" [class]="viewMode==='cards' ? 'bg-[#70AEB9] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'" class="px-3 py-2 rounded-lg text-sm">Cards</button>
              </div>
            </div>
          </div>

          <!-- Timeline (list view) -->
          <div *ngIf="viewMode==='list'" class="relative">
            <div class="absolute left-5 top-0 bottom-0 w-px bg-gray-200" aria-hidden="true"></div>
            <div *ngFor="let activity of filteredActivities" class="relative pl-14">
              <div class="absolute left-4 top-6 -ml-1.5 w-3 h-3 rounded-full border-2 border-white"
                   [class.bg-green-500]="activity.type === 'challenge'"
                   [class.bg-blue-500]="activity.type === 'activity'"
                   [class.bg-purple-500]="activity.type === 'achievement'"
                   [class.bg-orange-500]="activity.type === 'social'"
                   style="box-shadow: 0 0 0 2px rgba(229,231,235,1)"></div>
              <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 mb-4">
                <div class="p-6">
                  <div class="flex items-start justify-between mb-4">
                    <div class="flex items-start space-x-4">
                      <div class="flex-shrink-0">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center"
                             [class.bg-green-500]="activity.type === 'challenge'"
                             [class.bg-blue-500]="activity.type === 'activity'"
                             [class.bg-purple-500]="activity.type === 'achievement'"
                             [class.bg-orange-500]="activity.type === 'social'">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path *ngIf="activity.type === 'challenge'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            <path *ngIf="activity.type === 'activity'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1.586a1 1 0 01-.293.707L12 12.414a1 1 0 00-.293.707V15"></path>
                            <path *ngIf="activity.type === 'achievement'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            <path *ngIf="activity.type === 'social'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                        </div>
                      </div>
                      <div class="flex-1">
                        <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ activity.title }}</h3>
                        <p class="text-gray-600 text-sm mb-2">{{ activity.description }}</p>
                        <div class="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                          <span>{{ activity.timestring }}</span>
                          <span *ngIf="activity.like_count" class="bg-[#70AEB9] text-white px-2 py-1 rounded-full">{{ activity.like_count }} likes</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex-shrink-0">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            [class.bg-green-100]="activity.type === 'challenge'" [class.text-green-800]="activity.type === 'challenge'"
                            [class.bg-yellow-100]="activity.type === 'activity'" [class.text-yellow-800]="activity.type === 'activity'"
                            [class.bg-purple-100]="activity.type === 'achievement'" [class.text-purple-800]="activity.type === 'achievement'"
                            [class.bg-orange-100]="activity.type === 'social'" [class.text-orange-800]="activity.type === 'social'">
                        {{ activity.type | titlecase }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Cards view -->
          <div *ngIf="viewMode==='cards'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div *ngFor="let activity of filteredActivities" class="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-5">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white"
                     [class.bg-green-500]="activity.type === 'challenge'"
                     [class.bg-blue-500]="activity.type === 'activity'"
                     [class.bg-purple-500]="activity.type === 'achievement'"
                     [class.bg-orange-500]="activity.type === 'social'">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path *ngIf="activity.type === 'challenge'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    <path *ngIf="activity.type === 'activity'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1.586a1 1 0 01-.293.707L12 12.414a1 1 0 00-.293.707V15"></path>
                    <path *ngIf="activity.type === 'achievement'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    <path *ngIf="activity.type === 'social'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h3 class="text-base font-semibold text-gray-800">{{ activity.title }}</h3>
                  <p class="text-gray-600 text-sm mb-2">{{ activity.description }}</p>
                  <div class="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                    <span>{{ activity.timestring }}</span>
                    <span *ngIf="activity.like_count" class="bg-[#70AEB9] text-white px-2 py-1 rounded-full">{{ activity.like_count }} likes</span>
                  </div>
                </div>
                <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                      [class.bg-green-100]="activity.type === 'challenge'" [class.text-green-800]="activity.type === 'challenge'"
                      [class.bg-yellow-100]="activity.type === 'activity'" [class.text-yellow-800]="activity.type === 'activity'"
                      [class.bg-purple-100]="activity.type === 'achievement'" [class.text-purple-800]="activity.type === 'achievement'"
                      [class.bg-orange-100]="activity.type === 'social'" [class.text-orange-800]="activity.type === 'social'">
                  {{ activity.type | titlecase }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  private readonly timelineService = inject(TimelineService);
  
  activities: TimelineEntry[] = [];
  isLoading = true;
  isOwnProfile = false;
  username = '';
  activeFilter = 'all';
  viewMode: 'list' | 'cards' = 'list';
  isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false;
  stats = { points: 0, challenges: 0, activities: 0, social: 0, achievements: 0 };
  badges: Array<{ name: string; icon?: string }> = [];
  private subscriptions: Subscription[] = [];

  filters = [
    { key: 'all', label: 'All' },
    { key: 'challenge', label: 'Challenges' },
    { key: 'activity', label: 'Activities' },
    { key: 'achievement', label: 'Achievements' },
    { key: 'social', label: 'Social' }
  ];

  get filteredActivities(): TimelineEntry[] {
    if (this.activeFilter === 'all') {
      return this.activities;
    }
    return this.activities.filter(activity => activity.type === this.activeFilter);
  }

  async ngOnInit(): Promise<void> {
    const userIdParam = this.route.snapshot.paramMap.get('user_id');
    const currentUser = this.authService.currentUserValue;

    this.isOwnProfile = userIdParam === currentUser?.id?.toString();
    this.username = this.isOwnProfile ? (currentUser?.username || '') : '';

    const userId = this.isOwnProfile ? undefined : (userIdParam ? parseInt(userIdParam, 10) : undefined);

    this.timelineService.getTimeline(userId).subscribe({
      next: (items) => {
        this.activities = items || [];
        this.isLoading = false;
        this.computeStats();
        this.computeBadges();
      },
      error: () => {
        this.activities = [];
        this.isLoading = false;
      }
    });
  }

  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
  }

  setViewMode(mode: 'list' | 'cards'): void {
    this.viewMode = mode;
  }

  getHistoryTitle(): string {
    return this.isOwnProfile ? 'Your History' : (this.username ? this.username + "'s History" : "User's History");
  }

  private computeStats(): void {
    const points = 0; // points not directly in timeline; could fetch from profile if needed
    const challenges = this.activities.filter(a => a.type === 'challenge').length;
    const activities = this.activities.filter(a => a.type === 'activity').length;
    const social = this.activities.filter(a => a.type === 'social').length;
    const achievements = this.activities.filter(a => a.type === 'achievement').length;
    this.stats = { points, challenges, activities, social, achievements };
  }

  private computeBadges(): void {
    const achievs = this.activities.filter(a => a.type === 'achievement');
    this.badges = achievs.map(a => ({ name: a.title }));
  }

  goBack(): void {
    this.router.navigate(['/app/profile', this.route.snapshot.paramMap.get('user_id')]);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}