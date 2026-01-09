import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { GroupsService } from '@app/services/groups.service';
import { interval, Subscription, of } from 'rxjs';
import { switchMap, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface ChatMessage {
  id: number;
  from_user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image?: string;
  };
  message: string;
  date_sent: string;
  from_me: boolean;
  images?: string[];
  image?: string;
  // Activity post detection
  isActivityPost?: boolean;
  activityPostId?: number;
}

interface GroupInfo {
  id: string;
  display_name: string;
  participants: Array<{
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    profile_image?: string;
  }>;
}

interface UserSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  mbiu_username: string;
  profile_image?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)]">
      <!-- Chat Header -->
      <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <button
            (click)="goBack()"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Go back"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div class="w-10 h-10 bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] rounded-full flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          
          <div class="flex-1">
            <h2 class="font-bold text-gray-900">{{ groupName }}</h2>
            <p class="text-xs text-gray-500" *ngIf="groupInfo">
              {{ groupInfo.participants.length + 1 }} members
            </p>
          </div>
        </div>
        
        <button
          (click)="toggleGroupInfo()"
          class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          aria-label="Group info"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <!-- Messages Container -->
      <div #messageContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50" (scroll)="onScroll()">
        <!-- Loading State -->
        <div *ngIf="isLoading" class="flex justify-center items-center h-full">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#70AEB9]"></div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!isLoading && messages.length === 0" class="flex flex-col items-center justify-center h-full text-center px-4">
          <div class="w-16 h-16 bg-[#70AEB9]/10 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          <!-- Welcome message for newly created groups -->
          <div *ngIf="isNewlyCreated" class="space-y-3">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">🎉 Welcome to {{ newGroupName || 'your new bubble' }}!</h3>
            <p class="text-gray-600 text-sm leading-relaxed max-w-sm">
              You created this bubble{{ newGroupMemberCount > 1 ? ' with ' + (newGroupMemberCount - 1) + ' friend' + (newGroupMemberCount - 1 > 1 ? 's' : '') : '' }}.
              Start the conversation and build your community!
            </p>
          </div>

          <!-- Default empty state for existing groups -->
          <div *ngIf="!isNewlyCreated">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Start the conversation!</h3>
            <p class="text-gray-600">Be the first to send a message in this bubble.</p>
          </div>
        </div>

        <!-- Messages -->
        <div *ngFor="let message of messages" [class.flex]="true" [class.justify-end]="message.from_me">
          <div [class.max-w-[75%]]="true" [class.sm:max-w-[60%]]="true">
            <!-- Message Bubble -->
            <div
              [class.bg-gradient-to-br]="message.from_me"
              [class.from-[#70AEB9]]="message.from_me"
              [class.to-[#4ECDC4]]="message.from_me"
              [class.text-white]="message.from_me"
              [class.bg-white]="!message.from_me"
              [class.text-gray-900]="!message.from_me"
              class="rounded-2xl px-4 py-2 shadow-sm"
              [class.rounded-br-sm]="message.from_me"
              [class.rounded-bl-sm]="!message.from_me"
            >
              <!-- Sender Name (for others' messages) -->
              <p *ngIf="!message.from_me" class="text-xs font-semibold text-[#70AEB9] mb-1">
                {{ message.from_user.first_name }} {{ message.from_user.last_name }}
              </p>
              
              <!-- Message Text -->
              <div *ngIf="!message.isActivityPost" class="text-sm break-words">{{ message.message }}</div>

              <!-- Activity Post Link -->
              <div *ngIf="message.isActivityPost" class="space-y-2">
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-lg">🎯</span>
                  <span class="font-medium">New Activity</span>
                </div>
                <div
                  *ngIf="message.activityPostId"
                  class="text-sm break-words cursor-pointer text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors duration-200"
                  (click)="navigateToActivity(message.activityPostId)"
                >
                  {{ getActivityMessagePreview(message.message) }}
                </div>
                <button
                  *ngIf="message.activityPostId"
                  (click)="navigateToActivity(message.activityPostId)"
                  class="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 border border-blue-600 hover:border-blue-700 rounded-lg text-sm font-medium text-white transition-all duration-200"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  View Full Post
                </button>
              </div>
              
              <!-- Images (if any) -->
              <div *ngIf="message.images && message.images.length > 0" class="mt-2 space-y-2">
                <img
                  *ngFor="let img of message.images"
                  [src]="img"
                  alt="Message attachment"
                  class="rounded-lg max-w-full h-auto"
                  loading="lazy"
                />
              </div>
              
              <!-- Timestamp -->
              <p class="text-xs mt-1 opacity-75">{{ formatTime(message.date_sent) }}</p>
            </div>
          </div>
        </div>
        
        <!-- Scroll to bottom anchor -->
        <div #scrollAnchor></div>
      </div>

      <!-- Message Input -->
      <div class="bg-white border-t border-gray-200 p-4">
        <form [formGroup]="messageForm" (ngSubmit)="sendMessage()" class="flex items-end gap-3">
          <!-- Textarea -->
          <div class="flex-1 relative bg-gray-50 rounded-2xl border-2 border-gray-200 focus-within:border-[#70AEB9] focus-within:ring-2 focus-within:ring-[#70AEB9]/20 transition-all duration-200">
            <textarea
              #messageInput
              formControlName="message"
              placeholder="Type your message..."
              rows="1"
              maxlength="500"
              (input)="adjustTextareaHeight()"
              class="w-full min-h-[44px] max-h-[120px] px-4 py-3 bg-transparent border-none outline-none placeholder-gray-400 text-gray-900 text-sm resize-none overflow-hidden"
              [disabled]="isSending"
            ></textarea>
          </div>

          <!-- Send Button -->
          <button
            type="submit"
            [disabled]="!messageForm.valid || isSending"
            class="flex-shrink-0 w-11 h-11 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white rounded-full hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center"
            aria-label="Send message"
          >
            <svg *ngIf="!isSending" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg *ngIf="isSending" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>
        </form>
      </div>

      <!-- Group Info Sidebar -->
      <div *ngIf="showGroupInfo" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" (click)="toggleGroupInfo()">
        <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-bold text-gray-900">Group Members</h3>
            <button
              (click)="toggleAddParticipant()"
              class="px-3 py-1 bg-[#70AEB9] hover:bg-[#5a9aa3] text-white text-sm rounded-lg transition-colors duration-200"
            >
              Add Member
            </button>
          </div>

          <!-- Add Participant Form -->
          <div *ngIf="showAddParticipant" class="mb-4 p-4 bg-gray-50 rounded-lg">
            <form [formGroup]="addParticipantForm" (ngSubmit)="addParticipant()">
              <div class="relative">
                <div class="flex gap-2">
                  <input
                    formControlName="identifier"
                    type="text"
                    placeholder="Search by name or username..."
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] text-sm"
                    [disabled]="isAddingParticipant"
                    autocomplete="off"
                  />
                  <div class="absolute right-12 top-3 text-gray-400" *ngIf="isSearching">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </div>

                <!-- Search Results Dropdown -->
                <div *ngIf="showSearchResults" class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div *ngIf="!isSearching && searchResults.length === 0" class="p-4 text-center text-gray-500 text-sm">
                    No users found
                  </div>

                  <div *ngIf="!isSearching && searchResults.length > 0">
                    <button
                      *ngFor="let user of searchResults"
                      (click)="selectUserFromSearch(user)"
                      type="button"
                      class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div class="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-sm font-semibold text-gray-600">
                          {{ user.first_name.charAt(0).toUpperCase() }}{{ user.last_name.charAt(0).toUpperCase() }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-gray-900 truncate">
                          {{ user.first_name }} {{ user.last_name }}
                        </div>
                        <div class="text-sm text-gray-500 truncate">
                          @{{ user.mbiu_username }}
                        </div>
                      </div>
                      <div class="text-[#70AEB9]">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <p class="text-xs text-gray-500 mt-2">
                Type at least 2 characters to search for members
              </p>
            </form>
          </div>

          <!-- Members List -->
          <div class="space-y-3" *ngIf="groupInfo">
            <!-- Current User (You) -->
            <div class="flex items-center gap-3 bg-[#70AEB9]/5 -mx-2 px-2 py-2 rounded-lg">
              <div class="w-10 h-10 bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] rounded-full flex items-center justify-center">
                <span class="text-sm font-semibold text-white">You</span>
              </div>
              <div class="flex-1">
                <p class="font-medium text-gray-900">You</p>
                <p class="text-xs text-[#70AEB9] font-medium">Group Member</p>
              </div>
            </div>

            <!-- Other Members -->
            <div *ngFor="let member of groupInfo.participants" class="flex items-center gap-3">
              <div *ngIf="member.profile_image; else noAvatar" class="w-10 h-10 rounded-full overflow-hidden">
                <img [src]="member.profile_image" [alt]="member.first_name" class="w-full h-full object-cover" />
              </div>
              <ng-template #noAvatar>
                <div class="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <span class="text-sm font-semibold text-gray-600">
                    {{ member.first_name?.charAt(0) || 'U' }}{{ member.last_name?.charAt(0) || '' }}
                  </span>
                </div>
              </ng-template>
              <div class="flex-1">
                <p class="font-medium text-gray-900">{{ member.first_name }} {{ member.last_name }}</p>
                <p class="text-sm text-gray-500">@{{ member.username }}</p>
              </div>
            </div>
          </div>

          <button
            (click)="toggleGroupInfo()"
            class="mt-6 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLTextAreaElement>;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly http = inject(HttpClient);
  private readonly groupsService = inject(GroupsService);

  groupId: string = '';
  groupName: string = 'Loading...';
  messages: ChatMessage[] = [];
  messageForm: FormGroup;
  isLoading = true;
  isSending = false;
  isAddingParticipant = false;
  showGroupInfo = false;
  showAddParticipant = false;
  groupInfo: GroupInfo | null = null;
  addParticipantForm: FormGroup;
  
  // Search functionality for adding participants
  searchResults: UserSearchResult[] = [];
  isSearching = false;
  showSearchResults = false;

  // New group welcome message
  isNewlyCreated = false;
  newGroupName = '';
  newGroupMemberCount = 0;

  private pollSubscription?: Subscription;
  private currentUserId: number = 0;

  constructor() {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });

    this.addParticipantForm = this.fb.group({
      identifier: ['', [Validators.required]]
    });

    // Setup search with debouncing for add participant
    this.addParticipantForm.get('identifier')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.trim().length >= 2) {
          this.isSearching = true;
          return this.searchUsers(query.trim());
        } else {
          this.searchResults = [];
          this.showSearchResults = false;
          this.isSearching = false;
          return of([]);
        }
      })
    ).subscribe({
      next: (results: UserSearchResult[]) => {
        this.searchResults = results;
        this.showSearchResults = results.length > 0;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  ngOnInit(): void {
    this.groupId = this.route.snapshot.paramMap.get('id') || '';

    // Check if this is a newly created group
    const navState = window.history.state;
    this.isNewlyCreated = navState?.newlyCreated || false;
    this.newGroupName = navState?.groupName || '';
    this.newGroupMemberCount = navState?.memberCount || 0;

    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserId = currentUser.id;

    if (!this.groupId) {
      this.snackBar.open('Invalid group ID', 'Close', { duration: 3000 });
      this.router.navigate(['/app/groups']);
      return;
    }

    this.loadGroupInfo();
    this.loadMessages();
    this.startPolling();
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  private getHeaders() {
    const token = localStorage.getItem('mbiu-token');
    return {
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    };
  }

  loadGroupInfo(): void {
    const headers = this.getHeaders();
    this.http.get<any>(`${environment.apiUrl.replace(/\/$/, '')}/api/v1/chat/groups`, { headers }).subscribe({
      next: (response: any) => {
        const groups = response || [];
        const group = groups.find((g: any) => g.participant.id === this.groupId);
        
        if (group) {
          this.groupName = group.participant.displayName;
          
          // Map chattingTo which has nested participant objects
          const participants = (group.participant.chattingTo || []).map((p: any) => {
            const participant = p.participant || p; // Handle both nested and direct formats
            const fullName = participant.displayName || '';
            const nameParts = fullName.split(' ');
            
            return {
              id: participant.id,
              first_name: nameParts[0] || 'User',
              last_name: nameParts.slice(1).join(' ') || '',
              username: participant.username || participant.id,
              profile_image: participant.avatar
            };
          });
          
          this.groupInfo = {
            id: group.participant.id,
            display_name: group.participant.displayName,
            participants: participants
          };
        } else {
          this.groupName = 'Group Chat';
        }
      },
      error: (error) => {
        console.error('Failed to load group info:', error);
        this.groupName = 'Group Chat';
      }
    });
  }

  loadMessages(): void {
    const headers = this.getHeaders();
    this.http.get<any>(`${environment.apiUrl.replace(/\/$/, '')}/api/v1/chat/thread/${this.groupId}`, { headers }).subscribe({
      next: (response: any) => {
        this.messages = (response || []).map((msg: any) => {
          // Detect activity posts by looking for activity links
          const activityMatch = msg.message.match(/activity\/(\d+)/);
          const isActivityPost = !!activityMatch;
          const activityPostId = activityMatch ? parseInt(activityMatch[1]) : undefined;

          return {
            ...msg,
            from_me: msg.from_user.id === this.currentUserId,
            // Ensure date_sent exists and is valid
            date_sent: msg.date_sent || new Date().toISOString(),
            // Activity post detection
            isActivityPost,
            activityPostId
          };
        });
        this.isLoading = false;
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Failed to load messages:', error);
        this.isLoading = false;
        this.snackBar.open('Failed to load messages', 'Retry', { duration: 5000 })
          .onAction()
          .subscribe(() => this.loadMessages());
      }
    });
  }

  startPolling(): void {
    // Poll for new messages every 3 seconds
    this.pollSubscription = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => {
          const headers = this.getHeaders();
          return this.http.get<any>(`${environment.apiUrl.replace(/\/$/, '')}/api/v1/chat/thread/${this.groupId}`, { headers });
        })
      )
      .subscribe({
        next: (response: any) => {
          const previousCount = this.messages.length;
          this.messages = (response || []).map((msg: any) => {
            // Detect activity posts by looking for activity links
            const activityMatch = msg.message.match(/activity\/(\d+)/);
            const isActivityPost = !!activityMatch;
            const activityPostId = activityMatch ? parseInt(activityMatch[1]) : undefined;

            return {
              ...msg,
              from_me: msg.from_user.id === this.currentUserId,
              // Ensure date_sent exists and is valid
              date_sent: msg.date_sent || new Date().toISOString(),
              // Activity post detection
              isActivityPost,
              activityPostId
            };
          });

          // Scroll to bottom if new messages arrived
          if (this.messages.length > previousCount) {
            setTimeout(() => this.scrollToBottom(), 100);
          }
        },
        error: (error) => {
          console.error('Polling error:', error);
        }
      });
  }

  sendMessage(): void {
    if (!this.messageForm.valid || this.isSending) return;

    this.isSending = true;
    const messageText = this.messageForm.value.message.trim();

    const headers = this.getHeaders();
    const payload = {
      message: messageText
    };

    this.http.post<any>(`${environment.apiUrl.replace(/\/$/, '')}/api/v1/chat/thread/${this.groupId}`, payload, { headers }).subscribe({
      next: (response) => {
        // Add message to local array optimistically
        const newMessage = {
          ...response,
          from_me: true,
          date_sent: response.date_sent || new Date().toISOString(),
          id: response.id || Date.now(),
          message: messageText,
          from_user: {
            id: this.currentUserId,
            first_name: response.from_user?.first_name || 'You',
            last_name: response.from_user?.last_name || '',
            username: response.from_user?.username || '',
            profile_image: response.from_user?.profile_image
          }
        };

        this.messages.push(newMessage);

        // Reset form and scroll
        this.messageForm.reset();
        this.resetTextareaHeight();
        setTimeout(() => this.scrollToBottom(), 100);
        this.isSending = false;
      },
      error: (error) => {
        console.error('Failed to send message:', error);
        this.snackBar.open('Failed to send message', 'Retry', { duration: 3000 });
        this.isSending = false;
      }
    });
  }

  adjustTextareaHeight(): void {
    const textarea = this.messageInput?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  }

  resetTextareaHeight(): void {
    const textarea = this.messageInput?.nativeElement;
    if (textarea) {
      textarea.style.height = '44px';
    }
  }

  scrollToBottom(): void {
    try {
      if (this.scrollAnchor) {
        this.scrollAnchor.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  onScroll(): void {
    // Future: Implement infinite scroll for loading older messages
  }

  toggleGroupInfo(): void {
    this.showGroupInfo = !this.showGroupInfo;
    if (!this.showGroupInfo) {
      this.showAddParticipant = false;
      this.addParticipantForm.reset();
    }
  }

  toggleAddParticipant(): void {
    this.showAddParticipant = !this.showAddParticipant;
    if (!this.showAddParticipant) {
      this.addParticipantForm.reset();
      this.searchResults = [];
      this.showSearchResults = false;
    }
  }

  private searchUsers(query: string) {
    const headers = this.getHeaders();
    const params = new HttpParams()
      .set('s', query)
      .set('users', '1')
      .set('per_page', '10');

    return this.http.get<{ users: UserSearchResult[] }>(
      `${environment.apiUrl.replace(/\/$/, '')}/api/v1/search`,
      { headers, params }
    ).pipe(
      switchMap(response => of(response.users || []))
    );
  }

  selectUserFromSearch(user: UserSearchResult): void {
    // Check if user is already a participant
    const isAlreadyMember = this.groupInfo?.participants.some(p => p.id === user.id);
    if (isAlreadyMember) {
      this.snackBar.open('This user is already a member', 'Close', { duration: 3000 });
      return;
    }

    // Set the username in the form
    this.addParticipantForm.patchValue({ identifier: user.mbiu_username });
    this.searchResults = [];
    this.showSearchResults = false;

    // Automatically trigger add participant
    this.addParticipant();
  }

  addParticipant(): void {
    if (!this.addParticipantForm.valid || this.isAddingParticipant) return;

    this.isAddingParticipant = true;
    const identifier = this.addParticipantForm.value.identifier.trim();

    this.groupsService.addParticipant(this.groupId, identifier).subscribe({
      next: (response) => {
        this.snackBar.open('Member added successfully!', 'Close', { duration: 3000 });

        // Update the group info to reflect the new member
        this.loadGroupInfo();

        // Reset form and hide add participant section
        this.addParticipantForm.reset();
        this.showAddParticipant = false;
        this.isAddingParticipant = false;
      },
      error: (error) => {
        console.error('Failed to add participant:', error);

        let errorMessage = 'Failed to add member';
        if (error.error?.detail) {
          errorMessage = error.error.detail;
        }

        this.snackBar.open(errorMessage, 'Close', { duration: 5000 });
        this.isAddingParticipant = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/groups']);
  }

  navigateToActivity(postId: number): void {
    this.router.navigate(['/app/activity-detail', postId]);
  }

  getActivityMessagePreview(message: string): string {
    // Remove the "View full post" link from activity messages
    return message.replace(/📍 View full post: https:\/\/am\.mbiufun\.com\/app\/activity\/\d+/, '').trim();
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);

    // Check if date is invalid
    if (isNaN(date.getTime())) {
      return 'Just now'; // Fallback for invalid dates
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;

    // Format as time if today, date if older
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
