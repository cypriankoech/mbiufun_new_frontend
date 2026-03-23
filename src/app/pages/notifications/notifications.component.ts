import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Notifications</h1>
            <p class="text-gray-600">Stay updated with your activities</p>
          </div>
          <button 
            *ngIf="notifications.length > 0"
            (click)="markAllAsRead()"
            class="text-[#70AEB9] hover:text-[#5a9aa3] transition-colors duration-200 text-sm font-medium">
            Mark all as read
          </button>
        </div>

        <div *ngIf="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AEB9] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading notifications...</p>
        </div>

        <div *ngIf="!isLoading && notifications.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.19 4H19.8a2 2 0 012 2v10a2 2 0 01-2 2H4.19a2 2 0 01-2-2V6a2 2 0 012-2z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Notifications</h3>
          <p class="text-gray-600">You're all caught up! Check back later for updates.</p>
        </div>

        <div *ngIf="!isLoading && notifications.length > 0" class="space-y-4">
          <div *ngFor="let notification of notifications" 
               class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
               [class.border-l-4]="!notification.read"
               [class.border-[#70AEB9]]="!notification.read"
               (click)="openNotification(notification)">
            <div class="p-6">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-start space-x-4 flex-1">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center"
                         [class.bg-[#70AEB9]]="getNotificationIcon(notification.type) === 'info'"
                         [class.bg-green-500]="getNotificationIcon(notification.type) === 'success'"
                         [class.bg-yellow-500]="getNotificationIcon(notification.type) === 'warning'"
                         [class.bg-red-500]="getNotificationIcon(notification.type) === 'error'">
                      <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path *ngIf="getNotificationIcon(notification.type) === 'info'" 
                              stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        <path *ngIf="getNotificationIcon(notification.type) === 'success'" 
                              stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        <path *ngIf="getNotificationIcon(notification.type) === 'warning'" 
                              stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        <path *ngIf="getNotificationIcon(notification.type) === 'error'" 
                              stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-gray-800 mb-1"
                        [class.font-bold]="!notification.read">
                      {{ notification.title }}
                    </h3>
                    <p class="text-gray-600 text-sm mb-2">{{ notification.description }}</p>
                    <p class="text-gray-500 text-xs">{{ notification.ago }}</p>
                  </div>
                </div>
                <div class="flex-shrink-0 ml-4">
                  <div *ngIf="!notification.read" 
                       class="w-3 h-3 bg-[#70AEB9] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  
  notifications: any[] = [];
  isLoading = true;
  private subscriptions: Subscription[] = [];

  async ngOnInit(): Promise<void> {
    this.loadNotifications();
  }

  private getHeaders() {
    const token = localStorage.getItem('mbiu-token');
    return {
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    };
  }

  loadNotifications(): void {
    const headers = this.getHeaders();
    this.http.get<any>(`${environment.apiUrl.replace(/\/$/, '')}/api/v1/notifications/`, { headers }).subscribe({
      next: (response) => {
        this.notifications = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
        this.notifications = [];
      this.isLoading = false;
      }
    });
  }

  markAllAsRead(): void {
    const headers = this.getHeaders();
    this.http.get<any>(`${environment.apiUrl.replace(/\/$/, '')}/api/v1/notifications/?mark_read=true`, { headers }).subscribe({
      next: () => {
    this.notifications = this.notifications.map(n => ({ ...n, read: true }));
      },
      error: (error) => {
        console.error('Failed to mark all as read:', error);
      }
    });
  }

  openNotification(notification: any): void {
    // Mark as read locally
    notification.read = true;

    // Navigate to the link if available
    if (notification.link) {
      // Parse the link - backend sends full paths like '/app/activity-detail/123'
      // but we need to navigate using Angular router segments
      const link = notification.link;

      if (link.startsWith('/app/')) {
        // Remove '/app/' prefix and split into segments
        const routePath = link.substring(5); // Remove '/app/'
        const segments = routePath.split('/').filter((segment: string) => segment); // Split and filter empty strings

        // Handle parameterized routes
        if (segments[0] === 'activity-detail' && segments[1]) {
          this.router.navigate(['activity-detail', segments[1]]);
        } else if (segments[0] === 'activities') {
          this.router.navigate(['activities']);
        } else {
          // Fallback - try navigating to the segments
          this.router.navigate(segments);
        }
      } else {
        // Fallback for unexpected link formats
        console.warn('Unexpected notification link format:', link);
        this.router.navigate([link]);
      }
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}