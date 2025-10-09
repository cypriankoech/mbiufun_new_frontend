import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedService, AICaptionSuggestion } from '@app/services/feed.service';

@Component({
  selector: 'app-post-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-4">
      <!-- Composer Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white font-semibold">
          {{ userInitial }}
        </div>
        <button
          (click)="toggleComposer()"
          class="flex-1 text-left px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
          aria-label="Write a post"
        >
          What are you doing today?
        </button>
      </div>

      <!-- Expanded Composer -->
      <div *ngIf="isExpanded" class="space-y-4 animate-fadeIn">
        <!-- Caption Input -->
        <div>
          <label for="caption" class="sr-only">Post caption</label>
          <textarea
            id="caption"
            [(ngModel)]="caption"
            (input)="onCaptionInput()"
            placeholder="Share what you're up to..."
            rows="4"
            maxlength="500"
            class="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#70AEB9] focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/20 resize-none transition-colors duration-200"
            [attr.aria-describedby]="caption.length > 450 ? 'caption-warning' : null"
          ></textarea>
          <div class="flex justify-between items-center mt-1 text-xs">
            <span class="text-gray-500">{{ caption.length }}/500</span>
            <span
              *ngIf="caption.length > 450"
              id="caption-warning"
              class="text-orange-600"
              role="status"
            >
              {{ 500 - caption.length }} characters remaining
            </span>
          </div>
        </div>

        <!-- AI Caption Suggestions -->
        <div *ngIf="showAISuggestions && aiSuggestions.length > 0" class="space-y-2">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>AI Suggestions:</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let suggestion of aiSuggestions; let i = index"
              (click)="applySuggestion(suggestion)"
              class="px-3 py-2 rounded-lg bg-gradient-to-r from-[#70AEB9]/10 to-[#4ECDC4]/10 hover:from-[#70AEB9]/20 hover:to-[#4ECDC4]/20 text-sm text-gray-700 border border-[#70AEB9]/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
              [attr.aria-label]="'Apply suggestion: ' + suggestion.text"
            >
              {{ suggestion.text }}
            </button>
          </div>
        </div>

        <!-- Image Preview (if image selected) -->
        <div *ngIf="imagePreview" class="relative">
          <img [src]="imagePreview" alt="Preview" class="w-full h-48 object-cover rounded-xl" />
          <button
            (click)="removeImage()"
            class="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50"
            type="button"
            aria-label="Remove image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Action Buttons (WhatsApp style - image button longer, send button is icon) -->
        <div class="flex gap-2 sm:gap-3 pt-2">
          <!-- Image Upload Button (longer) -->
          <div class="relative flex-1">
            <input
              #fileInput
              type="file"
              accept="image/*"
              (change)="onImageSelect($event)"
              class="sr-only"
              id="image-upload"
              aria-label="Upload image"
            />
            <button
              (click)="fileInput.click()"
              class="w-full px-4 py-3 rounded-xl border-2 border-gray-300 hover:border-[#70AEB9] text-gray-600 hover:text-[#70AEB9] transition-colors duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
              type="button"
              title="Choose image"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ selectedImage ? 'Change image' : 'Choose image' }}</span>
            </button>
          </div>

          <!-- Send/Post Button (icon only, like WhatsApp) -->
          <button
            (click)="submitPost()"
            [disabled]="!canSubmit || isSubmitting"
            class="w-12 h-12 rounded-full bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] hover:from-[#5a9aa3] hover:to-[#3db5ac] text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 flex items-center justify-center"
            [attr.aria-busy]="isSubmitting"
            [attr.aria-label]="isSubmitting ? 'Posting...' : 'Send post'"
          >
            <svg *ngIf="!isSubmitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <svg *ngIf="isSubmitting" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </button>

          <!-- Cancel Button -->
          <button
            (click)="cancelComposer()"
            class="px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }
  `]
})
export class PostComposerComponent implements OnInit {
  private readonly feedService = inject(FeedService);
  private readonly snackBar = inject(MatSnackBar);

  @Output() postCreated = new EventEmitter<void>();

  isExpanded = false;
  caption = '';
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isSubmitting = false;
  showAISuggestions = false;
  aiSuggestions: AICaptionSuggestion[] = [];
  userInitial = 'U';
  activePostCount = 0;
  postLimit = 5;

  ngOnInit(): void {
    this.checkActivePostCount();
    this.loadAISuggestions();
    
    // Get user initial from auth service
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (user?.first_name) {
      this.userInitial = user.first_name.charAt(0).toUpperCase();
    }
  }

  toggleComposer(): void {
    if (this.activePostCount >= this.postLimit) {
      this.showPostLimitMessage();
      return;
    }
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.showAISuggestions = true;
    }
  }

  onCaptionInput(): void {
    // Could trigger real-time AI suggestions based on context
  }

  loadAISuggestions(): void {
    this.feedService.getAICaptionSuggestions().subscribe({
      next: (suggestions) => {
        this.aiSuggestions = suggestions;
      },
      error: (error) => {
        console.error('Failed to load AI suggestions:', error);
      }
    });
  }

  applySuggestion(suggestion: AICaptionSuggestion): void {
    this.caption = suggestion.text;
    this.showAISuggestions = false;
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('Image must be less than 5MB', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return;
      }

      this.selectedImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  checkActivePostCount(): void {
    this.feedService.getUserActivePostCount().subscribe({
      next: (data) => {
        this.activePostCount = data.count;
        this.postLimit = data.limit;
      },
      error: (error) => {
        console.error('Failed to check post count:', error);
        // Default to allowing posts if API fails
        this.activePostCount = 0;
        this.postLimit = 5;
      }
    });
  }

  submitPost(): void {
    if (!this.canSubmit || this.isSubmitting) return;

    if (this.activePostCount >= this.postLimit) {
      this.showPostLimitMessage();
      return;
    }

    this.isSubmitting = true;

    // Submit post to backend

    this.feedService.createPost({
      caption: this.caption,
      image: this.selectedImage || undefined
    }).subscribe({
      next: () => {
        this.snackBar.open('🎉 Post shared successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
        this.resetComposer();
        this.postCreated.emit();
        this.checkActivePostCount();
      },
      error: (error) => {
        console.error('Failed to create post:', error);
        this.isSubmitting = false;

        // Show appropriate error message
        let errorMessage = 'Unable to share post. Please check your connection and try again.';
        if (error.status === 400 && error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.status >= 500) {
          errorMessage = 'Server temporarily unavailable. Please try again in a moment.';
        }

        this.snackBar.open(`❌ ${errorMessage}`, 'Close', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  showPostLimitMessage(): void {
    this.snackBar.open(
      `You've reached your limit of ${this.postLimit} active posts. Delete an old post to share something new! 💫`,
      'Got it',
      {
        duration: 6000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['info-snackbar']
      }
    );
  }

  cancelComposer(): void {
    if (this.caption || this.selectedImage) {
      const confirmCancel = confirm('Discard your post?');
      if (!confirmCancel) return;
    }
    this.resetComposer();
  }

  resetComposer(): void {
    this.isExpanded = false;
    this.caption = '';
    this.selectedImage = null;
    this.imagePreview = null;
    this.isSubmitting = false;
    this.showAISuggestions = false;
  }

  get canSubmit(): boolean {
    return this.caption.trim().length > 0 && this.caption.length <= 500;
  }
}

