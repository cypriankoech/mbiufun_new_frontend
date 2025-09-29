import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div *ngIf="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AEB9] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading profile...</p>
        </div>

        <div *ngIf="!isLoading && user" class="space-y-6">
          <!-- Profile Header -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-gradient-to-r from-[#70AEB9] to-blue-400 h-32"></div>
            <div class="relative px-6 pb-6">
              <div class="flex items-start justify-between">
                <div class="flex items-center space-x-6 -mt-16">
                  <div class="w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center overflow-hidden">
                    <img *ngIf="user.profile_image" [src]="user.profile_image" [alt]="user.display_name" class="w-full h-full object-cover">
                    <div *ngIf="!user.profile_image" class="text-4xl font-bold text-gray-600">
                      {{ getInitials(user.display_name || user.username) }}
                    </div>
                  </div>
                  <div class="mt-16 flex-1">
                    <h1 class="text-2xl font-bold text-gray-800">{{ user.display_name || user.username }}</h1>
                    <p class="text-gray-600 text-sm">{{ '@' + user.username }}</p>
                    <p *ngIf="user.location" class="text-gray-500 text-sm mt-1">📍 {{ user.location }}</p>
                  </div>
                </div>
                <div class="mt-4 flex space-x-3">
                  <button *ngIf="isOwnProfile" 
                          (click)="editProfile()"
                          class="bg-[#70AEB9] text-white px-4 py-2 rounded-lg hover:bg-[#5a9aa3] transition-colors duration-200">
                    Edit Profile
                  </button>
                  <button *ngIf="!isOwnProfile" 
                          (click)="toggleFollow()"
                          [class]="user.is_followed ? 'bg-gray-500 hover:bg-gray-600' : 'bg-[#70AEB9] hover:bg-[#5a9aa3]'"
                          class="text-white px-4 py-2 rounded-lg transition-colors duration-200">
                    {{ user.is_followed ? 'Unfollow' : 'Follow' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white rounded-lg shadow-md p-4 text-center">
              <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ user.scores || 0 }}</div>
              <div class="text-gray-600 text-sm">Points</div>
            </div>
            <div class="bg-white rounded-lg shadow-md p-4 text-center">
              <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ user.mwandas || 0 }}</div>
              <div class="text-gray-600 text-sm">Mwandas</div>
            </div>
            <div class="bg-white rounded-lg shadow-md p-4 text-center">
              <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ user.followers || 0 }}</div>
              <div class="text-gray-600 text-sm">Followers</div>
            </div>
            <div class="bg-white rounded-lg shadow-md p-4 text-center">
              <div class="text-2xl font-bold text-[#70AEB9] mb-1">{{ user.follows || 0 }}</div>
              <div class="text-gray-600 text-sm">Following</div>
            </div>
          </div>

          <!-- Bio Section -->
          <div *ngIf="user.bio" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">About</h2>
            <p class="text-gray-600">{{ user.bio }}</p>
          </div>

          <!-- Hobbies Section -->
          <div *ngIf="user.hobbies" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Hobbies</h2>
            <p class="text-gray-600">{{ user.hobbies }}</p>
          </div>

          <!-- Selected Vibes -->
          <div *ngIf="user.selected_vibes && user.selected_vibes.length > 0" class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-3">Interests</h2>
            <div class="flex flex-wrap gap-2">
              <span *ngFor="let vibe of user.selected_vibes" 
                    class="bg-[#70AEB9] text-white px-3 py-1 rounded-full text-sm">
                {{ vibe.name }}
              </span>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button (click)="viewHistory()" 
                      class="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 p-4 rounded-lg transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>View History</span>
              </button>
              <button *ngIf="!isOwnProfile" 
                      (click)="sendMessage()" 
                      class="flex items-center justify-center space-x-2 bg-[#70AEB9] hover:bg-[#5a9aa3] text-white p-4 rounded-lg transition-colors duration-200">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  
  user: any = null;
  isLoading = true;
  isOwnProfile = false;
  private subscriptions: Subscription[] = [];

  async ngOnInit(): Promise<void> {
    const userId = this.route.snapshot.paramMap.get('user_id');
    const currentUser = this.authService.currentUserValue;
    
    this.isOwnProfile = userId === currentUser?.id?.toString();
    
    // TODO: Load user profile from service
    setTimeout(() => {
      if (this.isOwnProfile) {
        this.user = currentUser;
      } else {
        // Mock user data for demonstration
        this.user = {
          id: userId,
          username: 'friend_user',
          display_name: 'Friend User',
          location: 'Nairobi, Kenya',
          bio: 'Love exploring new activities and meeting new people!',
          hobbies: 'Photography, hiking, cooking',
          scores: 1250,
          mwandas: 85,
          followers: 42,
          follows: 38,
          is_followed: false,
          selected_vibes: [
            { name: 'Photography' },
            { name: 'Hiking' },
            { name: 'Cooking' }
          ]
        };
      }
      this.isLoading = false;
    }, 1000);
  }

  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  editProfile(): void {
    // TODO: Open edit profile dialog or navigate to edit page
    console.log('Edit profile not yet implemented');
  }

  toggleFollow(): void {
    if (this.user) {
      this.user.is_followed = !this.user.is_followed;
      this.user.followers += this.user.is_followed ? 1 : -1;
    }
    // TODO: Update on server
  }

  viewHistory(): void {
    this.router.navigate(['/app/profile', this.user.id, 'history']);
  }

  sendMessage(): void {
    // TODO: Open message dialog or navigate to chat
    console.log('Send message not yet implemented');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}