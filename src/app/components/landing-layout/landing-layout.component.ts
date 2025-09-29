import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Animated Background with Floating Elements -->
    <div class="min-h-screen bg-[#70aeb9] relative overflow-hidden">
      <!-- Floating Background Elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="floating-circle absolute w-64 h-64 bg-white/10 rounded-full blur-xl animate-float" 
             style="top: 10%; left: -5%; animation-delay: 0s;"></div>
        <div class="floating-circle absolute w-48 h-48 bg-white/5 rounded-full blur-xl animate-float" 
             style="top: 60%; right: -10%; animation-delay: 2s;"></div>
        <div class="floating-circle absolute w-32 h-32 bg-white/15 rounded-full blur-xl animate-float" 
             style="bottom: 20%; left: 20%; animation-delay: 4s;"></div>
        <div class="floating-circle absolute w-24 h-24 bg-white/8 rounded-full blur-xl animate-float" 
             style="top: 30%; right: 30%; animation-delay: 1s;"></div>
      </div>

      <!-- Gradient Overlay -->
      <div class="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-white/10"></div>

      <!-- Main Content -->
      <div class="relative grid grid-rows-[auto_max-content] min-h-screen py-8 px-4 sm:px-6">
        <!-- Header Section -->
        <section class="flex items-center justify-center flex-col gap-8 max-w-md mx-auto w-full">
          <!-- Logo and Brand -->
          <div class="flex flex-col items-center justify-center gap-4 animate-fade-in-down">
            <div class="relative">
              <!-- Logo Background with Glow -->
              <div class="absolute inset-0 bg-white/20 rounded-full blur-lg scale-110"></div>
              <div class="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-6 shadow-2xl">
                <img src="assets/logo.png" alt="Mbiu Logo" class="w-16 h-16 lg:w-20 lg:h-20 drop-shadow-lg"/>
              </div>
            </div>
            
            <!-- Brand Name with Gradient -->
            <div class="text-center">
              <h1 class="text-5xl lg:text-6xl font-extrabold tracking-wider mb-2">
                <span class="text-white drop-shadow-lg">M</span><span class="text-gradient">biu</span>
              </h1>
              <p class="text-white/80 text-lg font-medium tracking-wide animate-pulse-gentle">
                Connect • Play • Discover
              </p>
            </div>
          </div>

          <!-- Content Slot with Enhanced Container -->
          <div class="animate-fade-in-up w-full" style="animation-delay: 0.3s;">
            <ng-content></ng-content>
          </div>
        </section>

        <!-- Footer -->
        <footer class="animate-fade-in-up" style="animation-delay: 0.6s;">
          <div class="text-center py-6 max-w-md mx-auto">
            <!-- Social Proof -->
            <div class="mb-4">
              <div class="flex items-center justify-center gap-2 text-white/60 text-sm">
                <div class="flex -space-x-2">
                  <div class="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full border-2 border-white/20"></div>
                  <div class="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full border-2 border-white/20"></div>
                  <div class="w-6 h-6 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full border-2 border-white/20"></div>
                </div>
                <span>Join 10k+ users</span>
              </div>
            </div>

            <!-- Legal Links -->
            <div class="text-sm space-y-2">
              <p class="text-white/70">By using this app, you agree to Mbiu's</p>
              <div class="flex items-center justify-center gap-3 flex-wrap">
                <a href="#" class="text-white/90 hover:text-white underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all duration-300 font-medium">
                  Terms of use
                </a>
                <span class="text-white/50">•</span>
                <a href="#" class="text-white/90 hover:text-white underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all duration-300 font-medium">
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .floating-circle {
      animation-duration: 6s;
      animation-iteration-count: infinite;
      animation-timing-function: ease-in-out;
    }

    .text-gradient {
      background: linear-gradient(45deg, #FF6B9D, #4ECDC4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Enhanced glow effects */
    .relative .absolute {
      animation: glow 3s ease-in-out infinite alternate;
    }

    @keyframes glow {
      from {
        box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
      }
      to {
        box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .floating-circle {
        transform: scale(0.7);
      }
    }
  `]
})
export class LandingLayoutComponent implements OnInit {
  ngOnInit() {
    // Add any initialization logic here
  }
}
