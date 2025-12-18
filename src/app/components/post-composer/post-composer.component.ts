import { Component, EventEmitter, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { FeedService, AICaptionSuggestion } from '@app/services/feed.service';
import { MapLocationPickerComponent } from '@app/components/map-location-picker/map-location-picker.component';
import { VisibilitySelectorComponent } from '@app/components/visibility-selector/visibility-selector.component';
import { environment } from '@environments/environment';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

@Component({
  selector: 'app-post-composer',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

        <!-- Location Input -->
        <div>
          <button
            *ngIf="!selectedLocation"
            (click)="openMapPicker()"
            type="button"
            class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#70AEB9] hover:bg-[#70AEB9]/5 transition-all text-left flex items-center gap-3 group"
          >
            <svg class="w-6 h-6 text-gray-400 group-hover:text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="text-gray-600 group-hover:text-[#70AEB9]">📍 Add location from map</span>
          </button>

          <!-- Selected Location Display -->
          <div *ngIf="selectedLocation" class="border border-[#70AEB9] rounded-lg p-3 bg-[#70AEB9]/5">
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-start gap-3 flex-1 min-w-0">
                <svg class="w-5 h-5 text-[#70AEB9] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900">{{ selectedLocation.name }}</p>
                  <p class="text-sm text-gray-600 mt-0.5">{{ selectedLocation.address }}</p>
                </div>
              </div>
              <button
                (click)="clearLocation()"
                type="button"
                class="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Clear location"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Visibility Selector -->
        <div>
          <button
            (click)="openVisibilitySelector()"
            type="button"
            class="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#70AEB9] hover:bg-[#70AEB9]/5 transition-all text-left flex items-center gap-3 group"
          >
            <svg class="w-6 h-6 text-gray-400 group-hover:text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            <div class="flex-1">
              <span class="text-gray-600 group-hover:text-[#70AEB9] font-medium">
                {{ selectedVisibility.is_public ? '👁️ Visible to Everyone' : '👁️ Custom Audience' }}
              </span>
              <p *ngIf="!selectedVisibility.is_public" class="text-xs text-gray-500 mt-0.5">
                {{ getVisibilityDescription() }}
              </p>
            </div>
          </button>
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

        <!-- Photo Upload Section -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">Photos ({{ uploadedPhotos.length }}/{{ maxPhotos }}) <span class="text-sm font-normal text-gray-500">optional</span></h3>
        </div>

          <div class="p-4 space-y-4">
            <!-- Photo Upload Button -->
            <div *ngIf="uploadedPhotos.length < maxPhotos" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#70AEB9] transition-colors">
            <input
              #fileInput
              type="file"
              accept="image/*"
              (change)="onImageSelect($event)"
                class="hidden"
                id="photo-upload"
                aria-label="Upload photo"
              />
              <label
                for="photo-upload"
                class="cursor-pointer flex flex-col items-center"
              >
                <svg class="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-gray-600 font-medium">Add Photo</p>
                <p class="text-gray-400 text-sm">PNG, JPG up to 5MB</p>
              </label>
            </div>

            <!-- Uploaded Photos -->
            <div *ngIf="uploadedPhotos.length > 0" class="space-y-3">
              <div
                *ngFor="let photo of uploadedPhotos; let i = index"
                class="border border-gray-200 rounded-lg p-3 bg-gray-50"
              >
                <div class="flex items-center gap-3">
                  <!-- Photo Preview -->
                  <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      [src]="photo.preview"
                      [alt]="'Image ' + (i + 1)"
                      class="w-full h-full object-cover cursor-pointer"
                      (click)="viewPhoto(photo)"
                    >
                  </div>

                  <!-- Photo Info -->
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">Image {{ i + 1 }}</p>
                    <p class="text-sm text-gray-500">{{ photo.file.name }}</p>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-2">
                    <button
                      (click)="viewPhoto(photo)"
                      class="p-2 text-gray-600 hover:text-[#70AEB9] hover:bg-[#70AEB9]/10 rounded-full transition-colors"
                      aria-label="View photo"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
            <button
                      (click)="removePhoto(photo)"
                      class="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                      aria-label="Delete photo"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 sm:gap-3 pt-2">
          <!-- Send/Post Button -->
          <button
            (click)="submitPost()"
            [disabled]="!canSubmit || isSubmitting"
            class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] hover:from-[#5a9aa3] hover:to-[#3db5ac] text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 flex items-center justify-center gap-2"
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
            <span>{{ isSubmitting ? 'Posting...' : 'Share Post' }}</span>
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
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);

  @Output() postCreated = new EventEmitter<void>();

  isExpanded = false;
  caption = '';
  uploadedPhotos: UploadedPhoto[] = [];
  maxPhotos = 3;
  isSubmitting = false;
  showAISuggestions = false;
  aiSuggestions: AICaptionSuggestion[] = [];
  userInitial = 'U';
  activePostCount = 0;
  postLimit = 5;

  // Location properties
  locationSearchControl = new FormControl('');
  locationSuggestions: { name: string, address: string, latitude: number, longitude: number, google_place_id: string }[] = [];
  selectedLocation: { name: string, address: string, latitude: number, longitude: number, google_place_id: string } | null = null;

  // Visibility properties
  selectedVisibility: { is_public: boolean; bubbles: string[]; individuals: number[]; groups: number[] } = {
    is_public: true,
    bubbles: [],
    individuals: [],
    groups: []
  };

  ngOnInit(): void {
    this.checkActivePostCount();
    this.loadAISuggestions();
    this.setupLocationSearch();
    
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

  setupLocationSearch(): void {
    // Setup debounced location search
    this.locationSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 3) {
          this.locationSuggestions = [];
          return of([]);
        }
        return this.searchLocations(query.trim());
      })
    ).subscribe({
      next: (suggestions) => {
        this.locationSuggestions = suggestions;
      },
      error: (error) => {
        console.error('Location search error:', error);
        this.locationSuggestions = [];
      }
    });
  }

  private searchLocations(query: string) {
    const headers = this.getHeaders();
    const params = new HttpParams()
      .set('q', query);

    return this.http.get<{ data: any[] }>(
      `${environment.apiUrl.replace(/\/$/, '')}/api/v1/games/location/search/`,
      { headers, params }
    ).pipe(
      switchMap(response => of(response.data || []))
    );
  }

  openMapPicker(): void {
    const dialogRef = this.dialog.open(MapLocationPickerComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      panelClass: ['full-screen-dialog'],
      hasBackdrop: true,
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedLocation = result;
        console.log('📍 Location selected from map:', result);
      }
    });
  }

  openVisibilitySelector(): void {
    const dialogRef = this.dialog.open(VisibilitySelectorComponent, {
      width: '100vw',
      maxWidth: '100vw',
      height: '100vh',
      maxHeight: '100vh',
      panelClass: ['full-screen-dialog'],
      hasBackdrop: true,
      disableClose: false,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedVisibility = result;
        console.log('👁️ Visibility selected:', result);
      }
    });
  }

  getVisibilityDescription(): string {
    const parts = [];
    if (this.selectedVisibility.bubbles.length > 0) {
      parts.push(`${this.selectedVisibility.bubbles.length} bubble${this.selectedVisibility.bubbles.length > 1 ? 's' : ''}`);
    }
    if (this.selectedVisibility.individuals.length > 0) {
      parts.push(`${this.selectedVisibility.individuals.length} person${this.selectedVisibility.individuals.length > 1 ? 's' : ''}`);
    }
    if (this.selectedVisibility.groups.length > 0) {
      parts.push(`${this.selectedVisibility.groups.length} group${this.selectedVisibility.groups.length > 1 ? 's' : ''}`);
    }
    return parts.join(', ') || 'Custom selection';
  }

  selectLocation(location: { name: string, address: string, latitude: number, longitude: number, google_place_id: string }): void {
    this.selectedLocation = location;
    this.locationSearchControl.setValue(location.name);
    this.locationSuggestions = [];
  }

  clearLocation(): void {
    this.selectedLocation = null;
    this.locationSearchControl.setValue('');
    this.locationSuggestions = [];
  }

  private getHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('dev_am_token');
    return {
      'mbiu-token': token || '',
      'Content-Type': 'application/json'
    };
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.addPhoto(file);

      // Reset the input so the same file can be selected again
      input.value = '';
    }
  }

  private async addPhoto(file: File): Promise<void> {
    if (this.uploadedPhotos.length >= this.maxPhotos) {
      this.snackBar.open(`Maximum ${this.maxPhotos} photos allowed`, 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Validate and compress file size
    const maxSize = 3 * 1024 * 1024; // 3MB (reasonable for compressed images)
    let processedFile = file;

    // Show compression loading for large files
    const needsCompression = file.size > maxSize;
    if (needsCompression) {
      this.snackBar.open('Compressing image...', 'Close', {
        duration: 1000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }

    if (file.size > maxSize) {
      try {
        processedFile = await this.compressImage(file, maxSize);
        if (processedFile.size > maxSize) {
          this.snackBar.open('File size must be less than 3MB after compression', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          return;
        }
      } catch (error) {
        this.snackBar.open('Failed to compress image. Please try a smaller file.', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        return;
      }
    }
      
      const reader = new FileReader();
      reader.onload = (e) => {
      const preview = e.target?.result as string;
      const photo: UploadedPhoto = {
        id: Date.now().toString(),
        file: processedFile,
        preview: preview,
        caption: ''
      };
      this.uploadedPhotos.push(photo);
      };
    reader.readAsDataURL(processedFile);
    }

  private async compressImage(file: File, maxSize: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        // Reduce quality/size progressively until under limit
        let quality = 0.9;
        let compressedFile: File;

        const compress = () => {
          // Resize large images
          if (width > 1920 || height > 1920) {
            const ratio = Math.min(1920 / width, 1920 / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });

              if (compressedFile.size <= maxSize || quality <= 0.1) {
                resolve(compressedFile);
              } else {
                quality -= 0.1;
                compress();
              }
            } else {
              reject(new Error('Compression failed'));
            }
          }, file.type, quality);
        };

        compress();
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = URL.createObjectURL(file);
    });
  }

  removePhoto(photo: UploadedPhoto): void {
    this.uploadedPhotos = this.uploadedPhotos.filter(p => p.id !== photo.id);
  }

  viewPhoto(photo: UploadedPhoto): void {
    // TODO: Implement full-size photo viewer
    console.log('View photo:', photo);
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

    const postPayload = {
      caption: this.caption,
      images: this.uploadedPhotos.length > 0 ? this.uploadedPhotos.map(p => p.file) : undefined,
      location: this.selectedLocation || undefined,
      visibility: this.selectedVisibility
    };
    
    console.log('📍 Creating post with payload:', postPayload);
    console.log('📍 Selected location:', this.selectedLocation);
    console.log('👁️ Selected visibility:', this.selectedVisibility);
    
    this.feedService.createPost(postPayload).subscribe({
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
    if (this.caption || this.uploadedPhotos.length > 0) {
      const confirmCancel = confirm('Discard your post?');
      if (!confirmCancel) return;
    }
    this.resetComposer();
  }

  resetComposer(): void {
    this.isExpanded = false;
    this.caption = '';
    this.uploadedPhotos = [];
    this.isSubmitting = false;
    this.showAISuggestions = false;
    this.clearLocation();
  }

  get canSubmit(): boolean {
    return this.caption.trim().length > 0 && this.caption.length <= 500;
  }
}

