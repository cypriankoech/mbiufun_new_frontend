import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '@app/services/authentication.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="mt-4 pb-24">
      <!-- Total Points Card -->
      <div class="mb-6 bg-gradient-to-r from-[#70aeb9] to-[#5d96a1] rounded-xl p-4 text-white shadow-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold">Total Points</h3>
              <p class="text-sm opacity-90">Your accumulated points</p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold">{{ user?.user_points || user?.scores || 0 }}</div>
            <div class="text-xs opacity-75">points</div>
          </div>
        </div>
      </div>

      <!-- Profile Details List -->
      <ul class="text-sm text-gray-600 space-y-4">
        <!-- Bio -->
        <li class="pt-3 relative z-30">
          <div class="flex items-center justify-between mb-2">
            <strong class="text-gray-800">Bio</strong>
            <button *ngIf="isOwnProfile" 
                    (click)="editBio()" 
                    class="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-[#70aeb9]">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
          <div class="text-gray-700">
            {{ user?.bio || 'No bio added yet' }}
          </div>
        </li>

        <!-- Hobbies -->
        <li *ngIf="user?.hobbies" class="pt-3">
          <div class="flex items-center justify-between mb-2">
            <strong class="text-gray-800">Hobbies</strong>
            <button *ngIf="isOwnProfile" 
                    (click)="editHobbies()" 
                    class="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-[#70aeb9]">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let hobby of getHobbiesArray()" 
                  class="px-3 py-1 bg-[#70aeb9]/10 text-[#70aeb9] rounded-full text-sm">
              {{ hobby }}
            </span>
          </div>
        </li>

        <!-- Referral Section -->
        <li *ngIf="isOwnProfile" class="pt-3">
          <div class="flex items-center justify-between mb-2">
            <strong class="text-gray-800">Referral</strong>
          </div>
          
          <!-- Referral Code -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
            <div class="flex items-center gap-2">
              <div class="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span class="font-mono text-sm text-gray-800">{{ user?.referral_code || 'N/A' }}</span>
              </div>
              <button (click)="copyReferralCode()" 
                      title="Copy referral code" 
                      class="p-2 text-[#70aeb9] hover:bg-[#70aeb9]/10 rounded-lg transition-colors">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Referral Link -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Referral Link</label>
            <div class="flex items-center gap-2">
              <div class="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span class="text-sm text-gray-800 break-all">{{ getReferralLink() }}</span>
              </div>
              <button (click)="copyReferralLink()" 
                      title="Copy referral URL" 
                      class="p-2 text-[#70aeb9] hover:bg-[#70aeb9]/10 rounded-lg transition-colors">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Social Share Buttons -->
          <div class="flex items-center justify-center gap-2 mt-4">
            <button (click)="shareOnWhatsApp()" 
                    title="Share on WhatsApp" 
                    class="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors border border-green-200">
              <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"></path>
              </svg>
            </button>
            <button (click)="shareOnTwitter()" 
                    title="Share on X (Twitter)" 
                    class="flex items-center justify-center w-10 h-10 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors border border-gray-200">
              <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </button>
          </div>
        </li>

        <!-- Selected Vibes -->
        <li class="pt-3">
          <div class="flex items-center justify-between mb-2">
            <strong class="text-gray-800">Selected Vibes</strong>
            <button *ngIf="isOwnProfile" 
                    (click)="editVibes()" 
                    title="Edit selected vibes" 
                    class="p-1 rounded-md hover:bg-gray-100 transition-colors">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="w-5 h-5 text-[#70aeb9]">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let vibe of user?.selected_vibes" 
                  class="px-3 py-1 bg-[#70aeb9]/10 text-[#70aeb9] rounded-full text-sm">
              {{ vibe.name }}
            </span>
            <span *ngIf="!user?.selected_vibes || user.selected_vibes.length === 0" 
                  class="text-gray-500">
              No vibes selected yet
            </span>
          </div>
        </li>
      </ul>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  @Input() user: any;
  @Input() isOwnProfile = false;

  private authService = inject(AuthenticationService);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    if (!this.user) {
      this.user = this.authService.currentUserValue;
    }
  }

  getHobbiesArray(): string[] {
    if (!this.user?.hobbies) return [];
    if (typeof this.user.hobbies === 'string') {
      return this.user.hobbies.split(',').map((h: string) => h.trim());
    }
    return this.user.hobbies;
  }

  getReferralLink(): string {
    const code = this.user?.referral_code;
    if (!code) return '';
    return `https://mbiufun.com/register?ref=${code}`;
  }

  copyReferralCode(): void {
    const code = this.user?.referral_code;
    if (code) {
      navigator.clipboard.writeText(code);
      this.showToast('Referral code copied!');
    }
  }

  copyReferralLink(): void {
    const link = this.getReferralLink();
    if (link) {
      navigator.clipboard.writeText(link);
      this.showToast('Referral link copied!');
    }
  }

  shareOnWhatsApp(): void {
    const link = this.getReferralLink();
    const text = `Join me on Mbiufun! ${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  shareOnTwitter(): void {
    const link = this.getReferralLink();
    const text = `Join me on Mbiufun!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`, '_blank');
  }

  editBio(): void {
    // TODO: Open bio edit dialog
    console.log('Edit bio');
  }

  editHobbies(): void {
    // TODO: Open hobbies edit dialog
    console.log('Edit hobbies');
  }

  editVibes(): void {
    // TODO: Open vibes selection dialog
    console.log('Edit vibes');
  }

  private showToast(message: string): void {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
}

