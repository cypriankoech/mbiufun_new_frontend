import { Component, OnInit, inject } from '@angular/core';
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
    <div class="min-h-full relative overflow-hidden py-3 sm:py-4 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto relative z-10">
        <!-- Hero header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-extrabold tracking-tight text-[#0b4d57] sm:text-4xl">Daily Dares</h1>
          <p class="mt-2 text-[#0b4d57]/70">Small challenges. Quiet wins. Show up and grow your streak.</p>
        </div>

        <!-- Loading state -->
        <div *ngIf="isLoading" class="py-16 flex flex-col items-center justify-center text-[#0b4d57]/70">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-[#70AEB9]/30 border-t-[#70AEB9]"></div>
          <p class="mt-4">Loading daily dares…</p>
        </div>

        <!-- Empty state -->
        <div *ngIf="!isLoading && dailyDares.length === 0" class="py-16 text-center">
          <div class="w-16 h-16 mx-auto rounded-full bg-[#70AEB9]/10 flex items-center justify-center">
            <svg class="w-8 h-8 text-[#0b4d57]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 class="mt-4 text-xl font-semibold text-[#0b4d57]">No Daily Dares yet</h3>
          <p class="mt-1 text-[#0b4d57]/70">Check back soon for a fresh challenge.</p>
        </div>

        <!-- Dares list -->
        <div *ngIf="!isLoading && dailyDares.length > 0" class="space-y-6">
          <div *ngFor="let dare of dailyDares"
               class="group rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
               (click)="goToDare(dare)">
            <!-- Media header -->
            <div class="relative h-40 w-full bg-[#70AEB9]/10">
              <img [src]="dare._img || 'assets/games/1.svg'" [alt]="dare.title"
                   class="absolute inset-0 w-full h-full object-cover" (error)="onImageError(dare)">
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>

              <!-- Challenge type -->
              <span class="absolute top-3 left-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white"
                    [ngClass]="getTypePillClass(dare.challenge_type)">
                {{ dare.challenge_type || 'challenge' }}
              </span>

              <!-- Points badge -->
              <span class="absolute top-3 right-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#0b4d57] shadow">
                {{ dare.points || 10 }} pts
              </span>

              <!-- Completion ribbon -->
              <span *ngIf="dare.is_completed" class="absolute bottom-3 right-3 text-xs font-semibold text-green-200 bg-green-700/70 px-2 py-0.5 rounded">
                Completed
              </span>
            </div>

            <!-- Content -->
            <div class="p-4">
              <h2 class="text-lg sm:text-xl font-bold text-[#0b4d57]">{{ dare.title || 'Daily Challenge' }}</h2>
              <p class="mt-1 text-sm text-[#0b4d57]/70 line-clamp-2">{{ getDescription(dare) }}</p>

              <div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[#0b4d57]/70">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6.995 3h10.01A1.995 1.995 0 0 1 19 4.995v14.01A1.995 1.995 0 0 1 17.005 21H6.995A1.995 1.995 0 0 1 5 19.005V4.995A1.995 1.995 0 0 1 6.995 3zm0 2A.995.995 0 0 0 6 5.995v12.01c0 .549.446.995.995.995h10.01a.995.995 0 0 0 .995-.995V5.995A.995.995 0 0 0 17.005 5H6.995zM8 7h8v2H8V7z"/></svg>
                  <span>{{ dare.date || 'Today' }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <span [ngClass]="{'text-green-600 font-semibold': dare.user_score !== null}">
                    {{ dare.user_score !== null ? ('Score: ' + dare.user_score) : 'Not Attempted' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DailyDareComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly dareService = inject(DailyDareService);
  
  dailyDares: DailyDare[] = [];
  isLoading = true;
  private subscriptions: Subscription[] = [];

  async ngOnInit(): Promise<void> {
    // TODO: Add analytics logging
    // await this.analytics.logEvent('page_view', {"component": "DailyDareComponent"});
    
    this.dareService.fetchTodayQuiz().subscribe({
      next: (d) => {
        this.dailyDares = (d || []).map(x => this.prepareDare(x));
        this.isLoading = false;
      },
      error: () => { this.dailyDares = []; this.isLoading = false; }
    });
  }

  onImageError(dare: DailyDare): void {
    dare._img = this.getRandomImage();
  }

  goToDare(dare: DailyDare): void {
    this.router.navigate(['/app/daily-dare', dare.id], { state: { dare } });
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