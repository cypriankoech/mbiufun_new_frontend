import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Game } from '@app/models/game';
import { BottomMenuComponent } from '@app/templates/main/bottom-menu/bottom-menu.component';
import { AuthenticationService } from '@app/services/authentication.service';

interface SharedContent {
  activity: Game;
  matchId: number;
  imageUrl: string;
  participants: string[];
  caption: string;
  location?: string | { name: string, address: string, latitude: number, longitude: number, google_place_id: string };
}

@Component({
  selector: 'app-share-content',
  standalone: true,
  imports: [CommonModule, BottomMenuComponent],
  templateUrl: './share-content.html',
  styleUrl: './share-content.scss'
})
export class ShareContentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthenticationService);

  sharedContent: SharedContent | null = null;
  bannerExpanded = true;

  ngOnInit(): void {
    this.loadSharedContent();
  }

  private loadSharedContent(): void {
    // Load shared content from sessionStorage
    const storedContent = sessionStorage.getItem('sharedContent');
    if (storedContent) {
      try {
        this.sharedContent = JSON.parse(storedContent);
        console.log('Loaded shared content:', this.sharedContent);
      } catch (error) {
        console.error('Error parsing shared content:', error);
        this.goBack();
      }
    } else {
      console.warn('No shared content found, redirecting...');
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/app/activities']);
  }

  goToKumbu(): void {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.router.navigate([`/app/profile/${userId}/history`]);
    } else {
      // Fallback to activities if user not found
      this.router.navigate(['/app/activities']);
    }
  }

  toggleBanner(): void {
    this.bannerExpanded = !this.bannerExpanded;
  }

  shareToTwitter(): void {
    // Create share text
    const shareText = `Just completed "${this.sharedContent?.activity.name}" activity and earned ${this.sharedContent?.activity.points} points! #Mbiufun`;
    const shareUrl = window.location.origin;

    // Use Web Share API if available, fallback to Twitter intent
    if (navigator.share) {
      navigator.share({
        title: 'Mbiufun Activity',
        text: shareText,
        url: shareUrl
      }).catch(() => {
        this.fallbackTwitterShare(shareText, shareUrl);
      });
    } else {
      this.fallbackTwitterShare(shareText, shareUrl);
    }
  }

  private fallbackTwitterShare(text: string, url: string): void {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=400');
  }

  downloadImage(): void {
    if (!this.sharedContent?.imageUrl) return;

    // Create download link
    const link = document.createElement('a');
    link.href = this.sharedContent.imageUrl;
    link.download = `mbiufun-activity-${this.sharedContent.matchId}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Image downloaded successfully!', 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  getMatchDescription(): string {
    if (!this.sharedContent) return '';

    const { matchId, activity } = this.sharedContent;
    return `Match #${matchId} - ${activity.name}`;
  }

  getLocationDisplay(): string {
    if (!this.sharedContent?.location) return '';

    if (typeof this.sharedContent.location === 'string') {
      return this.sharedContent.location;
    } else {
      return this.sharedContent.location.name;
    }
  }
}
