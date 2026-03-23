import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (click)="navigate()"
      [ngClass]="{
        'cursor-pointer group': !disabled,
        'cursor-not-allowed': disabled
      }"
      class="bg-white border-2 border-gray-100 rounded-xl shadow-lg hover:shadow-xl overflow-hidden transform transition-all duration-300 animate-slide-up relative"
      [class.hover:-translate-y-1]="!disabled"
      [class.cursor-pointer]="!disabled"
      [class.cursor-not-allowed]="disabled"
      [class.opacity-60]="disabled"
      [style]="animationStyle"
    >
      <!-- Main Content Area -->
      <div class="p-8 flex flex-col items-center text-center transition-all duration-300">
        <!-- Icon with enhanced styling -->
        <div
          class="flex-shrink-0 mb-6 h-20 w-20 rounded-full flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10 border-2 border-[#70AEB9]/30"
          [ngClass]="{
            'hover:shadow-lg hover:scale-105 hover:border-[#70AEB9]': !disabled,
            'border-gray-300 bg-gray-100': disabled
          }"
        >
          <img [src]="iconUrl" [alt]="title" class="h-12 w-12 object-contain" [ngClass]="{'opacity-50': disabled}" />
        </div>

        <!-- Text Content -->
        <div class="w-full">
          <h2 class="text-lg font-bold text-gray-900 mb-3" [ngClass]="{'text-[#70AEB9]': !disabled, 'text-gray-400': disabled}">{{ title }}</h2>
          <p class="text-gray-600 text-sm leading-relaxed">{{ description }}</p>
        </div>

        <!-- Action indicator -->
        <div *ngIf="!disabled" class="mt-4 flex items-center gap-2 text-[#70AEB9] font-medium text-sm">
          <span>Get Started</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>

      <!-- "Coming Soon" Badge for disabled cards -->
      <div *ngIf="disabled" class="absolute top-4 right-4 bg-gray-500 text-white text-xs font-bold py-1 px-3 rounded-full">
        COMING SOON
      </div>
    </div>
  `,
  styles: []
})
export class FeatureCardComponent {
  private readonly router = inject(Router);

  @Input() title: string = '';
  @Input() description: string = '';
  @Input() iconUrl: string = '';
  @Input() routerLink: string | null = null;
  @Input() disabled: boolean = false;
  @Input() delay: number = 0;

  navigate(): void {
    if (!this.disabled && this.routerLink) {
      this.router.navigate([this.routerLink]);
    }
  }

  get animationStyle(): { [key: string]: string } {
    return { 'animation-delay': `${this.delay}ms` };
  }
}