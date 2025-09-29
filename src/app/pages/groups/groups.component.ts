import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Bubble Groups</h1>
            <p class="text-gray-600">Connect with your friends and groups</p>
          </div>
          <button 
            (click)="createGroup()"
            class="bg-[#70AEB9] text-white px-4 py-2 rounded-lg hover:bg-[#5a9aa3] transition-colors duration-200 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            New Group
          </button>
        </div>

        <div *ngIf="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AEB9] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading groups...</p>
        </div>

        <div *ngIf="!isLoading && groups.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Groups Yet</h3>
          <p class="text-gray-600 mb-4">Create your first group to start connecting with friends!</p>
          <button 
            (click)="createGroup()"
            class="bg-[#70AEB9] text-white px-6 py-3 rounded-lg hover:bg-[#5a9aa3] transition-colors duration-200">
            Create Your First Group
          </button>
        </div>

        <div *ngIf="!isLoading && groups.length > 0" class="space-y-4">
          <div *ngFor="let group of groups" 
               class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
               (click)="openGroup(group)">
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-[#70AEB9] rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-800">{{ group.name }}</h3>
                    <p class="text-gray-600 text-sm">{{ group.memberCount }} members</p>
                  </div>
                </div>
                <div class="text-right">
                  <div *ngIf="group.unreadCount > 0" 
                       class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-1">
                    {{ group.unreadCount }}
                  </div>
                  <p class="text-gray-500 text-xs">{{ group.lastActivity }}</p>
                </div>
              </div>
              
              <p class="text-gray-600 text-sm mb-3">{{ group.description }}</p>
              
              <div class="flex items-center justify-between">
                <div class="flex -space-x-2">
                  <div *ngFor="let member of group.recentMembers?.slice(0, 3)" 
                       class="w-8 h-8 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                    <span class="text-xs font-semibold text-gray-600">{{ member.initials }}</span>
                  </div>
                  <div *ngIf="group.memberCount > 3" 
                       class="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                    <span class="text-xs font-semibold text-gray-500">+{{ group.memberCount - 3 }}</span>
                  </div>
                </div>
                <span class="text-[#70AEB9] text-sm font-medium">Tap to open</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GroupsComponent implements OnInit {
  private readonly router = inject(Router);
  
  groups: any[] = [];
  isLoading = true;
  private subscriptions: Subscription[] = [];

  async ngOnInit(): Promise<void> {
    // TODO: Add analytics logging
    // await this.analytics.logEvent('page_view', {"component": "GroupsComponent"});
    
    // TODO: Implement groups service
    setTimeout(() => {
      this.groups = [
        {
          id: 1,
          name: 'Weekend Warriors',
          description: 'Planning fun weekend activities',
          memberCount: 8,
          unreadCount: 3,
          lastActivity: '2 hours ago',
          recentMembers: [
            { initials: 'JD' },
            { initials: 'SM' },
            { initials: 'AL' }
          ]
        },
        {
          id: 2,
          name: 'Study Group',
          description: 'Collaborative learning and support',
          memberCount: 5,
          unreadCount: 0,
          lastActivity: '1 day ago',
          recentMembers: [
            { initials: 'MK' },
            { initials: 'LR' }
          ]
        }
      ];
      this.isLoading = false;
    }, 1000);
  }

  createGroup(): void {
    // TODO: Implement create group functionality
    console.log('Create group not yet implemented');
  }

  openGroup(group: any): void {
    // TODO: Navigate to group chat or details
    console.log('Opening group:', group);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}