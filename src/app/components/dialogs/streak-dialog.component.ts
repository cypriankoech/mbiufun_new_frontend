import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { StreakService } from '../../services/streak.service';
import { StreakData } from '../../models/streak';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-streak-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="flex items-center justify-between bg-[#70AEB9] p-4 rounded-t-lg sticky top-0 z-10">
      <h2 class="text-2xl font-bold text-white flex items-center gap-3">
        <span class="animate-pulse">🔥</span> Your Streak Journey
      </h2>
      <button (click)="closeDialog()" class="flex items-center justify-center w-8 h-8 text-white hover:bg-white/20 rounded-full transition-colors duration-200" aria-label="Close dialog">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="bg-white p-6 overflow-y-auto max-h-[calc(92vh-120px)]">
      <div *ngIf="loading" class="flex flex-col items-center justify-center p-12 space-y-6">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-[#70AEB9]/20 rounded-full animate-spin border-t-[#70AEB9]"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-3xl">🔥</span>
          </div>
        </div>
        <p class="text-gray-600 font-medium text-lg">Loading your streak...</p>
      </div>

      <div *ngIf="!loading && streakData" class="text-center space-y-8">
        <!-- Minimized Streak Display when user has a reward -->
        <ng-container *ngIf="showRewardMessage; else fullStreakDisplay">
          <div class="flex flex-col items-center justify-center my-8">
            <span class="text-6xl animate-pulse">🔥</span>
            <span class="text-5xl font-bold text-[#70AEB9] mt-3">{{ streakData.current_streak }}</span>
          </div>
        </ng-container>
        <!-- Full Streak Display -->
        <ng-template #fullStreakDisplay>
          <div class="relative inline-block">
            <div class="absolute inset-0 bg-[#70AEB9] rounded-full blur-2xl opacity-30 animate-pulse"></div>
            <div class="relative p-10 mx-auto my-6 transition-all duration-300 rounded-full bg-white shadow-2xl border-4 border-[#70AEB9]/10"
              [ngClass]="{
                'border-[#70AEB9]/20': streakColor === 'low',
                'border-[#70AEB9]/40': streakColor === 'medium',
                'border-[#70AEB9]/60': streakColor === 'high'
              }">
              <div class="text-8xl font-bold text-[#70AEB9]">
                {{ streakData.current_streak }}
              </div>
              <div class="text-xl font-medium text-gray-600 mt-3">
                Day{{ streakData.current_streak !== 1 ? 's' : '' }} Streak
              </div>
            </div>
          </div>
        </ng-template>

        <div class="p-8 rounded-3xl shadow-lg transition-all duration-300 bg-gradient-to-br from-[#70AEB9]/5 to-[#70AEB9]/10 border border-[#70AEB9]/20">
          <ng-container [ngSwitch]="streakColor">
            <p *ngSwitchCase="'low'" class="text-gray-700 text-xl font-medium">
              Keep going! You're building a great habit. 💪
            </p>
            <p *ngSwitchCase="'medium'" class="text-[#70AEB9] text-xl font-medium">
              Amazing! You're on fire! 🔥 You've earned a reward!
            </p>
            <p *ngSwitchCase="'high'" class="text-[#70AEB9] text-xl font-medium">
              Incredible! You're a streak master! 🏆 Claim your special reward!
            </p>
          </ng-container>
        </div>

        <div *ngIf="showRewardMessage" class="space-y-6 p-8 border-t border-[#70AEB9]/20">
          <div *ngIf="canClaim3Day" class="bg-gradient-to-br from-[#70AEB9]/10 to-[#70AEB9]/20 p-8 rounded-2xl shadow-lg border border-[#70AEB9]/30">
            <h3 class="text-2xl font-bold text-[#70AEB9]">3-Day Streak Reward! 🎁</h3>
            <p class="text-[#70AEB9] mt-3 text-lg">You've unlocked a special reward!</p>
            <button (click)="claim3dayStreakReward()"
              [disabled]="claiming"
              class="mt-6 inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-[#70AEB9] rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg">
              <svg *ngIf="claiming" class="w-6 h-6 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span class="text-lg">{{ claiming ? 'Claiming...' : 'Claim Reward' }}</span>
            </button>
          </div>

          <div *ngIf="canClaim7Day" class="bg-gradient-to-br from-[#70AEB9]/15 to-[#70AEB9]/25 p-8 rounded-2xl shadow-lg border border-[#70AEB9]/40">
            <h3 class="text-3xl font-bold text-[#70AEB9]">🎉 7-Day Streak Master! 🎉</h3>
            <p class="text-[#70AEB9] mt-3 text-lg">You've achieved the ultimate streak! Claim your premium reward!</p>
            <button (click)="claim7dayStreakReward()"
              [disabled]="claiming"
              class="mt-6 inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-[#70AEB9] rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg">
              <svg *ngIf="claiming" class="w-6 h-6 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span class="text-lg">{{ claiming ? 'Claiming...' : 'Claim Premium Reward' }}</span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="!loading && !streakData" class="flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div class="w-24 h-24 bg-[#70AEB9]/10 rounded-full flex items-center justify-center border-2 border-[#70AEB9]/20">
          <span class="text-5xl">🔥</span>
        </div>
        <h3 class="text-2xl font-semibold text-gray-700">Start Your Streak Journey</h3>
        <p class="text-gray-500 text-lg">Complete your first task to begin your streak!</p>
      </div>
    </div>

    <div class="bg-white p-6 rounded-b-lg border-t border-[#70AEB9]/20 flex justify-end sticky bottom-0 z-10">
      <button (click)="closeDialog()"
        class="px-8 py-3 font-semibold text-[#70AEB9] bg-[#70AEB9]/10 rounded-2xl hover:bg-[#70AEB9]/20 transition-colors duration-200 border border-[#70AEB9]/30">
        Close
      </button>
    </div>
  `,
  styles: [`
    /* Responsive design */
    @media (max-width: 280px) {
      :host {
        min-width: 320px;
        max-width: 90vw;
      }
    }
  `]
})
export class StreakDialogComponent implements OnInit, OnDestroy {
  private readonly _sb = new SubSink();

  streakData: StreakData | null = null;
  loading = true;
  claiming = false;

  constructor(
    private readonly _streakService: StreakService,
    public dialogRef: MatDialogRef<StreakDialogComponent>
  ) {}

  ngOnInit(): void {
    console.log('🏆 STREAK DIALOG: Component initialized');
    this.loadStreakData();
  }

  loadStreakData(): void {
    console.log('📊 STREAK DIALOG: Loading streak data...');
    console.log('🔐 STREAK DIALOG: Checking authentication status');
    this.loading = true;
    this._sb.sink = this._streakService.getStreak().subscribe({
      next: (streak) => {
        console.log('✅ STREAK DIALOG: Streak data loaded successfully:', streak);
        this.streakData = streak;
        this.loading = false;
        console.log('📈 STREAK DIALOG: Current streak:', this.streakData?.current_streak);
        console.log('🎯 STREAK DIALOG: Can claim 3-day reward:', this.canClaim3Day);
        console.log('🎯 STREAK DIALOG: Can claim 7-day reward:', this.canClaim7Day);
      },
      error: (error) => {
        console.error('❌ STREAK DIALOG: Error loading streak data:', error);
        this.loading = false;
      }
    });
  }

  get streakColor(): string {
    if (!this.streakData) return 'low';
    const streak = this.streakData.current_streak;
    if (streak <= 2) return 'low';
    if (streak >= 3 && streak <= 6) return 'medium';
    return 'high';
  }

  get showRewardMessage(): boolean {
    if (!this.streakData) return false;
    return this.streakData.current_streak >= 3;
  }

  get canClaim3Day(): boolean {
    if (!this.streakData) return false;
    return this.streakData.current_streak >= 3 && this.streakData.current_streak <= 6;
  }

  get canClaim7Day(): boolean {
    if (!this.streakData) return false;
    return this.streakData.current_streak >= 7;
  }

  claim3dayStreakReward(): void {
    if (this.claiming) return;

    this.claiming = true;
    this._sb.sink = this._streakService.claim3dayStreakReward().subscribe({
      next: (response) => {
        console.log('3-day reward claimed:', response);
        this.claiming = false;
        this.loadStreakData();
      },
      error: (error) => {
        console.error('Error claiming 3-day reward:', error);
        this.claiming = false;
      }
    });
  }

  claim7dayStreakReward(): void {
    if (this.claiming) return;

    this.claiming = true;
    this._sb.sink = this._streakService.claim7dayStreakReward().subscribe({
      next: (response) => {
        console.log('7-day reward claimed:', response);
        this.claiming = false;
        this.loadStreakData();
      },
      error: (error) => {
        console.error('Error claiming 7-day reward:', error);
        this.claiming = false;
      }
    });
  }

  closeDialog(): void {
    console.log('🎯 STREAK DIALOG: Close button clicked, closing dialog');
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this._sb.unsubscribe();
  }
}
