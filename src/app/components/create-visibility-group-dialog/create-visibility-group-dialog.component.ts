import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

interface Individual {
  id: number;
  first_name: string;
  last_name: string;
  mbiu_username: string;
  profile_image?: string;
}

interface Bubble {
  id: string;
  name: string;
  img_url?: string;
  memberCount?: number;
}

interface NewVisibilityGroup {
  name: string;
  members: Array<{
    type: 'user' | 'bubble';
    user_id?: number;
    bubble_id?: string;
  }>;
}

@Component({
  selector: 'app-create-visibility-group-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col bg-white rounded-2xl overflow-hidden max-h-[85vh]">
      <!-- Header -->
      <div class="p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4]">
        <div class="flex items-center justify-between mb-2">
          <h2 class="text-2xl font-bold text-white">{{ isEditMode ? 'Edit Group' : 'Create Group' }}</h2>
          <button
            (click)="close()"
            class="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-white/90 text-sm">Groups help you quickly select people or bubbles when posting.</p>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto">
        <div class="p-6 space-y-6">
          
          <!-- Group Name Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">
              Group name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [formControl]="groupNameControl"
              placeholder="Inner Circle"
              maxlength="40"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70AEB9] focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">
              Examples: "Weekend Crew", "Classmates + Gym"
            </p>
            <p *ngIf="groupNameControl.invalid && groupNameControl.touched" class="text-xs text-red-500 mt-1">
              Group name is required (2-40 characters)
            </p>
          </div>

          <!-- Tab Navigation -->
          <div class="border-b border-gray-200">
            <div class="flex gap-4">
              <button
                (click)="activeTab = 'people'"
                [class.border-[#70AEB9]]="activeTab === 'people'"
                [class.text-[#70AEB9]]="activeTab === 'people'"
                [class.border-transparent]="activeTab !== 'people'"
                [class.text-gray-600]="activeTab !== 'people'"
                class="pb-3 px-1 border-b-2 font-semibold text-sm transition-colors"
              >
                👤 People
              </button>
              <button
                (click)="activeTab = 'bubbles'"
                [class.border-[#70AEB9]]="activeTab === 'bubbles'"
                [class.text-[#70AEB9]]="activeTab === 'bubbles'"
                [class.border-transparent]="activeTab !== 'bubbles'"
                [class.text-gray-600]="activeTab !== 'bubbles'"
                class="pb-3 px-1 border-b-2 font-semibold text-sm transition-colors"
              >
                🫧 Bubbles
              </button>
            </div>
          </div>

          <!-- People Tab -->
          <div *ngIf="activeTab === 'people'" class="space-y-4">
            <p class="text-sm text-gray-600">
              Select specific people to include in this group.
            </p>

            <!-- Search People -->
            <div class="relative">
              <input
                type="text"
                [formControl]="peopleSearchControl"
                placeholder="Search by name..."
                class="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70AEB9] focus:border-transparent"
              />
              <svg class="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <!-- Selected People Chips -->
            <div *ngIf="selectedPeople.length > 0" class="space-y-2">
              <p class="text-xs font-medium text-gray-600">Selected ({{ selectedPeople.length }})</p>
              <div class="flex flex-wrap gap-2">
                <div
                  *ngFor="let person of selectedPeople"
                  class="inline-flex items-center gap-2 px-3 py-1.5 bg-[#70AEB9]/10 border border-[#70AEB9]/30 rounded-full"
                >
                  <span class="text-sm font-medium text-gray-900">{{ person.first_name }} {{ person.last_name }}</span>
                  <button
                    (click)="removePerson(person.id)"
                    class="p-0.5 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <svg class="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Search Loading -->
            <div *ngIf="isSearchingPeople" class="flex justify-center py-4">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#70AEB9]"></div>
            </div>

            <!-- No Results -->
            <div *ngIf="!isSearchingPeople && peopleSearchControl.value && peopleSearchControl.value.trim().length >= 2 && peopleSearchResults.length === 0" class="text-center py-4 text-gray-500 text-sm">
              No users found for "{{ peopleSearchControl.value }}"
            </div>

            <!-- Search Results -->
            <div *ngIf="!isSearchingPeople && peopleSearchResults.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
              <button
                *ngFor="let person of peopleSearchResults"
                (click)="togglePerson(person)"
                [disabled]="isPersonSelected(person.id)"
                class="w-full p-3 flex items-center gap-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {{ person.first_name.charAt(0) }}{{ person.last_name.charAt(0) }}
                </div>
                <div class="flex-1 text-left">
                  <p class="font-medium text-gray-900">{{ person.first_name }} {{ person.last_name }}</p>
                  <p class="text-sm text-gray-500">@{{ person.mbiu_username }}</p>
                </div>
                <svg *ngIf="isPersonSelected(person.id)" class="w-5 h-5 text-[#70AEB9] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Bubbles Tab -->
          <div *ngIf="activeTab === 'bubbles'" class="space-y-4">
            <p class="text-sm text-gray-600">
              Everyone inside selected bubbles will be included.
            </p>

            <!-- Loading Bubbles -->
            <div *ngIf="loadingBubbles" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#70AEB9]"></div>
            </div>

            <!-- Bubbles Grid -->
            <div *ngIf="!loadingBubbles && bubbles.length > 0" class="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              <button
                *ngFor="let bubble of bubbles"
                (click)="toggleBubble(bubble.id)"
                [class.ring-2]="isBubbleSelected(bubble.id)"
                [class.ring-[#70AEB9]]="isBubbleSelected(bubble.id)"
                [class.bg-[#70AEB9]/10]="isBubbleSelected(bubble.id)"
                class="p-3 border border-gray-200 rounded-xl hover:border-[#70AEB9] hover:bg-gray-50 transition-all group"
              >
                <!-- Checkmark -->
                <div *ngIf="isBubbleSelected(bubble.id)" class="absolute top-2 right-2 w-5 h-5 bg-[#70AEB9] rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <!-- Bubble Icon -->
                <div class="w-12 h-12 mx-auto mb-2 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                  </svg>
                </div>
                
                <p class="text-xs font-medium text-gray-900 text-center truncate">{{ bubble.name }}</p>
                <p *ngIf="bubble.memberCount" class="text-xs text-gray-500 text-center">{{ bubble.memberCount }} members</p>
              </button>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loadingBubbles && bubbles.length === 0" class="text-center py-8">
              <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <p class="text-gray-500">No bubbles available</p>
            </div>
          </div>

          <!-- Live Preview -->
          <div class="p-4 bg-[#70AEB9]/5 border border-[#70AEB9]/20 rounded-lg">
            <div class="flex items-center gap-2 text-sm">
              <svg class="w-5 h-5 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span class="font-semibold text-gray-900">
                This group includes approximately {{ estimatedMemberCount }} {{ estimatedMemberCount === 1 ? 'person' : 'people' }}
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- Footer Actions -->
      <div class="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-gray-50">
        <button
          (click)="close()"
          class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="createGroup()"
          [disabled]="!isFormValid"
          [class.opacity-50]="!isFormValid"
          [class.cursor-not-allowed]="!isFormValid"
          class="flex-1 px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:hover:shadow-none"
        >
          {{ isEditMode ? 'Update Group' : 'Create Group' }}
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class CreateVisibilityGroupDialogComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly dialogRef = inject(MatDialogRef<CreateVisibilityGroupDialogComponent>);
  private readonly data = inject(MAT_DIALOG_DATA);

  // Form controls
  groupNameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(40)
  ]);
  peopleSearchControl = new FormControl('');

  // Tab state
  activeTab: 'people' | 'bubbles' = 'people';

  // Edit mode
  isEditMode = false;
  editingGroup: any = null;

  // Data
  bubbles: Bubble[] = [];
  selectedBubbleIds: Set<string> = new Set();
  selectedPeople: Individual[] = [];
  peopleSearchResults: Individual[] = [];

  // UI state
  loadingBubbles = true;
  isSearchingPeople = false;

  ngOnInit(): void {
    // Check if we're in edit mode
    this.isEditMode = this.data?.isEditMode || false;
    this.editingGroup = this.data?.group || null;

    this.loadBubbles();
    this.setupPeopleSearch();

    if (this.isEditMode && this.editingGroup) {
      this.populateEditData();
    }
  }

  private setupPeopleSearch(): void {
    this.peopleSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.trim().length >= 2) {
          this.isSearchingPeople = true;
          return this.searchPeople(query.trim());
        } else {
          this.peopleSearchResults = [];
          this.isSearchingPeople = false;
          return of([]);
        }
      })
    ).subscribe({
      next: (results: Individual[]) => {
        this.peopleSearchResults = results;
        this.isSearchingPeople = false;
      },
      error: (error) => {
        console.error('People search error:', error);
        this.isSearchingPeople = false;
        this.peopleSearchResults = [];
      }
    });
  }

  private loadBubbles(): void {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });

    this.http.get<any[]>(`${environment.apiUrl}api/v1/chat/groups`, { headers })
      .subscribe({
        next: (response) => {
          this.bubbles = response.map((group: any) => ({
            id: group.participant?.id || group.id,
            name: group.participant?.displayName || group.name || 'Unnamed Bubble',
            img_url: group.participant?.avatar || group.avatar,
            memberCount: group.participant?.participantCount || group.participant?.chattingTo?.length || 10
          }));
          this.loadingBubbles = false;
        },
        error: (error) => {
          console.error('Error loading bubbles:', error);
          this.loadingBubbles = false;
        }
      });
  }

  private populateEditData(): void {
    // Pre-populate form with existing group data
    this.groupNameControl.setValue(this.editingGroup.name);

    // Pre-populate members
    this.editingGroup.members.forEach((member: any) => {
      if (member.member_type === 'user' && member.user_details) {
        this.selectedPeople.push(member.user_details);
      } else if (member.member_type === 'bubble') {
        this.selectedBubbleIds.add(member.bubble_id);
      }
    });
  }

  private searchPeople(query: string) {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token
    });
    const params = new HttpParams()
      .set('s', query)
      .set('users', '1')
      .set('per_page', '10');

    return this.http.get<{ users: Individual[] }>(
      `${environment.apiUrl.replace(/\/$/, '')}/api/v1/search`,
      { headers, params }
    ).pipe(
      switchMap(response => of(response.users || []))
    );
  }

  // People methods
  togglePerson(person: Individual): void {
    if (!this.isPersonSelected(person.id)) {
      this.selectedPeople.push(person);
    }
  }

  removePerson(id: number): void {
    this.selectedPeople = this.selectedPeople.filter(p => p.id !== id);
  }

  isPersonSelected(id: number): boolean {
    return this.selectedPeople.some(p => p.id === id);
  }

  // Bubble methods
  toggleBubble(id: string): void {
    if (this.selectedBubbleIds.has(id)) {
      this.selectedBubbleIds.delete(id);
    } else {
      this.selectedBubbleIds.add(id);
    }
  }

  isBubbleSelected(id: string): boolean {
    return this.selectedBubbleIds.has(id);
  }

  // Computed properties
  get isFormValid(): boolean {
    return this.groupNameControl.valid && 
           (this.selectedPeople.length > 0 || this.selectedBubbleIds.size > 0);
  }

  get estimatedMemberCount(): number {
    let count = 0;
    
    // Add selected people
    count += this.selectedPeople.length;
    
    // Add estimated members from bubbles (10 per bubble as average)
    this.bubbles.forEach(bubble => {
      if (this.selectedBubbleIds.has(bubble.id)) {
        count += bubble.memberCount || 10;
      }
    });
    
    return count;
  }

  createGroup(): void {
    if (!this.isFormValid) return;

    const members: Array<{ type: 'user' | 'bubble'; user_id?: number; bubble_id?: string }> = [];

    // Add selected people
    this.selectedPeople.forEach(person => {
      members.push({
        type: 'user',
        user_id: person.id
      });
    });

    // Add selected bubbles
    this.selectedBubbleIds.forEach(bubbleId => {
      members.push({
        type: 'bubble',
        bubble_id: bubbleId
      });
    });

    const groupData: NewVisibilityGroup = {
      name: this.groupNameControl.value || '',
      members: members
    };

    const token = this.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });

    const url = this.isEditMode
      ? `${environment.apiUrl}api/v1/posts/visibility_groups/${this.editingGroup.id}/`
      : `${environment.apiUrl}api/v1/posts/visibility_groups/create/`;

    const httpMethod = this.isEditMode ? 'put' : 'post';

    this.http[httpMethod](url, groupData, { headers })
      .subscribe({
        next: (response: any) => {
          console.log(`✅ Visibility group ${this.isEditMode ? 'updated' : 'created'}:`, response);
          this.dialogRef.close(response); // Return the created/updated group
        },
        error: (error) => {
          console.error(`❌ Error ${this.isEditMode ? 'updating' : 'creating'} visibility group:`, error);
          // Could add error handling/toast here
          this.dialogRef.close(null);
        }
      });
  }

  close(): void {
    this.dialogRef.close(null);
  }

  private getToken(): string {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      return userData.token?.access || userData.token || '';
    }
    return '';
  }
}

