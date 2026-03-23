import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LandingLayoutComponent } from '../landing-layout/landing-layout.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LandingLayoutComponent],
  template: `
    <app-landing-layout>
      <section class="w-full max-w-md mx-auto glass rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border border-white/20 animate-fade-in-up">
        <!-- Tab Navigation with Enhanced Design -->
        <div class="p-2">
          <div class="flex items-center bg-white/20 rounded-xl p-1 backdrop-blur-sm">
            <a routerLink="/register" routerLinkActive="active"
              class="auth-tab flex-1 py-3.5 px-4 text-center font-medium text-sm transition-all duration-300 rounded-lg text-gray-800 hover:text-gray-900 cursor-pointer">
              <span class="relative z-10">Sign up</span>
            </a>
            <a routerLink="/login" routerLinkActive="active"
              class="auth-tab flex-1 py-3.5 px-4 text-center font-medium text-sm transition-all duration-300 rounded-lg text-gray-800 hover:text-gray-900 cursor-pointer">
              <span class="relative z-10">Sign in</span>
            </a>
          </div>
        </div>

        <!-- Content Area -->
        <div class="px-1">
          <ng-content></ng-content>
        </div>

        <!-- Social Login Section -->
        <div class="px-6 pb-6">
          <!-- Divider with centered label -->
          <div class="my-6">
            <div class="flex items-center gap-3">
              <div class="flex-1 border-t border-white/20" aria-hidden="true"></div>
              <span class="px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-medium">
                or continue with
              </span>
              <div class="flex-1 border-t border-white/20" aria-hidden="true"></div>
            </div>
          </div>

          <!-- Social Buttons -->
          <div class="flex gap-3 justify-center items-center">
            <a href="https://accounts.google.com/o/oauth2/v2/auth?client_id=19501663658-kpgksm0lfu5h7qmej3fci7tlg2vejn0j.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/userinfo.profile%20https://www.googleapis.com/auth/userinfo.email&access_type=offline&redirect_uri=https://am.mbiufun.com/api/v1/user/oauth2redirect"
              class="social-btn flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <svg class="w-5 h-5 text-gray-700 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </a>

            <button (click)="featureNotAvailable()"
              class="social-btn flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <svg class="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>

            <button (click)="featureNotAvailable()"
              class="social-btn flex items-center justify-center w-12 h-12 bg-white/90 backdrop-blur-sm border border-white/50 rounded-xl shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 group">
              <svg class="w-5 h-5 text-black group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </button>
          </div>

          <!-- Trust Indicators -->
          <div class="mt-6 flex items-center justify-center space-x-4 text-white/60 text-xs">
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/>
              </svg>
              <span>Secure</span>
            </div>
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Verified</span>
            </div>
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              <span>Fast</span>
            </div>
          </div>
        </div>
      </section>
    </app-landing-layout>
  `,
  styles: [`
    .auth-tab.active {
      background: linear-gradient(135deg, rgba(112, 174, 185, 0.8), rgba(140, 199, 209, 0.8));
      color: white;
      box-shadow: 0 4px 15px rgba(112, 174, 185, 0.3);
      transform: translateY(-1px);
    }

    .auth-tab.active::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
      border-radius: inherit;
      pointer-events: none;
    }

    .auth-tab:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-0.5px);
    }

    .social-btn::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
      border-radius: inherit;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .social-btn:hover::before {
      opacity: 1;
    }

    .social-btn:active {
      transform: translateY(1px);
    }

    /* Enhanced glassmorphism effect */
    .glass {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    }

    /* Ensure auth tabs have proper cursor */
    .auth-tab {
      cursor: pointer !important;
    }

    /* Smooth transitions for all interactive elements */
    * {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
      .social-btn:hover {
        transform: none;
      }
    }
  `]
})
export class AuthLayoutComponent {
  featureNotAvailable() {
    // Enhanced notification instead of alert
    this.showNotification('This feature will be available soon! 🚀');
  }

  private showNotification(message: string) {
    // Create a toast notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-white/20 backdrop-blur-lg border border-white/30 rounded-xl px-6 py-3 text-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(full)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}
