import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FeedPost } from '@app/services/feed.service';

@Component({
  selector: 'app-feed-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article
      class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
      [attr.aria-label]="'Post by ' + post.author.first_name + ' ' + post.author.last_name"
    >
      <!-- Card Header -->
      <div class="p-4 sm:p-5">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3 flex-1">
            <!-- Avatar -->
            <button
              (click)="viewProfile()"
              class="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white font-semibold text-lg hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
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

            <!-- Author Info -->
            <div class="flex-1 min-w-0">
              <button
                (click)="viewProfile()"
                class="font-semibold text-gray-900 hover:text-[#70AEB9] transition-colors duration-200 text-left focus:outline-none focus:underline"
              >
                {{ post.author.first_name }} {{ post.author.last_name }}
              </button>
              <div class="flex items-center gap-2 flex-wrap mt-0.5">
                <time
                  [dateTime]="post.created_at"
                  class="text-sm text-gray-500"
                >
                  {{ formatTimestamp(post.created_at) }}
                </time>
                <!-- Hobby Chip -->
                <span
                  *ngIf="post.hobby"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#70AEB9]/10 text-[#0b4d57] text-xs font-medium border border-[#70AEB9]/20"
                >
                  <span *ngIf="post.hobby.icon">{{ post.hobby.icon }}</span>
                  {{ post.hobby.name }}
                </span>
                <!-- Friend Post Pill -->
                <span
                  *ngIf="post.is_friend_post"
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-xs font-medium border border-pink-200"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                  </svg>
                  Friend Post
                </span>
              </div>
            </div>
          </div>

          <!-- Overflow Menu -->
          <div class="relative" *ngIf="!post.is_friend_post">
            <button
              (click)="toggleMenu()"
              class="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
              [attr.aria-expanded]="showMenu"
              aria-label="Post options"
            >
              <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            <!-- Dropdown Menu -->
            <div
              *ngIf="showMenu"
              class="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10"
              role="menu"
            >
              <button
                (click)="deletePost()"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-2"
                role="menuitem"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Post
              </button>
            </div>
          </div>
        </div>

        <!-- Caption -->
        <div class="mt-3">
          <p class="text-gray-800 whitespace-pre-wrap break-words">{{ post.caption }}</p>
        </div>
      </div>

      <!-- Post Image -->
      <div *ngIf="post.image_url" class="w-full">
        <img
          [src]="post.image_url"
          [alt]="'Image from post by ' + post.author.first_name"
          class="w-full h-auto max-h-[500px] object-cover"
          loading="lazy"
        />
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

      <!-- Action Bar -->
      <div class="px-4 sm:px-5 py-3 border-t border-gray-100">
        <div class="flex items-center justify-between">
          <!-- Like Button -->
          <button
            (click)="toggleLike()"
            [disabled]="likeLoading"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 group"
            [class.text-red-500]="post.is_liked"
            [attr.aria-label]="post.is_liked ? 'Unlike post' : 'Like post'"
            [attr.aria-pressed]="post.is_liked"
          >
            <svg class="w-5 h-5 transition-transform duration-200 group-hover:scale-110" [class.fill-current]="post.is_liked" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span class="text-sm font-medium">{{ post.likes_count }}</span>
          </button>

          <!-- Comment Button -->
          <button
            (click)="openComments()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
            aria-label="View comments"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span class="text-sm font-medium text-gray-700">{{ post.comments_count }}</span>
          </button>

          <!-- Share Button -->
          <button
            (click)="sharePost()"
            class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50"
            aria-label="Share post"
          >
            <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
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

  @Input({ required: true }) post!: FeedPost;
  @Output() like = new EventEmitter<number>();
  @Output() unlike = new EventEmitter<number>();
  @Output() comment = new EventEmitter<number>();
  @Output() delete = new EventEmitter<number>();

  showMenu = false;
  likeLoading = false;

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  viewProfile(): void {
    this.router.navigate(['/app/profile', this.post.author.id]);
  }

  toggleLike(): void {
    if (this.likeLoading) return;
    
    this.likeLoading = true;
    
    if (this.post.is_liked) {
      this.unlike.emit(this.post.id);
    } else {
      this.like.emit(this.post.id);
    }
    
    // Reset loading state after a short delay
    setTimeout(() => {
      this.likeLoading = false;
    }, 500);
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
}

