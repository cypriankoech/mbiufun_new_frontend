import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service';

@Component({
  selector: 'app-bottom-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="bg__primary py-3 px-4 rounded-xl grid grid-cols-4 gap-1 sm:gap-2">
      <ng-container *ngFor="let link of links">
        <!-- For button-type actions -->
        <button
          *ngIf="link.isbutton"
          (click)="onClick.emit({ label: link.label })"
          class="flex text-white flex-col items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-lg py-1"
          [attr.aria-label]="link.label"
        >
          <i class="text-base sm:text-sm" [class]="link.icon"></i>
          <span class="text-[10px] sm:text-xs">{{ link.label }}</span>
        </button>

        <!-- For navigation links -->
        <a
          *ngIf="!link.isbutton"
          [routerLink]="link.href"
          routerLinkActive="active"
          class="flex text-white flex-col items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 rounded-lg py-1"
          [attr.aria-label]="link.label"
        >
          <i class="text-base sm:text-sm" [class]="link.icon"></i>
          <span class="text-[10px] sm:text-xs">{{ link.label }}</span>
        </a>
      </ng-container>
    </div>
  `,
  styles: [`
    .active {
      opacity: 0.7;
    }
  `]
})
export class BottomMenuComponent {
  private readonly authService = inject(AuthenticationService);

  links: { href?: string, icon?: string, label: string, isbutton?: boolean }[] = [
    {
      href: '/app',
      icon: 'fa fa-home',
      label: 'Home'
    },
    {
      href: '/app/groups',
      icon: 'fa-solid fa-users',
      label: 'Bubble'
    },
    {
      href: '/app/daily-dare',
      icon: 'fa-solid fa-trophy',
      label: 'Kumbu'
    },
    {
      href: '/app/help',
      icon: 'fa fa-question-circle',
      label: 'Help'
    },
  ];

  constructor() {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      const kumbuIndex = this.links.findIndex(l => l.label === 'Kumbu');
      if (kumbuIndex !== -1) {
        this.links[kumbuIndex] = {
          ...this.links[kumbuIndex],
          href: `/app/profile/${userId}/history`
        };
      }
    }
  }

  @Output() onClick: EventEmitter<{ label: string }> = new EventEmitter<{ label: string }>();
}