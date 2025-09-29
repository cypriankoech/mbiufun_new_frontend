import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { AuthenticationService } from '@app/services/authentication.service';
import { BottomMenuComponent } from './bottom-menu/bottom-menu.component';

@Component({
  selector: 'template-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BottomMenuComponent],
  template: `
    <main class="w-full h-[100vh] relative">
      <!-- Global decorative background layers covering viewport for all app pages -->
      <div class="pointer-events-none fixed inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-to-b from-[#E6F3F5] via-white to-white"></div>
        <div class="absolute -top-24 -left-24 w-80 h-80 bg-[#70AEB9]/25 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -right-20 w-96 h-96 bg-[#0b4d57]/20 rounded-full blur-3xl"></div>
        <div class="absolute inset-0 opacity-50 bg-[radial-gradient(1000px_600px_at_10%_0%,rgba(112,174,185,0.12),transparent),radial-gradient(800px_500px_at_100%_80%,rgba(11,77,87,0.10),transparent)]"></div>
      </div>
      <!-- Header Section -->
      <section
        class="relative flex items-center justify-between z-50 fixed top-0 left-0 right-0
               bg-white border-b border-gray-200 shadow-md">
        <!-- Left side - Logo/Brand and Back Button -->
        <div class="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4">
          <!-- Back Button - Hidden on mobile home page, visible on other pages -->
          <button *ngIf="!isHomePage" (click)="navigateBack()"
            class="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl
                   bg-white/50 border border-white/60 hover:bg-white/70
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/40 transition-all duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Logo - Only visible on home page -->
          <img *ngIf="isHomePage" src="assets/icons/logo.png" alt="logo"
            class="w-10 h-10 sm:w-12 sm:h-12 block object-contain" />

          <!-- Brand Name -->
          <span
            class="font-semibold tracking-wide text-lg sm:text-xl lg:text-2xl text-[#0b4d57]
                   truncate max-w-[120px] sm:max-w-[200px] lg:max-w-none">
            Mbiufun
          </span>
        </div>

        <!-- Right side - Action Buttons -->
        <div class="flex items-center gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-4 py-3 sm:py-4">
          <!-- Search Button -->
          <div class="relative">
            <button (click)="openSearchCriteriaDialog()" type="button"
              class="relative flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl
                     bg-white/50 border border-white/60 text-gray-600 hover:text-[#0b4d57] hover:bg-white/70
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/40 transition-all duration-200">
              <span class="sr-only">Search</span>
              <i class="fa fa-search text-lg sm:text-xl"></i>
            </button>
          </div>

          <!-- Profile Menu -->
          <div class="relative">
            <button (click)="toggleProfileMenu()" type="button"
              class="relative flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-xl
                     bg-white/50 border border-white/60 text-gray-600 hover:text-[#0b4d57] hover:bg-white/70
                     transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/40">
              <svg *ngIf="!showProfileMenu" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>

              <svg *ngIf="showProfileMenu" class="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>

              <span *ngIf="unreadCount > 0"
                class="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full border-2 border-white shadow-sm">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <!-- Profile Dropdown Menu -->
            <div *ngIf="showProfileMenu"
              class="absolute right-0 mt-2 w-56 sm:w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-xl py-2 z-20 border border-white/60 ring-1 ring-black/5">
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">Profile Menu</p>
              </div>
              <button (click)="viewProfile()"
                class=" w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#E6F3F5] hover:text-[#0b4d57]
                        transition-colors duration-150 flex items-center gap-3 rounded-lg">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </button>
              <button (click)="viewNotifications()"
                class="relative w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#E6F3F5] hover:text-[#0b4d57]
                        transition-colors duration-150 flex items-center gap-3 rounded-lg">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M15 17h5l-5 5v-5zM4.19 4H19.8a2 2 0 012 2v10a2 2 0 01-2 2H4.19a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
                View Notifications
                <!-- Notification Badge on Menu Item -->
                <span *ngIf="unreadCount > 0"
                  class="ml-auto inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {{ unreadCount > 9 ? '9+' : unreadCount }}
                </span>
              </button>
              <div class="border-t border-gray-100 my-1"></div>
              <button (click)="logOut()"
                class=" w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center gap-3 rounded-lg">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log out
              </button>
            </div>
          </div>
        </div>

        <!-- Subtle gradient bottom line -->
        <div class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#70AEB9]/30 to-transparent"></div>
      </section>

      <!-- Main Content Area -->
      <div class="pt-14 sm:pt-16 pb-24 px-3 sm:px-4 w-full h-full overflow-y-auto relative z-10">
        <router-outlet></router-outlet>
      </div>

    </main>

    <!-- Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 px-3 py-2 bg-transparent border-0 shadow-none relative z-20" *ngIf="showBottomNav" role="navigation" aria-label="Bottom navigation" style="padding-bottom: env(safe-area-inset-bottom)">
      <app-bottom-menu></app-bottom-menu>
    </nav>
  `,
  styles: []
})
export class TemplateComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly location = inject(Location);
  private readonly dialog = inject(MatDialog);

  @Input() showBottomNav = true;
  
  currentUser: any;
  isHomePage = true;
  showProfileMenu = false;
  unreadCount = 0;
  
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    // Ensure bottom nav is shown on all /app routes consistently
    const initialUrl: string = (this.router as any).url || '/app';
    this.showBottomNav = initialUrl.startsWith('/app');

    // Subscribe to route changes
    const routeSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        const url: string = (event as any).urlAfterRedirects || (event as any).url;
        this.isHomePage = url === '/' || url === '/app' || url === '/app/';
        // Keep bottom nav visible across all app pages; hide on auth pages
        this.showBottomNav = url.startsWith('/app');
        // TODO: Implement notification count fetching
        this.unreadCount = 0;
      });
    
    this.subscriptions.push(routeSub);

    // TODO: Implement periodic notification checking
    // setInterval(() => {
    //   if (this.authService.isAuthenticated()) {
    //     this.fetchUnreadCount();
    //   }
    // }, 60000);
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  navigateBack(): void {
    this.location.back();
  }

  logOut(): void {
    const confirmLogout = confirm('Are you sure you want to log out?');
    if (confirmLogout) {
      this.authService.logout();
      this.showAlert('Logged out successfully.');
    }
  }

  get profilePic(): string {
    return this.authService.currentUserValue?.profile_image || '';
  }

  openSearchCriteriaDialog(): void {
    // TODO: Implement search dialog
    console.log('Search dialog not yet implemented');
  }

  viewProfile(): void {
    this.router.navigate(['/app/profile', this.authService.currentUserValue?.id]);
    this.showProfileMenu = false;
  }

  viewNotifications(): void {
    this.router.navigate(['/app/notifications']);
    this.showProfileMenu = false;
  }

  private showAlert(message: string): void {
    this.snackBar.open(message, "X", {
      horizontalPosition: "center",
      verticalPosition: "top",
      duration: 5000,
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}