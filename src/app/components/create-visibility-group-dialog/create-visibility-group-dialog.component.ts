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
    <div class="flex flex-col bg-white rounded-2xl overflow-hidden max-h-[85vh] shadow-2xl">
      <!-- Enhanced Header -->
      <div class="p-5 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-br from-[#70AEB9] via-[#5fb3be] to-[#4ECDC4] shadow-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">{{ isEditMode ? 'Edit Group' : 'Create Group' }}</h2>
              <p class="text-white/80 text-sm mt-0.5 font-medium">Quick selection shortcut</p>
            </div>
          </div>
          <button
            (click)="close()"
            class="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Close"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div class="p-5 sm:p-6 space-y-6">
          
          <!-- Enhanced Group Name Input -->
          <div>
            <label class="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
              </svg>
              Group name <span class="text-red-500">*</span>
            </label>
            <input
              type="text"
              [formControl]="groupNameControl"
              placeholder="e.g., Inner Circle, Weekend Crew..."
              maxlength="40"
              class="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
            />
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-gray-600">
                💡 Tip: Use a memorable name
              </p>
              <p class="text-xs text-gray-500">
                {{ groupNameControl.value?.length || 0 }}/40
              </p>
            </div>
            <p *ngIf="groupNameControl.invalid && groupNameControl.touched" class="text-xs text-red-600 mt-2 flex items-center gap-1 font-medium">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Group name is required (2-40 characters)
            </p>
          </div>

          <!-- Enhanced Tab Navigation -->
          <div class="border-b-2 border-gray-200">
            <div class="flex gap-2">
              <button
                (click)="activeTab = 'people'"
                [class.border-[#70AEB9]]="activeTab === 'people'"
                [class.text-[#70AEB9]]="activeTab === 'people'"
                [class.bg-[#70AEB9]/5]="activeTab === 'people'"
                [class.border-transparent]="activeTab !== 'people'"
                [class.text-gray-600]="activeTab !== 'people'"
                class="pb-3 pt-2 px-4 border-b-3 font-bold text-sm transition-all duration-200 rounded-t-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                </svg>
                People
              </button>
              <button
                (click)="activeTab = 'bubbles'"
                [class.border-[#70AEB9]]="activeTab === 'bubbles'"
                [class.text-[#70AEB9]]="activeTab === 'bubbles'"
                [class.bg-[#70AEB9]/5]="activeTab === 'bubbles'"
                [class.border-transparent]="activeTab !== 'bubbles'"
                [class.text-gray-600]="activeTab !== 'bubbles'"
                class="pb-3 pt-2 px-4 border-b-3 font-bold text-sm transition-all duration-200 rounded-t-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                </svg>
                Bubbles
              </button>
            </div>
          </div>

          <!-- Enhanced People Tab -->
          <div *ngIf="activeTab === 'people'" class="space-y-5 animate-fade-in">
            <p class="text-sm text-gray-700 font-medium bg-blue-50 p-3 rounded-lg border border-blue-100">
              🔍 Search and add specific people to this group
            </p>

            <!-- Enhanced Search People -->
            <div class="relative">
              <input
                type="text"
                [formControl]="peopleSearchControl"
                placeholder="Search by name or username..."
                class="w-full pl-12 pr-12 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
              />
              <div class="absolute left-4 top-1/2 -translate-y-1/2">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div *ngIf="peopleSearchControl.value && peopleSearchControl.value.length > 0" class="absolute right-4 top-1/2 -translate-y-1/2">
                <button
                  (click)="peopleSearchControl.setValue('')"
                  class="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Enhanced Selected People Chips -->
            <div *ngIf="selectedPeople.length > 0" class="space-y-3">
              <div class="flex items-center justify-between">
                <p class="text-sm font-bold text-gray-700">Selected People</p>
                <span class="px-2.5 py-1 bg-[#70AEB9] text-white text-xs font-bold rounded-full">{{ selectedPeople.length }}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                <div
                  *ngFor="let person of selectedPeople"
                  class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#70AEB9]/10 to-[#4ECDC4]/10 border-2 border-[#70AEB9]/30 rounded-full hover:shadow-md transition-all duration-200 animate-fade-in"
                >
                  <div class="w-6 h-6 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white text-xs font-bold">
                    {{ person.first_name.charAt(0) }}
                  </div>
                  <span class="text-sm font-semibold text-gray-900">{{ person.first_name }} {{ person.last_name }}</span>
                  <button
                    (click)="removePerson(person.id)"
                    class="p-1 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-90"
                  >
                    <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Enhanced Search Loading -->
            <div *ngIf="isSearchingPeople" class="space-y-3 animate-pulse">
              <div *ngFor="let i of [1,2,3]" class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                <div class="w-10 h-10 rounded-full bg-gray-200"></div>
                <div class="flex-1">
                  <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div class="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>

            <!-- Enhanced No Results -->
            <div *ngIf="!isSearchingPeople && peopleSearchControl.value && peopleSearchControl.value.trim().length >= 2 && peopleSearchResults.length === 0" class="text-center py-8">
              <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <p class="text-gray-900 font-semibold mb-1">No users found</p>
              <p class="text-sm text-gray-500">Try a different search term</p>
            </div>

            <!-- Enhanced Search Results -->
            <div *ngIf="!isSearchingPeople && peopleSearchResults.length > 0" class="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              <p class="text-xs font-semibold text-gray-600 mb-3">Search Results</p>
              <button
                *ngFor="let person of peopleSearchResults; let i = index"
                (click)="togglePerson(person)"
                [disabled]="isPersonSelected(person.id)"
                [style.animation-delay]="i * 50 + 'ms'"
                class="w-full p-4 flex items-center gap-3 border-2 border-gray-200 rounded-xl hover:border-[#70AEB9] hover:bg-gradient-to-r hover:from-[#70AEB9]/5 hover:to-[#4ECDC4]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md animate-fade-in"
              >
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {{ person.first_name.charAt(0) }}{{ person.last_name.charAt(0) }}
                </div>
                <div class="flex-1 text-left min-w-0">
                  <p class="font-bold text-gray-900 truncate">{{ person.first_name }} {{ person.last_name }}</p>
                  <p class="text-sm text-gray-600 truncate">@{{ person.mbiu_username }}</p>
                </div>
                <div *ngIf="isPersonSelected(person.id)" class="flex-shrink-0">
                  <div class="w-8 h-8 rounded-full bg-[#70AEB9] flex items-center justify-center animate-bounce-in">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <svg *ngIf="!isPersonSelected(person.id)" class="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Enhanced Bubbles Tab -->
          <div *ngIf="activeTab === 'bubbles'" class="space-y-5 animate-fade-in">
            <p class="text-sm text-gray-700 font-medium bg-blue-50 p-3 rounded-lg border border-blue-100">
              🫧 Select bubbles - all members will be included automatically
            </p>

            <!-- Skeleton Loading Bubbles -->
            <div *ngIf="loadingBubbles" class="grid grid-cols-2 gap-3 animate-pulse">
              <div *ngFor="let i of [1,2,3,4]" class="p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200"></div>
                <div class="h-3 bg-gray-200 rounded mx-auto w-16"></div>
              </div>
            </div>

            <!-- Enhanced Bubbles Grid -->
            <div *ngIf="!loadingBubbles && bubbles.length > 0" class="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
              <button
                *ngFor="let bubble of bubbles; let i = index"
                (click)="toggleBubble(bubble.id)"
                [class.ring-2]="isBubbleSelected(bubble.id)"
                [class.ring-[#70AEB9]]="isBubbleSelected(bubble.id)"
                [class.bg-gradient-to-br]="isBubbleSelected(bubble.id)"
                [class.from-[#70AEB9]/10]="isBubbleSelected(bubble.id)"
                [class.to-[#4ECDC4]/10]="isBubbleSelected(bubble.id)"
                [class.shadow-md]="isBubbleSelected(bubble.id)"
                [style.animation-delay]="i * 50 + 'ms'"
                class="relative p-4 border-2 border-gray-200 rounded-xl hover:border-[#70AEB9] hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group animate-fade-in"
              >
                <!-- Enhanced Checkmark -->
                <div *ngIf="isBubbleSelected(bubble.id)" class="absolute top-2 right-2 w-6 h-6 bg-[#70AEB9] rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                
                <!-- Enhanced Bubble Icon -->
                <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-200">
                  <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                  </svg>
                </div>
                
                <p class="text-xs font-semibold text-gray-900 text-center truncate mb-1">{{ bubble.name }}</p>
                <p *ngIf="bubble.memberCount" class="text-xs text-gray-600 text-center font-medium">{{ bubble.memberCount }} members</p>
              </button>
            </div>

            <!-- Enhanced Empty State -->
            <div *ngIf="!loadingBubbles && bubbles.length === 0" class="text-center py-12">
              <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                </svg>
              </div>
              <p class="text-gray-900 font-semibold mb-1">No bubbles yet</p>
              <p class="text-sm text-gray-500">Join some bubbles to add them to groups</p>
            </div>
          </div>

          <!-- Enhanced Live Preview -->
          <div class="p-4 bg-gradient-to-r from-[#70AEB9]/5 to-[#4ECDC4]/5 border-2 border-[#70AEB9]/20 rounded-xl shadow-sm">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-white shadow-sm">
                <svg class="w-5 h-5 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p class="text-xs text-gray-600 font-medium mb-0.5">Total Members</p>
                <p class="font-bold text-gray-900 text-base">
                  ~{{ estimatedMemberCount }} {{ estimatedMemberCount === 1 ? 'person' : 'people' }}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Enhanced Footer Actions -->
      <div class="p-5 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-gradient-to-b from-white to-gray-50">
        <button
          (click)="close()"
          class="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md active:scale-95"
        >
          Cancel
        </button>
        <button
          (click)="createGroup()"
          [disabled]="!isFormValid"
          [class.opacity-50]="!isFormValid"
          [class.cursor-not-allowed]="!isFormValid"
          class="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ isEditMode ? 'Update Group' : 'Create Group' }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #70AEB9;
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #5a9aa3;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    .animate-bounce-in {
      animation: bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }

    /* Tab border bottom width */
    .border-b-3 {
      border-bottom-width: 3px;
    }

    /* Smooth transitions for all interactive elements */
    button, input, select {
      transition: all 0.2s ease;
    }
  `]
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

