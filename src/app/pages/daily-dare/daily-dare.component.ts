import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DailyDareService, DailyDare } from '@app/services/daily-dare.service';

@Component({
  selector: 'app-daily-dare',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-full relative overflow-hidden py-3 sm:py-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <!-- Hero header with streak info -->
        <div class="text-center mb-8 sm:mb-12">
          <div class="inline-flex items-center gap-3 mb-4 px-6 py-3 bg-gradient-to-r from-[#FF6B6B]/10 to-[#FFE66D]/10 rounded-full">
            <span class="text-3xl animate-pulse">🔥</span>
            <div class="text-left">
              <div class="text-2xl font-bold text-[#FF6B6B]">{{ currentStreak || 0 }} Day Streak</div>
              <div class="text-xs text-gray-600">Keep it going!</div>
            </div>
          </div>
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#0b4d57] via-[#70AEB9] to-[#4ECDC4]">
              Daily Dares
            </span>
          </h1>
          <p class="mt-2 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Small challenges. Quiet wins. Show up every day and grow your streak.
          </p>
        </div>

        <!-- Filter/Sort Section -->
        <div class="mb-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4">
          <div class="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              *ngFor="let filter of filterOptions"
              (click)="setFilter(filter.value)"
              [class.bg-[#70AEB9]]="selectedFilter === filter.value"
              [class.text-white]="selectedFilter === filter.value"
              [class.bg-white]="selectedFilter !== filter.value"
              [class.text-gray-700]="selectedFilter !== filter.value"
              class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border border-gray-200 hover:border-[#70AEB9] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/50 whitespace-nowrap"
            >
              {{ filter.label }}
            </button>
          </div>
          <div class="flex items-center gap-4">
            <button
              (click)="viewHistory()"
              class="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:border-[#70AEB9] hover:shadow-md transition-all duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
            <div class="text-sm text-gray-600">
              <span class="font-semibold">{{ filteredDares.length }}</span> challenges available
            </div>
          </div>
        </div>

        <!-- Loading state with skeleton -->
        <div *ngIf="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let i of [1,2,3,4,5,6]" class="animate-pulse">
            <div class="rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white">
              <div class="h-48 bg-gray-300"></div>
              <div class="p-4 space-y-3">
                <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-full"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
                <div class="flex justify-between">
                  <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoading && filteredDares.length === 0" class="py-16 text-center">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#70AEB9]/20 to-[#4ECDC4]/20 flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No dares found</h3>
          <p class="text-gray-600 mb-6">Check back soon for fresh challenges!</p>
          <button 
            (click)="setFilter('all')"
            class="px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Show All Dares
          </button>
        </div>

        <!-- Dares grid -->
        <div *ngIf="!isLoading && filteredDares.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let dare of filteredDares; let idx = index"
               class="group rounded-2xl overflow-hidden shadow-md border border-gray-100 bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
               [style.animation-delay]="(idx * 50) + 'ms'"
               (click)="goToDare(dare)">
            
            <!-- Media header -->
            <div class="relative h-48 w-full bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10 overflow-hidden">
              <img [src]="dare._img || 'assets/games/1.svg'" [alt]="dare.title"
                   class="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                   (error)="onImageError(dare)">
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

              <!-- Today's Dare Badge -->
              <div *ngIf="isTodaysDare(dare)" class="absolute top-3 left-3">
                <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] text-white text-xs font-bold shadow-lg animate-pulse">
                  <span>⭐</span>
                  <span>TODAY'S DARE</span>
                </div>
              </div>

              <!-- Challenge type -->
              <span class="absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-sm"
                    [ngClass]="getTypePillClass(dare.challenge_type)">
                {{ dare.challenge_type || 'challenge' }}
              </span>

              <!-- Points badge -->
              <div class="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg">
                <svg class="w-4 h-4 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-sm font-bold text-gray-900">{{ dare.points || 10 }}</span>
              </div>

              <!-- Completion checkmark -->
              <div *ngIf="dare.is_completed" class="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="p-5">
              <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-[#70AEB9] transition-colors duration-200 line-clamp-1">
                {{ dare.title || 'Daily Challenge' }}
              </h2>
              <p class="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">
                {{ getDescription(dare) }}
              </p>

              <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                <div class="flex items-center gap-2 text-xs text-gray-500">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{{ dare.date || 'Today' }}</span>
                </div>
                
                <div class="flex items-center gap-2">
                  <span *ngIf="dare.user_score !== null" class="flex items-center gap-1 text-xs font-semibold text-green-600">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                    </svg>
                    <span>{{ dare.user_score }}</span>
                  </span>
                  <span *ngIf="dare.user_score === null" class="text-xs text-gray-400">
                    Not started
                  </span>
                </div>
              </div>

              <!-- CTA Button -->
              <button class="w-full mt-4 px-4 py-2.5 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2">
                <span>{{ dare.is_completed ? 'View Results' : 'Start Challenge' }}</span>
                <svg class="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class DailyDareComponent implements OnInit, OnDestroy {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly dareService = inject(DailyDareService);
  
  dailyDares: DailyDare[] = [];
  isLoading = true;
  private subscriptions: Subscription[] = [];

  // Filter and display state
  currentStreak = 1; // TODO: Fetch from user profile/API
  selectedFilter: 'all' | 'today' | 'completed' | 'pending' = 'all';
  filterOptions = [
    { label: 'All', value: 'all' as const },
    { label: "Today's Dare", value: 'today' as const },
    { label: 'Completed', value: 'completed' as const },
    { label: 'Pending', value: 'pending' as const }
  ];

  get filteredDares(): DailyDare[] {
    switch (this.selectedFilter) {
      case 'today':
        return this.dailyDares.filter(d => this.isTodaysDare(d));
      case 'completed':
        return this.dailyDares.filter(d => d.is_completed);
      case 'pending':
        return this.dailyDares.filter(d => !d.is_completed);
      default:
        return this.dailyDares;
    }
  }

  async ngOnInit(): Promise<void> {
    // TODO: Add analytics logging
    // await this.analytics.logEvent('page_view', {"component": "DailyDareComponent"});

    console.log('DailyDareComponent: Starting to fetch daily dares...');
    this.dareService.fetchAll().subscribe({
      next: (d) => {
        console.log('DailyDareComponent: API response received:', d);
        console.log('DailyDareComponent: Response type:', typeof d);
        console.log('DailyDareComponent: Response is array?', Array.isArray(d));

        // Ensure we have an array to work with
        let daresArray: any[] = [];
        if (Array.isArray(d)) {
          daresArray = d;
        } else if (d && typeof d === 'object') {
          // If it's a single object, wrap it in an array
          daresArray = [d];
        }

        console.log('DailyDareComponent: Processing', daresArray.length, 'dares');

        this.dailyDares = daresArray.map(x => {
          console.log('DailyDareComponent: Processing dare:', x);
          return this.prepareDare(x);
        });

        console.log('DailyDareComponent: Final dailyDares array:', this.dailyDares);
        console.log('DailyDareComponent: filteredDares computed:', this.filteredDares);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('DailyDareComponent: API error:', err);
        console.error('DailyDareComponent: Error status:', err.status);
        console.error('DailyDareComponent: Error message:', err.message);
        this.dailyDares = [];
        this.isLoading = false;
      }
    });
  }

  setFilter(filter: 'all' | 'today' | 'completed' | 'pending'): void {
    this.selectedFilter = filter;
  }

  isTodaysDare(dare: DailyDare): boolean {
    if (!dare.date) return false;
    const today = new Date().toISOString().split('T')[0];
    return dare.date === today || dare.date === 'Today';
  }

  onImageError(dare: DailyDare): void {
    dare._img = this.getRandomImage();
  }

  goToDare(dare: DailyDare): void {
    console.log('DailyDareComponent: Navigating to dare detail page');
    console.log('DailyDareComponent: Dare object:', dare);
    console.log('DailyDareComponent: Dare ID:', dare.id);
    console.log('DailyDareComponent: Dare title:', dare.title);
    console.log('DailyDareComponent: Dare is_completed:', dare.is_completed);
    this.router.navigate(['/app/daily-dare', dare.id], { state: { dare } });
  }

  viewHistory(): void {
    this.router.navigate(['/app/daily-dare/history']);
  }

  private readonly imageAssets: string[] = Array.from({ length: 20 }, (_, i) => `assets/games/${i + 1}.svg`);
  private getRandomImage(): string {
    const idx = Math.floor(Math.random() * this.imageAssets.length);
    return this.imageAssets[idx];
  }

  private prepareDare(d: DailyDare): DailyDare {
    const img = this.getValidImageUrl(d.image_url);
    d._img = img;
    return d;
  }

  getValidImageUrl(url?: string): string {
    if (!url || !this.isValidImageUrl(url)) {
      return this.getRandomImage();
    }
    return url;
  }

  private isValidImageUrl(url: string): boolean {
    const trimmed = url.trim();
    if (trimmed.length === 0) return false;
    return /(\.svg|\.png|\.jpe?g)(\?.*)?$/i.test(trimmed);
  }

  getTypePillClass(type?: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('quiz')) return 'bg-[#0b4d57]/70';
    if (t.includes('photo') || t.includes('image')) return 'bg-[#70AEB9]';
    if (t.includes('video')) return 'bg-indigo-600/80';
    return 'bg-emerald-600/80';
  }

  getDescription(dare: DailyDare): string {
    const d = (dare?.description || '').toString().trim();
    return d.length > 0 ? d : "Complete today's challenge";
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}