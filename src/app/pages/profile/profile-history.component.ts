import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Activity History</h1>
            <p class="text-gray-600">{{ isOwnProfile ? 'Your' : username + '\\'s' }} recent activities and achievements</p>
          </div>
          <button (click)="goBack()" 
                  class="text-[#70AEB9] hover:text-[#5a9aa3] transition-colors duration-200 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            <span>Back to Profile</span>
          </button>
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
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Activity History</h3>
          <p class="text-gray-600">{{ isOwnProfile ? 'Start participating in activities to see your history here!' : 'This user hasn\\'t participated in any activities yet.' }}</p>
        </div>

        <div *ngIf="!isLoading && activities.length > 0" class="space-y-6">
          <!-- Filter Tabs -->
          <div class="bg-white rounded-lg shadow-md p-4">
            <div class="flex space-x-4">
              <button *ngFor="let filter of filters" 
                      (click)="setActiveFilter(filter.key)"
                      [class]="activeFilter === filter.key ? 'bg-[#70AEB9] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                      class="px-4 py-2 rounded-lg transition-colors duration-200">
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="space-y-4">
            <div *ngFor="let activity of filteredActivities" 
                 class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                          <path *ngIf="activity.type === 'challenge'" 
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                          <path *ngIf="activity.type === 'activity'" 
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1.586a1 1 0 01-.293.707L12 12.414a1 1 0 00-.293.707V15"></path>
                          <path *ngIf="activity.type === 'achievement'" 
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          <path *ngIf="activity.type === 'social'" 
                                stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ activity.title }}</h3>
                      <p class="text-gray-600 text-sm mb-2">{{ activity.description }}</p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{{ activity.date }}</span>
                        <span *ngIf="activity.points" class="bg-[#70AEB9] text-white px-2 py-1 rounded-full">
                          +{{ activity.points }} points
                        </span>
                        <span *ngIf="activity.participants" class="flex items-center space-x-1">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                          </svg>
                          <span>{{ activity.participants }} participants</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                          [class.bg-green-100]="activity.status === 'completed'"
                          [class.text-green-800]="activity.status === 'completed'"
                          [class.bg-yellow-100]="activity.status === 'in-progress'"
                          [class.text-yellow-800]="activity.status === 'in-progress'"
                          [class.bg-gray-100]="activity.status === 'cancelled'"
                          [class.text-gray-800]="activity.status === 'cancelled'">
                      {{ activity.status | titlecase }}
                    </span>
                  </div>
                </div>
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
  
  activities: any[] = [];
  isLoading = true;
  isOwnProfile = false;
  username = '';
  activeFilter = 'all';
  private subscriptions: Subscription[] = [];

  filters = [
    { key: 'all', label: 'All Activities' },
    { key: 'challenge', label: 'Challenges' },
    { key: 'activity', label: 'Activities' },
    { key: 'achievement', label: 'Achievements' },
    { key: 'social', label: 'Social' }
  ];

  get filteredActivities(): any[] {
    if (this.activeFilter === 'all') {
      return this.activities;
    }
    return this.activities.filter(activity => activity.type === this.activeFilter);
  }

  async ngOnInit(): Promise<void> {
    const userId = this.route.snapshot.paramMap.get('user_id');
    const currentUser = this.authService.currentUserValue;
    
    this.isOwnProfile = userId === currentUser?.id?.toString();
    this.username = this.isOwnProfile ? currentUser?.username || '' : 'User';
    
    // TODO: Load user activity history from service
    setTimeout(() => {
      this.activities = [
        {
          id: 1,
          title: 'Daily Dare Completed',
          description: 'Successfully completed today\'s challenge: "Take a photo with a friend"',
          type: 'challenge',
          status: 'completed',
          points: 10,
          date: '2 hours ago'
        },
        {
          id: 2,
          title: 'Coffee Meetup',
          description: 'Met up with friends at Java House for coffee and conversation',
          type: 'activity',
          status: 'completed',
          participants: 4,
          date: '1 day ago'
        },
        {
          id: 3,
          title: 'First Week Streak',
          description: 'Completed challenges for 7 days in a row!',
          type: 'achievement',
          status: 'completed',
          points: 50,
          date: '3 days ago'
        },
        {
          id: 4,
          title: 'New Friend Connection',
          description: 'Connected with 3 new friends this week',
          type: 'social',
          status: 'completed',
          date: '5 days ago'
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  setActiveFilter(filter: string): void {
    this.activeFilter = filter;
  }

  goBack(): void {
    this.router.navigate(['/app/profile', this.route.snapshot.paramMap.get('user_id')]);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}