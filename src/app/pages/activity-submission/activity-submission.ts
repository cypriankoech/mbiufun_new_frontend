import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpParams } from '@angular/common/http';
import { GamesService } from '@app/services/games.service';
import { Game } from '@app/models/game';
import { BottomMenuComponent } from '@app/templates/main/bottom-menu/bottom-menu.component';
import { environment } from '@environments/environment';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

interface UploadedPhoto {
  id: string;
  file: File;
  preview: string;
  caption: string;
}

interface Participant {
  id: number;
  username: string;
}

interface UserSearchResult {
  id: number;
  first_name: string;
  last_name: string;
  mbiu_username: string;
  profile_image?: string;
}

@Component({
  selector: 'app-activity-submission',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BottomMenuComponent],
  templateUrl: './activity-submission.html',
  styleUrl: './activity-submission.scss'
})
export class ActivitySubmissionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gamesService = inject(GamesService);
  private snackBar = inject(MatSnackBar);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);

  currentActivity: Game | null = null;
  loading = true;

  // Participants section
  participants: Participant[] = [];
  participantSearchForm: FormGroup;
  searchResults: UserSearchResult[] = [];
  showSearchResults = false;
  isSearching = false;
  isParticipantsExpanded = false;
  maxParticipants = 10;

  // Photos section
  uploadedPhotos: UploadedPhoto[] = [];
  maxPhotos = 3;
  selectedFile: File | null = null;

  // Caption
  activityCaption = '';

  // Location
  activityLocation = '';

  constructor() {
    this.participantSearchForm = this.fb.group({
      searchQuery: ['']
    });

    // Setup debounced search
    this.participantSearchForm.get('searchQuery')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          this.searchResults = [];
          this.showSearchResults = false;
          this.isSearching = false;
          return of([]);
        }
        this.isSearching = true;
        return this.searchUsers(query.trim());
      })
    ).subscribe({
      next: (results: UserSearchResult[]) => {
        this.searchResults = results;
        this.showSearchResults = results.length > 0;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
        this.searchResults = [];
        this.showSearchResults = false;
      }
    });
  }

  ngOnInit(): void {
    this.loadActivity();
  }

  private loadActivity(): void {
    const activityId = this.route.snapshot.params['activityId'];
    console.log('Activity ID from route:', activityId, typeof activityId);

    if (!activityId) {
      console.error('No activity ID provided');
      this.loading = false;
      return;
    }

    // Convert to number if it's a string
    const numericActivityId = Number(activityId);
    console.log('Converted activity ID:', numericActivityId);

    // Check if activity data was stored in sessionStorage
    const storedActivity = sessionStorage.getItem('selectedActivity');
    console.log('Stored activity from sessionStorage:', storedActivity);

    if (storedActivity) {
      try {
        const activityFromStorage = JSON.parse(storedActivity) as Game;
        console.log('Parsed activity from sessionStorage:', activityFromStorage);

        if (activityFromStorage && activityFromStorage.id === numericActivityId) {
          console.log('Activity loaded from sessionStorage:', activityFromStorage);
          this.currentActivity = activityFromStorage;
          this.loading = false;
          // Clean up sessionStorage
          sessionStorage.removeItem('selectedActivity');
          return;
        }
      } catch (error) {
        console.error('Error parsing stored activity:', error);
        sessionStorage.removeItem('selectedActivity');
      }
    }

    // Fallback to API call if no stored data
    this.gamesService.getGameById(numericActivityId).subscribe({
      next: (activity) => {
        console.log('Activity loaded successfully:', activity);
        this.currentActivity = activity;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading activity:', error);
        console.error('Full error object:', error);

        // For now, create a mock activity if the API fails
        console.log('Using mock activity data for development');
        this.currentActivity = {
          id: numericActivityId,
          name: 'Local Hiking Trail', // Default activity name
          points: 18,
          img_url: this.getTempIcon(),
          game_mode: 'non_competitive'
        };
        this.loading = false;

        this.snackBar.open('Activity loaded (using demo data)', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/activities']);
  }

  // Participants functionality
  toggleParticipants(): void {
    this.isParticipantsExpanded = !this.isParticipantsExpanded;
    if (!this.isParticipantsExpanded) {
      this.participantSearchForm.patchValue({ searchQuery: '' });
      this.searchResults = [];
      this.showSearchResults = false;
    }
  }

  private searchUsers(query: string) {
    const headers = this.getHeaders();
    const params = new HttpParams()
      .set('s', query)
      .set('users', '1')
      .set('per_page', '10');

    return this.http.get<{ users: UserSearchResult[] }>(
      `${environment.apiUrl.replace(/\/$/, '')}/api/v1/search`,
      { headers, params }
    ).pipe(
      switchMap(response => of(response.users || []))
    );
  }

  selectUserFromSearch(user: UserSearchResult): void {
    if (this.participants.length >= this.maxParticipants) {
      this.snackBar.open(`Maximum ${this.maxParticipants} participants allowed`, 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Check if user is already a participant
    if (this.participants.find(p => p.id === user.id)) {
      this.snackBar.open('This user is already a participant', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Add the user to participants
    this.participants.push({
      id: user.id,
      username: user.mbiu_username
    });

    // Reset search
    this.participantSearchForm.patchValue({ searchQuery: '' });
    this.searchResults = [];
    this.showSearchResults = false;
  }

  removeParticipant(participant: Participant): void {
    this.participants = this.participants.filter(p => p.id !== participant.id);
  }

  // Photo functionality
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (this.uploadedPhotos.length >= this.maxPhotos) {
      this.snackBar.open(`Maximum ${this.maxPhotos} photos allowed`, 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      this.snackBar.open('Please select an image file', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      this.snackBar.open('File size must be less than 5MB', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      const photo: UploadedPhoto = {
        id: Date.now().toString(),
        file: file,
        preview: preview,
        caption: ''
      };
      this.uploadedPhotos.push(photo);
    };
    reader.readAsDataURL(file);
  }

  removePhoto(photo: UploadedPhoto): void {
    this.uploadedPhotos = this.uploadedPhotos.filter(p => p.id !== photo.id);
  }

  viewPhoto(photo: UploadedPhoto): void {
    // TODO: Implement full-size photo viewer
    console.log('View photo:', photo);
  }

  // Form submission
  submitActivity(): void {
    if (this.uploadedPhotos.length === 0) {
      this.snackBar.open('Please upload at least one verification photo', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    // TODO: Implement actual submission to backend
    console.log('Submitting activity:', {
      activity: this.currentActivity,
      participants: this.participants,
      photos: this.uploadedPhotos,
      caption: this.activityCaption,
      location: this.activityLocation
    });

    // Prepare shared content data
    const sharedContent = {
      activity: this.currentActivity,
      matchId: Math.floor(Math.random() * 9000) + 1000, // Mock match ID
      imageUrl: this.uploadedPhotos[0]?.preview || '', // Use first uploaded photo
      participants: this.participants.map(p => p.username),
      caption: this.activityCaption,
      location: this.activityLocation
    };

    // Store shared content for the share screen
    sessionStorage.setItem('sharedContent', JSON.stringify(sharedContent));

    // Navigate to share content screen
    this.router.navigate(['/app/share-content']);
  }

  cancelSubmission(): void {
    this.router.navigate(['/app/activities']);
  }

  private getHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('dev_am_token');
    return {
      'mbiu-token': token || '',
      'Content-Type': 'application/json'
    };
  }

  getTempIcon(): string {
    const iconsList = Array.from({ length: 20 }, (_, i) => `${i + 1}.svg`);
    const i = Math.floor(Math.random() * iconsList.length);
    return `assets/games/${iconsList[i]}`;
  }
}
