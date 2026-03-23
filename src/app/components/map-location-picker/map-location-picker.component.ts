import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import { debounceTime, Subject, switchMap, of } from 'rxjs';

interface LocationResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  google_place_id: string;
}

@Component({
  selector: 'app-map-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="h-screen w-screen flex flex-col bg-white overflow-hidden">
      <!-- Header -->
      <div class="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">📍 Choose Location</h2>
          <button
            (click)="close()"
            class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchInput()"
            placeholder="Search for a place..."
            class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70AEB9] focus:border-transparent"
          />
        </div>

        <!-- Search Results Dropdown -->
        <div *ngIf="searchResults.length > 0" class="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <button
            *ngFor="let result of searchResults"
            (click)="selectSearchResult(result)"
            class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
          >
            <svg class="w-5 h-5 text-[#70AEB9] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ result.name }}</p>
              <p class="text-sm text-gray-500 truncate">{{ result.address }}</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Map Container -->
      <div class="flex-1 relative bg-gray-100 overflow-hidden">
        <div #mapContainer style="width: 100%; height: 100%;"></div>
        
        <!-- Loading State -->
        <div *ngIf="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div class="text-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AEB9] mx-auto mb-4"></div>
            <p class="text-gray-600">Loading map...</p>
          </div>
        </div>

        <!-- Selected Location Info -->
        <div *ngIf="selectedLocation" class="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200 z-10">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-[#70AEB9] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-900">{{ selectedLocation.name }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ selectedLocation.address }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 sm:p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
        <button
          (click)="close()"
          class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          (click)="confirm()"
          [disabled]="!selectedLocation"
          class="flex-1 px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Confirm Location
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class MapLocationPickerComponent implements OnInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private readonly http = inject(HttpClient);
  private readonly dialogRef = inject(MatDialogRef<MapLocationPickerComponent>);
  
  searchQuery = '';
  searchResults: LocationResult[] = [];
  selectedLocation: LocationResult | null = null;
  loading = true;

  private map: any;
  private marker: any;
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.setupSearch();
    this.loadGoogleMaps();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          return of([]);
        }
        return this.searchLocations(query.trim());
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
      },
      error: (error) => {
        console.error('Location search error:', error);
        this.searchResults = [];
      }
    });
  }

  private searchLocations(query: string) {
    const token = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')!).token?.access : '';
    const headers = new HttpHeaders({
      'mbiu-token': token || '',
      'Authorization': `Bearer ${token}`
    });
    const params = new HttpParams().set('q', query);

    return this.http.get<{ data: LocationResult[] }>(
      `${environment.apiUrl}v1/games/location/search/`,
      { headers, params }
    ).pipe(
      switchMap(response => of(response.data || []))
    );
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  selectSearchResult(result: LocationResult): void {
    this.selectedLocation = result;
    this.searchResults = [];
    this.searchQuery = result.name;
    
    // Center map on selected location
    if (this.map) {
      const position = { lat: result.latitude, lng: result.longitude };
      this.map.setCenter(position);
      this.map.setZoom(15);
      this.updateMarker(position);
    }
  }

  private loadGoogleMaps(): void {
    // Check if Google Maps is already loaded
    if ((window as any).google && (window as any).google.maps) {
      this.initMap();
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyDHOLlO8S5MhLlJLk23yCR0b6o0iLwgGZ0&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => this.initMap();
    script.onerror = () => {
      this.loading = false;
      console.error('Failed to load Google Maps');
    };
    document.head.appendChild(script);
  }

  private initMap(): void {
    setTimeout(() => {
      const defaultPosition = { lat: -1.2921, lng: 36.8219 }; // Nairobi, Kenya
      
      this.map = new (window as any).google.maps.Map(this.mapContainer.nativeElement, {
        center: defaultPosition,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Add click listener to map
      this.map.addListener('click', (event: any) => {
        const position = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        this.updateMarker(position);
        this.reverseGeocode(position);
      });

      this.loading = false;
    }, 100);
  }

  private updateMarker(position: { lat: number; lng: number }): void {
    if (this.marker) {
      this.marker.setMap(null);
    }

    this.marker = new (window as any).google.maps.Marker({
      position: position,
      map: this.map,
      animation: (window as any).google.maps.Animation.DROP,
    });
  }

  private reverseGeocode(position: { lat: number; lng: number }): void {
    const geocoder = new (window as any).google.maps.Geocoder();
    
    geocoder.geocode({ location: position }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const place = results[0];
        this.selectedLocation = {
          name: place.formatted_address.split(',')[0],
          address: place.formatted_address,
          latitude: position.lat,
          longitude: position.lng,
          google_place_id: place.place_id
        };
      }
    });
  }

  confirm(): void {
    if (this.selectedLocation) {
      this.dialogRef.close(this.selectedLocation);
    }
  }

  close(): void {
    this.dialogRef.close(null);
  }
}

