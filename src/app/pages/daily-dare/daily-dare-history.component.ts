import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DailyDareService } from '@app/services/daily-dare.service';

interface QuizResponse {
  question: {
    id: number;
    question_text: string;
    question_type: string;
  };
  selected_option?: {
    id: number;
    option_text: string;
    is_correct: boolean;
  };
  text_response?: string;
  is_correct: boolean;
  points_earned: number;
}

interface DareHistory {
  id: number;
  daily_dare: {
    id: number;
    title: string;
    description: string;
    challenge_type: string;
    points: number;
    date: string;
    image_url?: string;
  };
  completed: boolean;
  completed_at: string;
  score: number;
  responses: QuizResponse[];
}

@Component({
  selector: 'app-daily-dare-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen py-6 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <button 
            (click)="goBack()"
            class="group flex items-center gap-2 text-gray-600 hover:text-[#70AEB9] transition-colors duration-200 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/50 rounded-lg px-2 py-1"
          >
            <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="font-medium">Back to Dares</span>
          </button>

          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Your Daily Dare History</h1>
          <p class="text-gray-600">View your completed challenges and scores</p>
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ history.length }}</div>
                <div class="text-sm text-gray-600">Completed</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ totalPoints }}</div>
                <div class="text-sm text-gray-600">Total Points</div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <div class="text-2xl font-bold text-gray-900">{{ averageScore }}%</div>
                <div class="text-sm text-gray-600">Avg Score</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="space-y-4">
          <div *ngFor="let i of [1,2,3]" class="animate-pulse bg-white rounded-2xl p-6 shadow-md border border-gray-100">
            <div class="flex gap-4">
              <div class="w-24 h-24 bg-gray-300 rounded-lg"></div>
              <div class="flex-1 space-y-3">
                <div class="h-6 bg-gray-300 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && history.length === 0" class="py-16 text-center">
          <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#70AEB9]/20 to-[#4ECDC4]/20 flex items-center justify-center mb-6">
            <svg class="w-12 h-12 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-2">No History Yet</h3>
          <p class="text-gray-600 mb-6">Complete your first Daily Dare to see it here!</p>
          <button
            (click)="goBack()"
            class="px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200"
          >
            View Available Dares
          </button>
        </div>

        <!-- History List -->
        <div *ngIf="!loading && history.length > 0" class="space-y-4">
          <div *ngFor="let item of history" 
               class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
               (click)="viewDetails(item)">
            <div class="flex flex-col sm:flex-row gap-4 p-6">
              <!-- Thumbnail -->
              <div class="w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10">
                <img 
                  [src]="item.daily_dare.image_url || 'assets/games/1.svg'" 
                  [alt]="item.daily_dare.title"
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- Content -->
              <div class="flex-1">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 class="text-xl font-bold text-gray-900 mb-1">{{ item.daily_dare.title }}</h3>
                    <p class="text-sm text-gray-600 line-clamp-2">{{ item.daily_dare.description }}</p>
                  </div>
                  <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-semibold flex-shrink-0">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {{ item.score }} / {{ item.daily_dare.points }} pts
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ formatDate(item.completed_at) }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="capitalize">{{ item.daily_dare.challenge_type }}</span>
                  </div>
                  <div *ngIf="item.responses && item.responses.length > 0" class="flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{{ getCorrectCount(item.responses) }}/{{ item.responses.length }} correct</span>
                  </div>
                </div>

                <!-- Progress Bar (if quiz) -->
                <div *ngIf="item.responses && item.responses.length > 0" class="mt-4">
                  <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] rounded-full transition-all duration-500"
                      [style.width.%]="(getCorrectCount(item.responses) / item.responses.length) * 100"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class DailyDareHistoryComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly dareService = inject(DailyDareService);
  private readonly snackBar = inject(MatSnackBar);

  history: DareHistory[] = [];
  loading = true;

  get totalPoints(): number {
    return this.history.reduce((sum, item) => sum + item.score, 0);
  }

  get averageScore(): number {
    if (this.history.length === 0) return 0;
    const totalPossible = this.history.reduce((sum, item) => sum + item.daily_dare.points, 0);
    const totalEarned = this.totalPoints;
    return totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.dareService.fetchHistory().subscribe({
      next: (data) => {
        this.history = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load history:', error);
        this.loading = false;
        this.snackBar.open('Failed to load history', 'Retry', {
          duration: 5000
        }).onAction().subscribe(() => {
          this.loadHistory();
        });
      }
    });
  }

  getCorrectCount(responses: QuizResponse[]): number {
    return responses.filter(r => r.is_correct).length;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  viewDetails(item: DareHistory): void {
    this.router.navigate(['/app/daily-dare', item.daily_dare.id], { 
      state: { dare: item.daily_dare, completed: true, score: item.score } 
    });
  }

  goBack(): void {
    this.router.navigate(['/app/daily-dare']);
  }
}



