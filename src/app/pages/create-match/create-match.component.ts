import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GamesService } from '@app/services/games.service';
import { Game } from '@app/models/game';

@Component({
  selector: 'app-create-match',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] p-4">
      <div class="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] p-6 text-white">
          <div class="flex items-center justify-between mb-4">
            <button
              (click)="goBack()"
              class="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 class="text-xl font-bold">Create Match</h1>
            <div class="w-10"></div> <!-- Spacer for centering -->
          </div>

          <!-- Game Info -->
          <div *ngIf="currentGame" class="text-center">
            <div class="w-20 h-20 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <img
                [src]="currentGame.img_url || getTempIcon()"
                [alt]="currentGame.name"
                class="w-12 h-12 object-contain"
              />
            </div>
            <h2 class="text-xl font-bold mb-1">{{ currentGame.name }}</h2>
            <div class="flex items-center justify-center gap-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                {{ currentGame.points }} points
              </span>
              <span class="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm font-medium capitalize">
                {{ currentGame.game_mode === 'non_competitive' ? 'Vibes' : 'Competitive' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Loading State -->
          <div *ngIf="loading" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AEB9] mb-4"></div>
            <p class="text-gray-600">Loading game details...</p>
          </div>

          <!-- Game Loaded State -->
          <div *ngIf="!loading && currentGame" class="space-y-6">
            <!-- Quick Actions -->
            <div class="space-y-4">
              <button
                (click)="startQuickMatch()"
                class="w-full bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 active:scale-95"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Quick Match
              </button>

              <button
                (click)="createCustomMatch()"
                class="w-full bg-white border-2 border-[#70AEB9] text-[#70AEB9] py-4 px-6 rounded-xl font-semibold hover:bg-[#70AEB9] hover:text-white transition-all duration-200 flex items-center justify-center gap-3 active:scale-95"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Create Custom Match
              </button>
            </div>

            <!-- Coming Soon Notice -->
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div class="flex items-start gap-3">
                <svg class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 class="text-sm font-semibold text-blue-900 mb-1">Coming Soon</h3>
                  <p class="text-sm text-blue-700">
                    Full match creation with location tracking, team selection, and photo verification is coming soon!
                    For now, you can start a quick match or return to activities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div *ngIf="!loading && !currentGame" class="flex flex-col items-center justify-center py-12">
            <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Game Not Found</h3>
            <p class="text-gray-600 text-center mb-4">
              The selected activity could not be loaded. Please try again.
            </p>
            <button
              (click)="goBack()"
              class="bg-[#70AEB9] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#5d96a1] transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .animate-spin {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class CreateMatchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gamesService = inject(GamesService);

  currentGame: Game | null = null;
  loading = true;

  ngOnInit(): void {
    this.loadGame();
  }

  private loadGame(): void {
    const gameId = this.route.snapshot.params['gameId'];
    if (!gameId) {
      console.error('No game ID provided');
      this.loading = false;
      return;
    }

    this.gamesService.getGameById(gameId).subscribe({
      next: (game) => {
        this.currentGame = game;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading game:', error);
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/activities']);
  }

  startQuickMatch(): void {
    // TODO: Implement quick match functionality
    console.log('Starting quick match for:', this.currentGame?.name);
    // For now, just show a message
    alert('Quick match feature coming soon! 🚀');
  }

  createCustomMatch(): void {
    // TODO: Implement custom match creation
    console.log('Creating custom match for:', this.currentGame?.name);
    alert('Custom match creation coming soon! 🎯');
  }

  getTempIcon(): string {
    const iconsList = Array.from({ length: 20 }, (_, i) => `${i + 1}.svg`);
    const i = Math.floor(Math.random() * iconsList.length);
    return `assets/games/${iconsList[i]}`;
  }
}








