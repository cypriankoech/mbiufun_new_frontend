import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AuthenticationService } from '@app/services/authentication.service';
import { FeedService, UnifiedFeedResponse } from '@app/services/feed.service';
import { HttpClientModule } from '@angular/common/http';
import { FeatureCardComponent } from '@app/components/feature-card/feature-card.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FeatureCardComponent, HttpClientModule],
  template: `
    <div class="min-h-screen bg-[#70aeb9] py-12 pb-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-6xl mx-auto">
        <div class="text-center mb-12">
          <h1 class="text-4xl font-bold text-white mb-4">Welcome to Mbiufun!</h1>
          <p class="text-xl text-white/90 max-w-2xl mx-auto">Choose an activity to get started and connect with your community.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <app-feature-card
            *ngFor="let card of featureCards; let i = index"
            [title]="card.title"
            [description]="card.description"
            [iconUrl]="card.iconUrl"
            [routerLink]="card.routerLink"
            [disabled]="card.disabled"
            [delay]="i * 150"
          ></app-feature-card>
        </div>

        <!-- Unified Feed Preview -->
        <div class="mt-14 max-w-3xl mx-auto bg-white/95 rounded-xl shadow-xl p-4" *ngIf="feedLoaded">
          <h2 class="text-lg font-semibold text-gray-800 mb-3">Latest from your community</h2>
          <div *ngIf="loading" class="text-gray-600">Loading feed…</div>
          <div *ngIf="!loading && feed.length === 0" class="text-gray-600">No posts yet. Check back soon.</div>
          <ul *ngIf="!loading && feed.length > 0" class="space-y-4">
            <li *ngFor="let p of feed | slice:0:5" class="border rounded-lg p-3 border-gray-200">
              <div class="text-sm text-gray-500">{{ p.author?.name || 'User' }}</div>
              <div class="text-gray-800">{{ p.content || p.text || p.title }}</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `
})
export class LandingComponent implements OnInit {
  private readonly authService = inject(AuthenticationService);
  private readonly dialog = inject(MatDialog);
  private readonly feedService = inject(FeedService);

  private subscriptions: Subscription[] = [];

  public featureCards = [
    {
      title: 'Daily Dare',
      description: 'Find surprise dares to play and challenge your friends.',
      iconUrl: 'assets/icons/daily-dare.png',
      routerLink: '/app/daily-dare',
      disabled: false,
    },
    {
      title: 'Vibes',
      description: 'Find fun activities and places to go with friends.',
      iconUrl: 'assets/icons/activities.svg',
      routerLink: '/app/activities',
      disabled: false,
    },
  ];

  async ngOnInit(): Promise<void> {
    // TODO: Add analytics logging
    // await this.analytics.logEvent('page_view', {"component": "LandingComponent"});
    this.checkUserVibes();
    this.loadFeed();
  }

  checkUserVibes(): void {
    const sub = this.authService.getUserVibes().subscribe((res) => {
      const selectedVibes = res?.data ?? [];
      if (selectedVibes.length === 0) {
        this.showVibesWarning();
      }
    });
    this.subscriptions.push(sub);
  }

  showVibesWarning(): void {
    // TODO: Implement vibes warning dialog
    console.log('Vibes warning dialog not yet implemented');
  }

  openUpdateVibesDialog(): void {
    // TODO: Implement update vibes dialog
    console.log('Update vibes dialog not yet implemented');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  // Feed preview state
  loading = false;
  feed: any[] = [];
  feedLoaded = false;

  private loadFeed(): void {
    this.loading = true;
    this.feedService.getUnifiedFeed({ page: 1, per_page: 10 }).subscribe({
      next: (res: UnifiedFeedResponse) => {
        this.feed = res?.data ?? [];
        this.loading = false;
        this.feedLoaded = true;
      },
      error: () => {
        this.feed = [];
        this.loading = false;
        this.feedLoaded = true;
      }
    });
  }
}