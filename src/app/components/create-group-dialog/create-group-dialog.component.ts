import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { environment } from '@environments/environment';
import { GroupsService } from '@app/services/groups.service';

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface UserSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  mbiu_username: string;
  profile_image?: string;
}

interface SelectedParticipant {
  id: number;
  name: string;
  username: string;
  avatar?: string;
}

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    DragDropModule
  ],
  template: `
    <div class="relative bg-white rounded-3xl shadow-2xl overflow-hidden" style="max-width: 550px; max-height: 90vh;">
      
      <!-- Decorative Header Background -->
      <div class="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#70AEB9] via-[#4ECDC4] to-[#70AEB9] opacity-10"></div>
      
      <!-- Header -->
      <div class="relative p-6 pb-4">
        <button
          (click)="closeDialog()"
          class="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 z-10"
          type="button"
          [disabled]="isCreating"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div class="flex items-center gap-4 mb-2">
          <div class="w-14 h-14 bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] rounded-2xl flex items-center justify-center shadow-lg">
            <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Create New Bubble</h2>
            <p class="text-sm text-gray-500">Build your community space</p>
          </div>
        </div>
      </div>

      <!-- Form Container with Scroll -->
      <div class="overflow-y-auto px-6 pb-6" style="max-height: calc(90vh - 220px);">
        <form [formGroup]="groupForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Bubble Name -->
          <div class="space-y-2">
            <label for="name" class="block text-sm font-semibold text-gray-700">
              Bubble Name <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                type="text"
                id="name"
                formControlName="name"
                placeholder="e.g., Study Squad, Fitness Friends..."
                maxlength="50"
                class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#70AEB9] transition-all duration-200"
                [class.border-gray-200]="!groupForm.get('name')?.errors || !groupForm.get('name')?.touched"
                [class.border-red-400]="groupForm.get('name')?.errors && groupForm.get('name')?.touched"
              />
              <div class="absolute right-3 top-3 text-xs text-gray-400">
                {{ groupForm.get('name')?.value?.length || 0 }}/50
              </div>
            </div>
            <p *ngIf="groupForm.get('name')?.errors?.['required'] && groupForm.get('name')?.touched" 
               class="text-xs text-red-500 mt-1 flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
              Bubble name is required
            </p>
            <p *ngIf="groupForm.get('name')?.errors?.['minlength'] && groupForm.get('name')?.touched" 
               class="text-xs text-red-500 mt-1">
              Name must be at least 2 characters
            </p>
          </div>

          <!-- Category Selection -->
          <div class="space-y-3">
            <label class="block text-sm font-semibold text-gray-700">
              Category
            </label>
            <div class="grid grid-cols-3 gap-3">
              <button
                *ngFor="let cat of categories"
                type="button"
                (click)="selectCategory(cat.value)"
                class="relative p-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md"
                [class.border-gray-200]="groupForm.get('category')?.value !== cat.value"
                [class.bg-white]="groupForm.get('category')?.value !== cat.value"
                [class.border-[#70AEB9]]="groupForm.get('category')?.value === cat.value"
                [class.shadow-lg]="groupForm.get('category')?.value === cat.value"
                [style.background]="groupForm.get('category')?.value === cat.value ? 'linear-gradient(135deg, rgba(112, 174, 185, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)' : ''"
              >
                <div class="text-2xl mb-1">{{ cat.icon }}</div>
                <div class="text-xs font-medium text-gray-700">{{ cat.label }}</div>
                <div *ngIf="groupForm.get('category')?.value === cat.value" 
                     class="absolute -top-1 -right-1 w-5 h-5 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                  <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Description -->
          <div class="space-y-2">
            <label for="description" class="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <div class="relative">
              <textarea
                id="description"
                formControlName="description"
                placeholder="What's your bubble about? Share the vibe..."
                rows="3"
                maxlength="200"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#70AEB9] transition-all duration-200 resize-none"
              ></textarea>
              <div class="absolute right-3 bottom-3 text-xs text-gray-400">
                {{ groupForm.get('description')?.value?.length || 0 }}/200
              </div>
            </div>
          </div>

          <!-- Add Participants -->
          <div class="space-y-3">
            <label class="block text-sm font-semibold text-gray-700">
              Add Participants <span class="text-xs text-gray-500 font-normal">(Optional)</span>
            </label>

            <!-- Selected Participants Chips -->
            <div *ngIf="selectedParticipants.length > 0" class="flex flex-wrap gap-2 mb-3">
              <div *ngFor="let participant of selectedParticipants"
                   class="inline-flex items-center gap-2 bg-[#70AEB9]/10 text-[#70AEB9] px-3 py-1 rounded-full text-sm">
                <div class="w-5 h-5 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-xs font-semibold text-gray-600">
                    {{ participant.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <span class="font-medium">{{ participant.name }}</span>
                <button
                  (click)="removeParticipant(participant.id)"
                  class="ml-1 hover:bg-[#70AEB9]/20 rounded-full p-0.5 transition-colors"
                  type="button"
                  aria-label="Remove participant"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Search Input -->
            <div class="relative">
              <form [formGroup]="searchForm" class="relative">
                <input
                  type="text"
                  formControlName="query"
                  placeholder="Search for friends to add..."
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#70AEB9] transition-all duration-200"
                />

                <!-- Search Icon -->
                <div class="absolute right-3 top-3 text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>
            </div>

            <!-- Search Results -->
            <div *ngIf="showSearchResults" class="relative z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              <div *ngIf="isSearching" class="p-4 text-center text-gray-500">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#70AEB9] mx-auto mb-2"></div>
                Searching...
              </div>

              <div *ngIf="!isSearching && searchResults.length === 0" class="p-4 text-center text-gray-500">
                No users found
              </div>

              <div *ngIf="!isSearching && searchResults.length > 0">
                <button
                  *ngFor="let user of searchResults"
                  (click)="selectParticipant(user)"
                  class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  type="button"
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

            <!-- Helper Text -->
            <p class="text-xs text-gray-500">
              Search by name or username. Selected participants will be invited to join your bubble.
            </p>
          </div>

          <!-- Privacy Settings -->
          <div class="space-y-3">
            <label class="block text-sm font-semibold text-gray-700">
              Privacy
            </label>
            <div class="space-y-2">
              <button
                type="button"
                (click)="selectPrivacy('public')"
                class="w-full p-4 rounded-xl border-2 transition-all duration-200 text-left"
                [class.border-gray-200]="groupForm.get('privacy')?.value !== 'public'"
                [class.bg-white]="groupForm.get('privacy')?.value !== 'public'"
                [class.border-[#70AEB9]]="groupForm.get('privacy')?.value === 'public'"
                [class.shadow-lg]="groupForm.get('privacy')?.value === 'public'"
                [style.background]="groupForm.get('privacy')?.value === 'public' ? 'linear-gradient(135deg, rgba(112, 174, 185, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)' : ''"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-gray-900">Public Bubble</span>
                      <div *ngIf="groupForm.get('privacy')?.value === 'public'" 
                           class="w-5 h-5 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Anyone can discover and join your bubble</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                (click)="selectPrivacy('private')"
                class="w-full p-4 rounded-xl border-2 transition-all duration-200 text-left"
                [class.border-gray-200]="groupForm.get('privacy')?.value !== 'private'"
                [class.bg-white]="groupForm.get('privacy')?.value !== 'private'"
                [class.border-[#70AEB9]]="groupForm.get('privacy')?.value === 'private'"
                [class.shadow-lg]="groupForm.get('privacy')?.value === 'private'"
                [style.background]="groupForm.get('privacy')?.value === 'private' ? 'linear-gradient(135deg, rgba(112, 174, 185, 0.1) 0%, rgba(78, 205, 196, 0.1) 100%)' : ''"
              >
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-semibold text-gray-900">Private Bubble</span>
                      <div *ngIf="groupForm.get('privacy')?.value === 'private'" 
                           class="w-5 h-5 bg-[#4ECDC4] rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">Only invited members can join</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div *ngIf="isCreating" class="flex flex-col items-center justify-center py-6 gap-3">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 border-4 border-[#70AEB9]/20 rounded-full"></div>
              <div class="absolute inset-0 border-4 border-transparent border-t-[#70AEB9] rounded-full animate-spin"></div>
            </div>
            <p class="text-sm font-medium text-gray-600">Creating your bubble...</p>
          </div>

        </form>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-100 p-6 pt-4">
        <div class="flex items-center gap-3">
          <button
            (click)="closeDialog()"
            type="button"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
            [disabled]="isCreating"
          >
            Cancel
          </button>
          <button
            (click)="onSubmit()"
            type="button"
            class="flex-1 px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-xl hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            [disabled]="groupForm.invalid || isCreating"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Bubble
            </span>
          </button>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .create-group-dialog {
      animation: slideInUp 0.3s ease-out;
    }
  `]
})
export class CreateGroupDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateGroupDialogComponent>);
  private readonly groupsService = inject(GroupsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly http = inject(HttpClient);

  groupForm: FormGroup;
  isCreating = false;

  // Search functionality
  searchForm!: FormGroup;
  searchResults: UserSearchResult[] = [];
  selectedParticipants: SelectedParticipant[] = [];
  isSearching = false;
  showSearchResults = false;

  // Validation states
  validationErrors: string[] = [];
  showPreview = false;

  categories: CategoryOption[] = [
    { value: 'social', label: 'Social', icon: '🎉', color: '#FF6B6B' },
    { value: 'gaming', label: 'Gaming', icon: '🎮', color: '#4ECDC4' },
    { value: 'study', label: 'Study', icon: '📚', color: '#FFD93D' },
    { value: 'fitness', label: 'Fitness', icon: '💪', color: '#6BCB77' },
    { value: 'work', label: 'Work', icon: '💼', color: '#70AEB9' },
    { value: 'other', label: 'Other', icon: '✨', color: '#A8DADC' }
  ];

  private setupSearch(): void {
    this.searchForm.get('query')?.valueChanges.pipe(
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

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.groupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      category: ['social'],
      privacy: ['public']
    });

    this.searchForm = this.fb.group({
      query: ['']
    });

    // Set up search with debouncing
    this.setupSearch();

    // Form validation on changes
    this.groupForm.valueChanges.subscribe(() => {
      if (this.showPreview) {
        this.validateForm();
      }
    });
  }

  selectCategory(category: string): void {
    this.groupForm.patchValue({ category });
  }

  selectPrivacy(privacy: string): void {
    this.groupForm.patchValue({ privacy });
  }

  private searchUsers(query: string) {
    const headers = {
      'Content-Type': 'application/json',
      'mbiu-token': localStorage.getItem('mbiu-token') || ''
    };

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

  selectParticipant(user: UserSearchResult): void {
    // Check if user is already selected
    const isAlreadySelected = this.selectedParticipants.some(p => p.id === user.id);
    if (isAlreadySelected) return;

    const participant: SelectedParticipant = {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      username: user.mbiu_username,
      avatar: user.profile_image
    };

    this.selectedParticipants.push(participant);
    this.searchForm.patchValue({ query: '' });
    this.searchResults = [];
    this.showSearchResults = false;
  }

  removeParticipant(participantId: number): void {
    this.selectedParticipants = this.selectedParticipants.filter(p => p.id !== participantId);
  }

  onParticipantDrop(event: CdkDragDrop<SelectedParticipant[]>): void {
    moveItemInArray(this.selectedParticipants, event.previousIndex, event.currentIndex);
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
    this.validateForm();
  }

  private validateForm(): void {
    this.validationErrors = [];

    const name = this.groupForm.get('name')?.value || '';
    const description = this.groupForm.get('description')?.value || '';

    // Name validation
    if (!name.trim()) {
      this.validationErrors.push('Group name is required');
    } else if (name.length < 2) {
      this.validationErrors.push('Group name must be at least 2 characters');
    } else if (name.length > 100) {
      this.validationErrors.push('Group name cannot exceed 100 characters');
    } else if (!name.replace(/[\s\-_]/g, '').match(/^[a-zA-Z0-9]+$/)) {
      this.validationErrors.push('Group name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    // Description validation
    if (description.length > 500) {
      this.validationErrors.push('Description cannot exceed 500 characters');
    }

    // Participant validation
    if (this.selectedParticipants.length > 50) {
      this.validationErrors.push('Cannot add more than 50 participants');
    }
  }

  private getHeaders() {
    const token = localStorage.getItem('mbiu-token');
    return {
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    };
  }

  onSubmit(): void {
    if (this.groupForm.valid && !this.isCreating) {
      this.isCreating = true;

      const groupData = {
        name: this.groupForm.value.name.trim(),
        description: this.groupForm.value.description?.trim() || '',
        category: this.groupForm.value.category,
        privacy: this.groupForm.value.privacy,
        participants: this.selectedParticipants.filter(p => p.username && p.username.trim()).map(p => p.username.trim()) // Include selected participants with valid usernames
      };

      // Call the backend API to create the group
      this.groupsService.createGroup(groupData).subscribe({
        next: (response) => {
          console.log('Group created successfully:', response);
          
          // Get participant count from response
          const participantCount = response.participant_count || response.participantCount || (response.participant?.chattingTo?.length || 0);
          
          this.snackBar.open(`✨ "${groupData.name}" bubble created successfully!`, 'View', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close({
            ...groupData,
            id: response.id || response.group_id || response.participant?.id,
            participants: response.participant?.chattingTo || [],
            participantCount: participantCount,
            createdAt: new Date().toISOString()
          });
        },
        error: (error) => {
          console.error('Failed to create group:', error);
          this.isCreating = false;

          // Handle validation errors from backend
          if (error.error?.errors && Array.isArray(error.error.errors)) {
            this.validationErrors = error.error.errors;
            this.snackBar.open('❌ Please fix the validation errors below', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          } else {
            // Show error message
            const errorMessage = error.error?.detail || error.error?.message || error.message || 'Failed to create bubble. Please try again.';
            this.snackBar.open(`❌ ${errorMessage}`, 'Close', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.groupForm.controls).forEach(key => {
        this.groupForm.get(key)?.markAsTouched();
      });
      
      // Scroll to first error
      const firstError = document.querySelector('.border-red-400');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  closeDialog(): void {
    if (!this.isCreating) {
      this.dialogRef.close();
    }
  }
}
