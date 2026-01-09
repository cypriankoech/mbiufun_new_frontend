import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '@app/services/authentication.service';
import { FeedService, UnifiedFeedResponse } from '@app/services/feed.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  template: `
    <div class="landing-page relative overflow-hidden min-h-screen">
      <!-- Animated Background -->
      <div class="pointer-events-none fixed inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-br from-[#E6F3F5] via-white to-[#F0F9FA]"></div>
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-[#70AEB9]/20 rounded-full blur-3xl animate-float"></div>
        <div class="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#4ECDC4]/15 rounded-full blur-3xl animate-float-delayed"></div>
        <div class="absolute top-1/3 left-1/4 w-72 h-72 bg-[#0b4d57]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div class="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_120%,rgba(112,174,185,0.15),transparent),radial-gradient(circle_at_80%_20%,rgba(78,205,196,0.12),transparent)]"></div>
      </div>

      <!-- Main Content -->
      <div class="relative z-10 min-h-screen flex flex-col">
        <div class="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div class="max-w-7xl mx-auto w-full">
            <!-- Welcome Header -->
            <div class="text-center mb-12 sm:mb-16 animate-fade-in-up">
              <div class="mb-6 sm:mb-8 flex justify-center">
                <div class="relative">
                  <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300 hover:rotate-3 cursor-pointer">
                    <svg class="w-12 h-12 sm:w-14 sm:h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="absolute inset-0 rounded-3xl bg-[#70AEB9]/30 animate-ping-slow"></div>
                </div>
              </div>

              <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6">
                <span class="bg-clip-text text-transparent bg-gradient-to-r from-[#0b4d57] via-[#70AEB9] to-[#4ECDC4] animate-gradient">
                  Welcome to Mbiufun!
                </span>
              </h1>

              <p class="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
                Connect with your community, challenge yourself daily, and discover activities you love
              </p>

              <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8" *ngIf="!hasSelectedVibes">
                <button
                  (click)="openUpdateVibesDialog()"
                  class="group relative px-8 py-4 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden"
                >
                  <span class="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
                  <svg class="w-6 h-6 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span class="relative z-10">Select Your Vibes</span>
                </button>
              </div>

              <div *ngIf="hasSelectedVibes" class="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium animate-bounce-once">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span>Vibes selected! You're all set 🎉</span>
              </div>
            </div>

            <!-- Feature Cards Grid -->
            <div class="flex justify-center max-w-5xl mx-auto mb-16">
              <div 
                class="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-white/60 overflow-hidden"
                [routerLink]="'/app/daily-dare'"
                style="display: none;"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative z-10">
                  <div class="mb-6 flex justify-center sm:justify-start">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>

                  <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#70AEB9] transition-colors duration-300">
                    Daily Dare
                  </h3>
                  <p class="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
                    Take on surprise quiz challenges every day and compete with friends
                  </p>

                  <div class="flex items-center text-[#70AEB9] font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                    <span>Start Challenge</span>
                    <svg class="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-[#70AEB9]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              </div>

              <div 
                class="group relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer border border-white/60 overflow-hidden w-full max-w-md"
                [routerLink]="'/app/activities'"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-[#4ECDC4]/10 to-[#70AEB9]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div class="relative z-10">
                  <div class="mb-6 flex justify-center sm:justify-start">
                    <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#4ECDC4] to-[#44A08D] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>

                  <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#4ECDC4] transition-colors duration-300">
                    Vibes & Activities
                  </h3>
                  <p class="text-gray-600 text-base sm:text-lg leading-relaxed mb-4">
                    Discover exciting activities, connect with friends, and share your adventures
                  </p>

                  <div class="flex items-center text-[#4ECDC4] font-semibold group-hover:gap-3 gap-2 transition-all duration-300">
                    <span>Explore Now</span>
                    <svg class="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>

                <div class="absolute -bottom-4 -right-4 w-24 h-24 bg-[#4ECDC4]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="relative z-10 py-8 px-4">
          <div class="max-w-7xl mx-auto text-center">
            <p class="text-gray-600 text-sm">© 2025 Mbiufun. Built with ❤️ for connecting communities.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
    @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
    @keyframes pulse-slow { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.8; } }
    @keyframes gradient { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes ping-slow { 75%, 100% { transform: scale(1.5); opacity: 0; } }
    @keyframes bounce-once { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
    .animate-float { animation: float 20s ease-in-out infinite; }
    .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
    .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
    .animate-gradient { background-size: 200%; animation: gradient 3s ease infinite; }
    .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
    .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
    .animate-bounce-once { animation: bounce-once 1s ease-in-out; }
  `]
})
export class LandingComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthenticationService);
  private readonly dialog = inject(MatDialog);
  private readonly feedService = inject(FeedService);
  private readonly snackBar = inject(MatSnackBar);
  private subscriptions: Subscription[] = [];
  hasSelectedVibes = true;
  loading = false;
  feed: any[] = [];
  feedLoaded = false;

  ngOnInit(): void {
    this.checkUserVibes();
  }

  checkUserVibes(): void {
    const sub = this.authService.getUserVibes().subscribe({
      next: (res) => {
        const selectedVibes = res?.data ?? [];
        this.hasSelectedVibes = selectedVibes.length > 0;
        if (selectedVibes.length === 0) {
          this.showVibesWarning();
        }
      },
      error: () => { this.hasSelectedVibes = false; }
    });
    this.subscriptions.push(sub);
  }

  showVibesWarning(): void {
    this.snackBar.open('👋 Select your vibes to personalize your experience!', 'Select Vibes', {
      duration: 7000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    }).onAction().subscribe(() => {
      this.openUpdateVibesDialog();
    });
  }

  openUpdateVibesDialog(): void {
    this.snackBar.open('🎨 Vibes selection coming soon!', 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
