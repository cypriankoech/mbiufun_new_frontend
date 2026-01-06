import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupsService, Group } from '@app/services/groups.service';
import { CreateGroupDialogComponent } from '@app/components/create-group-dialog/create-group-dialog.component';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full pb-6">
      <!-- Page Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-[#0b4d57] mb-2">Your Bubbles</h1>
        <p class="text-gray-600">Connect, chat, and create with your groups</p>
      </div>

      <!-- Create Group FAB -->
      <button
        (click)="createGroup()"
        class="fixed bottom-20 right-4 sm:right-6 z-30 w-14 h-14 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
        aria-label="Create new group"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
      </button>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let i of [1,2,3,4]" class="animate-pulse">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-gray-300 rounded-2xl"></div>
                <div class="flex-1">
                  <div class="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                  <div class="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div class="w-6 h-6 bg-gray-300 rounded"></div>
            </div>
            <div class="h-4 bg-gray-200 rounded w-full mb-3"></div>
            <div class="flex items-center justify-between">
              <div class="flex -space-x-2">
                <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
              <div class="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && groups.length === 0" class="py-12 sm:py-16 text-center animate-fadeIn">
        <div class="max-w-md mx-auto px-4">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#70AEB9]/20 to-[#4ECDC4]/20 flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-3">Create Your First Bubble</h2>
          <p class="text-gray-600 mb-6">
            Start a group chat, plan activities, or compete with friends. Your bubbles are waiting to be created!
          </p>
          <button
            (click)="createGroup()"
            class="px-8 py-4 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
          >
            Create Your First Bubble
          </button>
        </div>
      </div>

      <!-- Groups Grid -->
      <div *ngIf="!isLoading && groups.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div *ngFor="let group of groups; let idx = index"
             class="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
             [style.animation-delay]="(idx * 50) + 'ms'"
             (click)="openGroup(group)">

          <!-- Group Header -->
          <div class="p-6 border-b border-gray-50">
            <div class="flex items-start justify-between mb-4">
              <!-- Edit Menu -->
              <div class="relative">
                <button
                  (click)="$event.stopPropagation(); toggleEditMenu(group)"
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  aria-label="Group options"
                >
                  <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>

                <!-- Edit Dropdown Menu -->
                <div *ngIf="editingGroup === group.id"
                     class="absolute top-10 left-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-32">
                  <button
                    (click)="$event.stopPropagation(); editGroup(group)"
                    class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    Edit Group
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-4">
                <!-- Group Avatar -->
                <div class="relative">
                  <div class="w-14 h-14 bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <!-- Online indicator -->
                  <div class="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-gray-900 group-hover:text-[#70AEB9] transition-colors duration-200 truncate">
                    {{ group.name }}
                  </h3>
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>{{ group.memberCount }} members</span>
                  </div>
                </div>
              </div>

              <!-- Unread Badge & Activity Indicator -->
              <div class="flex flex-col items-end gap-2">
                <div *ngIf="group.unreadCount > 0"
                     class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {{ group.unreadCount }}
                </div>
                <div *ngIf="group.hasActivity"
                     class="w-3 h-3 bg-[#4ECDC4] rounded-full animate-pulse"
                     title="Active group"></div>
              </div>
            </div>

            <!-- Last Message Preview -->
            <div *ngIf="group.lastMessage" class="mb-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-semibold text-gray-600">{{ group.lastMessage.senderInitials }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-600 line-clamp-1">
                    <span class="font-medium text-gray-900">{{ group.lastMessage.sender }}:</span>
                    {{ group.lastMessage.text }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">{{ group.lastMessage.time }}</p>
                </div>
              </div>
            </div>

            <!-- Group Description -->
            <p class="text-sm text-gray-600 line-clamp-2 mb-4">{{ group.description }}</p>
          </div>

          <!-- Group Footer -->
          <div class="p-6 pt-4">
            <div class="flex items-center justify-between">
              <!-- Member Avatars -->
              <div class="flex -space-x-2">
                <div *ngFor="let member of group.recentMembers?.slice(0, 4)"
                     class="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center hover:z-10 transition-transform duration-200 hover:scale-110"
                     title="{{ member.name }}">
                  <span class="text-xs font-semibold text-gray-600">{{ member.initials }}</span>
                </div>
                <div *ngIf="group.memberCount > 4"
                     class="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                  <span class="text-xs font-semibold text-gray-500">+{{ group.memberCount - 4 }}</span>
                </div>
              </div>

              <!-- Activity Indicator -->
              <div class="flex items-center gap-2">
                <span *ngIf="group.activityType" class="text-xs px-2 py-1 rounded-full bg-[#70AEB9]/10 text-[#70AEB9]">
                  {{ group.activityType }}
                </span>
                <svg class="w-5 h-5 text-[#70AEB9] group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Summary -->
      <div *ngIf="!isLoading && groups.length > 0" class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Recent Activity
        </h3>
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-sm">
            <div class="w-2 h-2 bg-[#4ECDC4] rounded-full"></div>
            <span class="text-gray-600">Weekend Warriors planned a hiking trip</span>
            <span class="text-gray-400">2h ago</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <div class="w-2 h-2 bg-[#70AEB9] rounded-full"></div>
            <span class="text-gray-600">Study Group completed a group challenge</span>
            <span class="text-gray-400">1d ago</span>
          </div>
          <div class="flex items-center gap-3 text-sm">
            <div class="w-2 h-2 bg-[#FF6B6B] rounded-full"></div>
            <span class="text-gray-600">Fitness Friends hit their weekly goal</span>
            <span class="text-gray-400">3d ago</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.4s ease-out;
    }
    .line-clamp-1 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 1;
    }
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  `]
})
export class GroupsComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly groupsService = inject(GroupsService);
  private readonly dialog = inject(MatDialog);

  groups: Group[] = [];
  isLoading = true;
  editingGroup: string | null = null;
  private subscriptions: Subscription[] = [];

  async ngOnInit(): Promise<void> {
    // TODO: Add analytics logging
    // await this.analytics.logEvent('page_view', {"component": "GroupsComponent"});

    this.loadGroups();
  }

  private loadGroups(): void {
    this.groupsService.getUserGroups().subscribe({
      next: (groups) => {
        this.groups = groups;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load groups:', error);
        this.isLoading = false;

        // Show error snackbar with retry option
        this.snackBar.open(
          'Failed to load groups. Please check your connection.',
          'Retry',
          {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          }
        ).onAction().subscribe(() => {
          this.isLoading = true;
          this.loadGroups();
        });
      }
    });
  }

  createGroup(): void {
    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      height: '90vh',
      maxHeight: '700px',
      panelClass: 'create-group-dialog-panel',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Group was created successfully, navigate to the new chat
        console.log('Group created successfully, navigating to chat:', result);
        const memberCount = result.participantCount || result.participants?.length || 0;
        this.router.navigate(['/app/chat', result.id], {
          state: {
            newlyCreated: true,
            groupName: result.name,
            memberCount: memberCount
          }
        });
      }
    });
  }

  openGroup(group: any): void {
    // Close any open edit menus
    this.editingGroup = null;
    // Navigate to the group chat interface
    this.router.navigate(['/app/chat', group.id]);
  }

  toggleEditMenu(group: any): void {
    // Toggle the edit menu for this group
    this.editingGroup = this.editingGroup === group.id ? null : group.id;
  }

  editGroup(group: any): void {
    // Close the edit menu
    this.editingGroup = null;

    // Open the create group dialog in edit mode
    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      height: '90vh',
      maxHeight: '700px',
      panelClass: 'create-group-dialog-panel',
      disableClose: true,
      data: {
        isEditing: true,
        group: group
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        // Group was updated successfully, reload the groups list
        this.loadGroups();
        this.snackBar.open('Group updated successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Close any open edit menus
    this.editingGroup = null;
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}