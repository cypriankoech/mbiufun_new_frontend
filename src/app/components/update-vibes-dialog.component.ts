import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '@app/services/authentication.service';
import { environment } from '@environments/environment';
import { Game } from '@app/models/game';

@Component({
  selector: 'app-update-vibes-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="bg-white rounded px-2 pt-1 pb-2">
      <h2 class="text-2xl font-bold mb-4">Update Selected Vibes</h2>

      <div *ngIf="isLoading" class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#70aeb9] mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading vibes...</p>
      </div>

      <div *ngIf="!isLoading" class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">
          Select Your Vibes
        </label>
        <div class="max-h-60 overflow-y-auto border border-gray-300 rounded p-2 space-y-2">
          <label 
            *ngFor="let vibe of availableVibes" 
            class="flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              [value]="vibe.id"
              [checked]="isSelected(vibe.id)"
              (change)="toggleVibe(vibe.id)"
              class="w-4 h-4 text-[#70aeb9] bg-gray-100 border-gray-300 rounded focus:ring-[#70aeb9] focus:ring-2">
            <span class="ml-3 text-gray-800">{{ vibe.name }}</span>
          </label>
        </div>
        <div class="mt-2 text-sm text-gray-600">
          Selected: {{ selectedVibeIds.length }} vibes
        </div>
      </div>

      <div class="flex items-center justify-between">
        <button 
          type="button"
          (click)="onCancel()"
          class="bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-400 transition-colors">
          Cancel
        </button>
        <button 
          type="button"
          (click)="onUpdate()"
          [disabled]="isSaving"
          class="bg-[#70aeb9] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-[#5d96a1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <span *ngIf="!isSaving">Update Vibes</span>
          <span *ngIf="isSaving">Updating...</span>
        </button>
      </div>
    </form>
  `
})
export class UpdateVibesDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<UpdateVibesDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private http = inject(HttpClient);
  private authService = inject(AuthenticationService);

  availableVibes: Game[] = [];
  selectedVibeIds: number[] = [];
  isLoading = true;
  isSaving = false;

  ngOnInit(): void {
    // Initialize with current selections
    if (this.data?.selectedVibes) {
      this.selectedVibeIds = this.data.selectedVibes.map((v: any) => v.id);
    }

    // Load available vibes from backend
    this.loadVibes();
  }

  loadVibes(): void {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    this.http.get<any>(`${environment.apiUrl}api/v1/user/vibes/available/`, { headers })
      .subscribe({
        next: (response) => {
          // The backend returns available non-competitive games (vibes)
          this.availableVibes = response.data || response.results || response || [];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load vibes:', err);
          this.isLoading = false;
        }
      });
  }

  isSelected(vibeId: number): boolean {
    return this.selectedVibeIds.includes(vibeId);
  }

  toggleVibe(vibeId: number): void {
    // Ensure vibeId is a valid number
    const id = typeof vibeId === 'string' ? parseInt(vibeId, 10) : vibeId;
    
    if (!id || isNaN(id)) {
      console.error('Invalid vibe ID:', vibeId);
      return;
    }
    
    const index = this.selectedVibeIds.indexOf(id);
    if (index > -1) {
      this.selectedVibeIds.splice(index, 1);
    } else {
      this.selectedVibeIds.push(id);
    }
    
    console.log('Selected vibe IDs:', this.selectedVibeIds);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onUpdate(): void {
    // Validate max 5 vibes
    if (this.selectedVibeIds.length > 5) {
      alert('You can only select up to 5 vibes');
      return;
    }

    // Filter out any invalid IDs (null, undefined, NaN)
    const validVibeIds = this.selectedVibeIds.filter(id => id && !isNaN(id) && id > 0);
    
    console.log('Sending vibe IDs to backend:', validVibeIds);

    this.isSaving = true;
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token || '',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    const body = {
      vibe_ids: validVibeIds
    };

    console.log('Request body:', JSON.stringify(body));

    this.http.post(`${environment.apiUrl}api/v1/user/vibes/`, body, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Backend response:', response);
          
          // Get the full game objects for the selected vibes
          const updatedVibes = this.availableVibes.filter(v => validVibeIds.includes(v.id));
          
          console.log('Updated vibes to return:', updatedVibes);
          
          // Update the user's selected vibes
          const currentUser = this.authService.currentUserValue;
          if (currentUser) {
            currentUser.selected_vibes = updatedVibes;
            this.authService.setCurrentUser(currentUser);
          }
          
          // Return the full game objects, not just IDs
          this.dialogRef.close(updatedVibes);
        },
        error: (err) => {
          console.error('Failed to update vibes:', err);
          const errorMsg = err.error?.error || 'Failed to update vibes. Please try again.';
          alert(errorMsg);
          this.isSaving = false;
        }
      });
  }
}

