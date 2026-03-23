import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';

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
  private readonly http = inject(HttpClient);
  
  user: any = null;
  isLoading = true;
  isOwnProfile = false;

  async ngOnInit(): Promise<void> {
    const userId = this.route.snapshot.paramMap.get('user_id');
    const currentUser = this.authService.currentUserValue;
    
    this.isOwnProfile = userId === currentUser?.id?.toString();
    
    if (this.isOwnProfile) {
      // Fetch fresh user data from API instead of using cached data
      this.loadCurrentUserProfile();
    } else {
      // For other users, we'd need to implement user profile fetching by ID
      this.user = null;
      this.isLoading = false;
    }
  }

  private loadCurrentUserProfile(): void {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No auth token available');
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'mbiu-token': token
    });

    this.http.get(`${environment.apiUrl}api/v1/user/me/`, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('✅ Fresh user profile loaded:', response);
          this.user = response;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Failed to load user profile:', error);
          // Fallback to cached data if API fails
          this.user = this.authService.currentUserValue;
          this.isLoading = false;
        }
      });
  }

  parseHobbies(hobbies: string): string[] {
    if (!hobbies) return [];
    return hobbies.split(',').map(h => h.trim());
  }

  getReferralCode(): string {
    return this.user?.referral_code || (this.user?.id ? this.generateReferralCode(this.user.id) : 'N/A');
  }

  getReferralUrl(): string {
    // Use referral_code from fresh API data, fallback to generating from user ID
    const code = this.user?.referral_code || (this.user?.id ? this.generateReferralCode(this.user.id) : '');
    return `https://mbiufun.com/register?ref=${code}`;
  }

  private generateReferralCode(userId: number): string {
    // Client-side fallback to generate referral code from user ID
    const prefixedId = `mbiu_${userId}`;
    try {
      // Simple base64 encoding (without padding for consistency with backend)
      const encoded = btoa(prefixedId).replace(/=/g, '');
      return encoded;
    } catch (e) {
      console.error('Failed to generate referral code:', e);
      return '';
    }
  }

  copyReferralCode(): void {
    const code = this.getReferralCode();
    if (code && code !== 'N/A') {
      navigator.clipboard.writeText(code);
      alert('Referral code copied!');
    } else {
      alert('Referral code not available');
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































