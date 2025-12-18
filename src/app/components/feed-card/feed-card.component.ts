import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedPost } from '@app/services/feed.service';
import { AuthenticationService } from '@app/services/authentication.service';

@Component({
  selector: 'app-feed-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200"
      [attr.aria-label]="'Post by ' + post.author.first_name + ' ' + post.author.last_name"
    >
      <!-- Card Header -->
      <div class="p-4">
        <div class="flex items-start gap-3">
          <!-- Avatar -->
          <button
            (click)="viewProfile()"
            class="flex-shrink-0 w-11 h-11 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white font-semibold text-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
            [attr.aria-label]="'View ' + post.author.first_name + ' profile'"
          >
            <img
              *ngIf="post.author.profile_image"
              [src]="post.author.profile_image"
              [alt]="post.author.first_name + ' ' + post.author.last_name"
              class="w-full h-full rounded-full object-cover"
            />
            <span *ngIf="!post.author.profile_image">
              {{ post.author.first_name.charAt(0) }}{{ post.author.last_name.charAt(0) }}
            </span>
          </button>

          <!-- Author & Meta Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <button
                (click)="viewProfile()"
                class="font-semibold text-gray-900 hover:text-[#70AEB9] transition-colors duration-200 focus:outline-none focus:underline"
              >
                {{ post.author.first_name }} {{ post.author.last_name }}
              </button>

              <!-- Clean Menu Button - Only show for own posts -->
              <div class="relative" *ngIf="isOwnPost()">
                <button
                  (click)="toggleMenu()"
                  class="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-200"
                  [attr.aria-expanded]="showMenu"
                  aria-label="Post options"
                >
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01" />
                  </svg>
                </button>
                <!-- Simplified Dropdown -->
                <div
                  *ngIf="showMenu"
                  class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                  role="menu"
                >
                  <button
                    (click)="deletePost()"
                    class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
                    role="menuitem"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <!-- Meta Info Row -->
            <div class="flex items-center gap-2 mt-1">
              <time
                [dateTime]="post.created_at"
                class="text-sm text-gray-500"
              >
                {{ formatTimestamp(post.created_at) }}
              </time>
              <span class="text-gray-300">•</span>
              <!-- Activity Badge -->
              <span
                *ngIf="post.hobby"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium"
              >
                {{ post.hobby.name }}
              </span>
              <!-- Friend Post Indicator -->
              <span
                *ngIf="post.is_friend_post"
                class="inline-flex items-center gap-1 text-xs text-pink-600"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                </svg>
                Friend
              </span>
            </div>
          </div>
        </div>

        <!-- Post Content -->
        <div class="mt-3">
          <!-- Caption -->
          <p class="text-gray-900 leading-relaxed whitespace-pre-wrap break-words">{{ post.caption }}</p>

          <!-- Location -->
          <div *ngIf="post.location" class="mt-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <span class="text-sm text-gray-600">{{ post.location.name }}</span>
          </div>
        </div>
      </div>

      <!-- Post Images Carousel -->
      <div *ngIf="post.image_urls && post.image_urls.length > 0" class="border-t border-gray-100 relative">
        <!-- Single Image (no carousel needed) -->
        <div *ngIf="post.image_urls.length === 1" class="p-0">
          <img
            [src]="post.image_urls[0]"
            [alt]="'Image from post by ' + post.author.first_name"
            class="w-full h-auto max-h-96 object-cover"
            loading="lazy"
            (error)="onImageError($event)"
          />
        </div>

        <!-- Multiple Images Carousel -->
        <div *ngIf="post.image_urls.length > 1" class="relative overflow-hidden group">
          <!-- Image Container -->
          <div class="relative h-64 sm:h-80 md:h-96">
            <img
              *ngFor="let imageUrl of post.image_urls; let i = index"
              [src]="imageUrl"
              [alt]="'Image ' + (i + 1) + ' from post by ' + post.author.first_name"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              [class.opacity-100]="i === currentImageIndex"
              [class.opacity-0]="i !== currentImageIndex"
              loading="lazy"
              (error)="onImageError($event)"
              (touchstart)="onTouchStart($event)"
              (touchmove)="onTouchMove($event)"
              (touchend)="onTouchEnd()"
            />
          </div>

          <!-- Navigation Arrows (only show on hover/desktop or always on mobile) -->
          <button
            *ngIf="post.image_urls.length > 2"
            (click)="previousImage()"
            class="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 md:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Previous image"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            *ngIf="post.image_urls.length > 2"
            (click)="nextImage()"
            class="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 md:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Next image"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Dot Indicators -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            <button
              *ngFor="let imageUrl of post.image_urls; let i = index"
              (click)="goToImage(i)"
              class="w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
              [class.bg-white]="i === currentImageIndex"
              [class.bg-white/50]="i !== currentImageIndex"
              [attr.aria-label]="'Go to image ' + (i + 1)"
            ></button>
          </div>

          <!-- Image Counter (optional, for clarity) -->
          <div class="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-md font-medium">
            {{ currentImageIndex + 1 }} / {{ post.image_urls.length }}
          </div>
        </div>
      </div>

      <!-- Event Details (if event post) -->
      <div *ngIf="post.post_type === 'event' && post.event_details" class="p-4 bg-gradient-to-r from-[#70AEB9]/5 to-[#4ECDC4]/5 border-t border-[#70AEB9]/10">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#70AEB9] flex items-center justify-center text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900">{{ post.event_details.title }}</h4>
            <p class="text-sm text-gray-600 mt-1">
              {{ post.event_details.date }} at {{ post.event_details.time }}
            </p>
            <a
              [href]="post.event_details.link"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 mt-2 text-sm text-[#70AEB9] hover:text-[#5a9aa3] font-medium focus:outline-none focus:underline"
            >
              See Details
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- Clean Action Bar -->
      <div class="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <div class="flex items-center gap-4">
          <!-- Comment Button -->
          <button
            (click)="openComments()"
            class="flex items-center gap-2 text-gray-600 hover:text-[#70AEB9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 rounded-lg px-2 py-1"
            aria-label="View comments"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm font-medium">{{ post.comments_count || 0 }}</span>
          </button>

          <!-- Share Button -->
          <button
            (click)="sharePost()"
            class="flex items-center gap-2 text-gray-600 hover:text-[#70AEB9] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 rounded-lg px-2 py-1 ml-auto"
            aria-label="Share post"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span class="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </article>
  `,
  styles: []
})
export class FeedCardComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthenticationService);

  @Input({ required: true }) post!: FeedPost;
  @Output() comment = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  showMenu = false;

  // Image carousel state
  currentImageIndex = 0;
  isDragging = false;
  startX = 0;
  currentX = 0;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  viewProfile(): void {
    this.router.navigate(['/app/profile', this.post.author.id]);
  }

  openComments(): void {
    this.comment.emit(this.post.id);
  }

  sharePost(): void {
    if (navigator.share) {
      navigator.share({
        title: `Post by ${this.post.author.first_name} ${this.post.author.last_name}`,
        text: this.post.caption,
        url: window.location.href
      }).catch(err => console.log('Share cancelled', err));
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.snackBar.open('Link copied to clipboard!', 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      });
    }
  }

  deletePost(): void {
    const confirmed = confirm('Are you sure you want to delete this post?');
    if (confirmed) {
      this.delete.emit(this.post.id);
      this.showMenu = false;
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    console.warn('Failed to load image:', this.post.image_urls?.[0] || 'unknown image');
  }

  isOwnPost(): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser ? this.post.author.id === currentUser.id : false;
  }

  // Image carousel methods
  nextImage(): void {
    if (this.post.image_urls && this.post.image_urls.length > 1) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.post.image_urls.length;
    }
  }

  previousImage(): void {
    if (this.post.image_urls && this.post.image_urls.length > 1) {
      this.currentImageIndex = this.currentImageIndex === 0
        ? this.post.image_urls.length - 1
        : this.currentImageIndex - 1;
    }
  }

  goToImage(index: number): void {
    if (this.post.image_urls && index >= 0 && index < this.post.image_urls.length) {
      this.currentImageIndex = index;
    }
  }

  // Touch/swipe handling
  onTouchStart(event: TouchEvent): void {
    this.isDragging = true;
    this.startX = event.touches[0].clientX;
    this.currentX = this.startX;
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    this.currentX = event.touches[0].clientX;
  }

  onTouchEnd(): void {
    if (!this.isDragging) return;

    const diffX = this.startX - this.currentX;
    const threshold = 50; // Minimum swipe distance

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        this.nextImage(); // Swipe left = next image
      } else {
        this.previousImage(); // Swipe right = previous image
      }
    }

    this.isDragging = false;
  }
}

