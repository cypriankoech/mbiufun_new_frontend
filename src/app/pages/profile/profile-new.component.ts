import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-new.component.html'
})
export class ProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthenticationService);
  
  user: any = null;
  isLoading = true;
  isOwnProfile = false;

  async ngOnInit(): Promise<void> {
    const userId = this.route.snapshot.paramMap.get('user_id');
    const currentUser = this.authService.currentUserValue;
    
    this.isOwnProfile = userId === currentUser?.id?.toString();
    
    setTimeout(() => {
      this.user = this.isOwnProfile ? currentUser : null;
      this.isLoading = false;
    }, 500);
  }

  parseHobbies(hobbies: string): string[] {
    if (!hobbies) return [];
    return hobbies.split(',').map(h => h.trim());
  }

  getReferralUrl(): string {
    return `https://mbiufun.com/register?ref=${this.user?.referral_code || ''}`;
  }

  copyReferralCode(): void {
    if (this.user?.referral_code) {
      navigator.clipboard.writeText(this.user.referral_code);
      alert('Referral code copied!');
    }
  }

  copyReferralUrl(): void {
    navigator.clipboard.writeText(this.getReferralUrl());
    alert('Referral link copied!');
  }

  shareWhatsApp(): void {
    const text = encodeURIComponent(`Join me on Mbiufun! Use my referral link: ${this.getReferralUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  shareTwitter(): void {
    const text = encodeURIComponent(`Join me on Mbiufun!`);
    const url = encodeURIComponent(this.getReferralUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }

  editUsername(): void {
    // TODO: Implement username edit
    console.log('Edit username');
  }

  editBio(): void {
    // TODO: Implement bio edit
    console.log('Edit bio');
  }

  editHobbies(): void {
    // TODO: Implement hobbies edit
    console.log('Edit hobbies');
  }

  editVibes(): void {
    // TODO: Open vibes selection dialog
    console.log('Edit vibes');
  }
}





















