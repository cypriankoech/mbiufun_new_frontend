import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpParams } from '@angular/common/http';
import { debounceTime, Subject, switchMap, of } from 'rxjs';
import * as L from 'leaflet';

interface LocationResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  google_place_id: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  address?: { road?: string };
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
        <div *ngIf="selectedLocation" class="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200" style="z-index: 1000;">
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
  styles: [`
    :host ::ng-deep .leaflet-container {
      font-family: inherit;
    }
  `]
})
export class MapLocationPickerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  private readonly http = inject(HttpClient);
  private readonly dialogRef = inject(MatDialogRef<MapLocationPickerComponent>);
  private readonly ngZone = inject(NgZone);

  searchQuery = '';
  searchResults: LocationResult[] = [];
  selectedLocation: LocationResult | null = null;
  loading = true;

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private searchSubject = new Subject<string>();

  private readonly markerIcon = L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="30" height="45">
      <path d="M12 0C5.383 0 0 5.383 0 12c0 8.489 10.664 22.13 11.128 22.697L12 36l.872-1.303C13.336 34.13 24 20.489 24 12 24 5.383 18.617 0 12 0z" fill="#70AEB9"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [30, 45],
    iconAnchor: [15, 45],
    popupAnchor: [0, -45],
  });

  ngOnInit(): void {
    this.setupSearch();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.searchSubject.complete();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap(query => {
        if (!query || query.trim().length < 2) return of([]);
        return this.searchLocations(query.trim());
      })
    ).subscribe({
      next: (results) => { this.searchResults = results; },
      error: () => { this.searchResults = []; }
    });
  }

  private searchLocations(query: string) {
    const params = new HttpParams()
      .set('q', query)
      .set('format', 'json')
      .set('limit', '6')
      .set('addressdetails', '1');
    return this.http.get<NominatimResult[]>(
      'https://nominatim.openstreetmap.org/search',
      { params }
    ).pipe(
      switchMap(results => of(results.map(r => ({
        name: r.name || r.display_name.split(',')[0],
        address: r.display_name,
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        google_place_id: String(r.place_id),
      }))))
    );
  }

  onSearchInput(): void {
    this.searchSubject.next(this.searchQuery);
  }

  selectSearchResult(result: LocationResult): void {
    this.selectedLocation = result;
    this.searchResults = [];
    this.searchQuery = result.name;
    if (this.map) {
      const latLng = L.latLng(result.latitude, result.longitude);
      this.map.setView(latLng, 15);
      this.placeMarker(latLng);
    }
  }

  private initMap(): void {
    const defaultLatLng = L.latLng(-1.2921, 36.8219); // Nairobi, Kenya

    this.map = L.map(this.mapContainer.nativeElement, {
      center: defaultLatLng,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.ngZone.run(() => {
        this.placeMarker(e.latlng);
        this.reverseGeocode(e.latlng);
      });
    });

    this.loading = false;
  }

  private placeMarker(latlng: L.LatLng): void {
    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else {
      this.marker = L.marker(latlng, { icon: this.markerIcon }).addTo(this.map!);
    }
  }

  private reverseGeocode(latlng: L.LatLng): void {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`;
    this.http.get<NominatimResult>(url).subscribe({
      next: (result) => {
        if (result?.display_name) {
          this.selectedLocation = {
            name: result.name || result.address?.road || result.display_name.split(',')[0],
            address: result.display_name,
            latitude: latlng.lat,
            longitude: latlng.lng,
            google_place_id: String(result.place_id ?? ''),
          };
        }
      },
      error: () => {
        this.selectedLocation = {
          name: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`,
          address: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`,
          latitude: latlng.lat,
          longitude: latlng.lng,
          google_place_id: '',
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
