import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '@app/services/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdateVibesDialogComponent } from '@app/components/update-vibes-dialog.component';
import { EditTextDialogComponent, EditTextDialogData } from '@app/components/edit-text-dialog.component';
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
  private readonly dialog = inject(MatDialog);
  private readonly http = inject(HttpClient);
  
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
    // Generate referral code if not present
    const code = this.user?.referral_code || this.user?.get_referral_code?.() || this.generateReferralCode();
    return `https://mbiufun.com/register?ref=${code}`;
  }

  generateReferralCode(): string {
    // Generate client-side referral code as fallback
    if (!this.user?.id) return '';
    const prefixedId = `mbiu_${this.user.id}`;
    return btoa(prefixedId).replace(/=/g, '');
  }

  copyReferralCode(): void {
    const code = this.user?.referral_code || this.generateReferralCode();
    if (code) {
      navigator.clipboard.writeText(code);
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
    const dialogRef = this.dialog.open(EditTextDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Username',
        label: 'Username',
        value: this.user?.username || '',
        placeholder: 'Enter your username',
        maxLength: 30
      } as EditTextDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined && result !== this.user?.username) {
        this.updateUsername(result);
      }
    });
  }

  editBio(): void {
    const dialogRef = this.dialog.open(EditTextDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Bio',
        label: 'Bio',
        value: this.user?.bio || '',
        placeholder: 'Tell others about yourself...',
        multiline: true,
        maxLength: 500
      } as EditTextDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        this.updateProfile({ bio: result });
      }
    });
  }

  editHobbies(): void {
    const currentHobbies = this.user?.hobbies || '';
    const dialogRef = this.dialog.open(EditTextDialogComponent, {
      width: '500px',
      data: {
        title: 'Edit Hobbies',
        label: 'Hobbies (comma-separated)',
        value: currentHobbies,
        placeholder: 'e.g., hiking, reading, cooking',
        multiline: true,
        maxLength: 200
      } as EditTextDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        // Split CSV and send as array
        const hobbiesArray = result.split(',').map((h: string) => h.trim()).filter((h: string) => h);
        this.updateProfileWithFormData({ hobbies: hobbiesArray });
      }
    });
  }

  updateUsername(newUsername: string): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    const body = { username: newUsername };

    this.http.post(`${environment.apiUrl}api/v1/user/update-username/`, body, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Username updated successfully!');
          if (this.user) {
            this.user.username = newUsername;
          }
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            currentUser.username = newUsername;
            this.authService.setCurrentUser(currentUser);
          }
        },
        error: (err) => {
          console.error('Failed to update username:', err);
          const errorMsg = err.error?.error || err.error?.message || 'Failed to update username. Please try again.';
          alert(errorMsg);
        }
      });
  }

  updateProfile(data: any): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    this.http.post(`${environment.apiUrl}api/v1/user/profile/`, data, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Profile updated successfully!');
          // Update local user object
          if (this.user) {
            Object.assign(this.user, data);
          }
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            Object.assign(currentUser, data);
            this.authService.setCurrentUser(currentUser);
          }
        },
        error: (err) => {
          console.error('Failed to update profile:', err);
          const errorMsg = err.error?.error || err.error?.message || 'Failed to update profile. Please try again.';
          alert(errorMsg);
        }
      });
  }

  updateProfileWithFormData(data: any): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
      // Don't set Content-Type for FormData, browser will set it with boundary
    });

    const formData = new FormData();
    
    // Handle arrays (like hobbies)
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach((item: any) => {
          formData.append(key, item);
        });
      } else {
        formData.append(key, data[key]);
      }
    }

    this.http.post(`${environment.apiUrl}api/v1/user/profile/`, formData, { headers })
      .subscribe({
        next: (response: any) => {
          alert('Profile updated successfully!');
          // Update local user object
          if (this.user) {
            // For hobbies, convert array back to CSV string for display
            if (data.hobbies && Array.isArray(data.hobbies)) {
              this.user.hobbies = data.hobbies.join(', ');
            } else {
              Object.assign(this.user, data);
            }
          }
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            if (data.hobbies && Array.isArray(data.hobbies)) {
              currentUser.hobbies = data.hobbies.join(', ');
            } else {
              Object.assign(currentUser, data);
            }
            this.authService.setCurrentUser(currentUser);
          }
        },
        error: (err) => {
          console.error('Failed to update profile:', err);
          const errorMsg = err.error?.error || err.error?.message || 'Failed to update profile. Please try again.';
          alert(errorMsg);
        }
      });
  }

  editVibes(): void {
    const dialogRef = this.dialog.open(UpdateVibesDialogComponent, {
      width: '95vw',
      maxWidth: '95vw',
      data: {
        selectedVibes: this.user?.selected_vibes || []
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        // Reload user data to get updated vibes
        const currentUser = this.authService.currentUserValue;
        if (currentUser) {
          this.user = { ...this.user, ...currentUser };
        }
      }
    });
  }
}
