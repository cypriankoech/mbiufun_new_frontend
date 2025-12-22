import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '@environments/environment';
import { debounceTime, distinctUntilChanged, switchMap, of, Subject } from 'rxjs';
import { CreateVisibilityGroupDialogComponent } from '../create-visibility-group-dialog/create-visibility-group-dialog.component';

interface Bubble {
  id: string;
  name: string;
  img_url?: string;
  memberCount?: number;
}

interface Individual {
  id: number;
  first_name: string;
  last_name: string;
  mbiu_username: string;
  profile_image?: string;
}

interface VisibilityGroup {
  id: number;
  name: string;
  member_count: number;
  members: Array<{
    member_type: 'user' | 'bubble';
    user?: number;
    bubble_id?: number;
    user_details?: Individual;
  }>;
}

interface VisibilitySelection {
  is_public: boolean;
  bubbles: string[];
  individuals: number[];
  groups: number[];
}

@Component({
  selector: 'app-visibility-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="h-screen w-screen flex flex-col bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <!-- Header -->
      <div class="p-5 sm:p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-br from-[#70AEB9] via-[#5fb3be] to-[#4ECDC4] shadow-lg">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-xl sm:text-2xl font-bold text-white tracking-tight">Who can see this?</h2>
              <p class="text-white/80 text-sm mt-0.5 font-medium">Choose your audience</p>
            </div>
          </div>
          <button
            (click)="close()"
            class="p-2.5 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Close"
          >
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Recipient Count Banner -->
      <div class="px-5 py-4 bg-gradient-to-r from-[#70AEB9]/5 to-[#4ECDC4]/5 border-b border-[#70AEB9]/10 flex-shrink-0 backdrop-blur-sm">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <div class="p-2 rounded-lg bg-white shadow-sm">
              <svg class="w-5 h-5 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <span class="text-sm text-gray-600 font-medium block mb-0.5">Audience</span>
              <span class="font-bold text-gray-900 text-base block truncate">
                {{ isPublic ? '🌍 Everyone' : '👥 ' + recipientCount + ' ' + (recipientCount === 1 ? 'person' : 'people') }}
              </span>
            </div>
          </div>
          <button
            (click)="resetToDefault()"
            class="text-sm px-4 py-2 rounded-lg bg-white hover:bg-gray-50 text-[#70AEB9] font-semibold transition-all duration-200 shadow-sm hover:shadow flex items-center gap-2 whitespace-nowrap"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <!-- Section 1: Bubbles (Default Layer) -->
        <div class="p-5 sm:p-6 border-b border-gray-100">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10">
                <svg class="w-5 h-5 text-[#70AEB9]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">Bubbles</h3>
                <p class="text-xs text-gray-600 mt-0.5">Your social contexts</p>
              </div>
            </div>
            <button
              (click)="toggleAllBubbles()"
              class="text-sm px-4 py-2 rounded-lg border-2 border-[#70AEB9] text-[#70AEB9] hover:bg-[#70AEB9] hover:text-white transition-all duration-200 font-semibold hover:shadow-md"
            >
              {{ areAllBubblesSelected() ? 'Clear' : 'Select All' }}
            </button>
          </div>

          <!-- Skeleton Loading State -->
          <div *ngIf="loadingBubbles" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-pulse">
            <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="p-4 border border-gray-200 rounded-xl bg-gray-50">
              <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-200"></div>
              <div class="h-3 bg-gray-200 rounded mx-auto w-16"></div>
            </div>
          </div>

          <!-- Bubbles Grid -->
          <div *ngIf="!loadingBubbles && bubbles.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <button
              *ngFor="let bubble of bubbles; let i = index"
              (click)="toggleBubble(bubble.id)"
              [class.ring-2]="isBubbleSelected(bubble.id)"
              [class.ring-[#70AEB9]]="isBubbleSelected(bubble.id)"
              [class.bg-gradient-to-br]="isBubbleSelected(bubble.id)"
              [class.from-[#70AEB9]/10]="isBubbleSelected(bubble.id)"
              [class.to-[#4ECDC4]/10]="isBubbleSelected(bubble.id)"
              [class.shadow-md]="isBubbleSelected(bubble.id)"
              class="relative p-4 border-2 border-gray-200 rounded-xl hover:border-[#70AEB9] hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group"
              [style.animation-delay]="i * 50 + 'ms'"
            >
              <!-- Checkmark with Animation -->
              <div *ngIf="isBubbleSelected(bubble.id)" class="absolute top-2 right-2 w-6 h-6 bg-[#70AEB9] rounded-full flex items-center justify-center shadow-lg animate-bounce-in">
                <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <!-- Bubble Icon -->
              <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center shadow-md group-hover:shadow-xl transition-all duration-200">
                <img *ngIf="bubble.img_url" [src]="bubble.img_url" [alt]="bubble.name" class="w-8 h-8 object-contain" />
                <svg *ngIf="!bubble.img_url" class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                </svg>
              </div>
              
              <p class="text-xs font-semibold text-gray-900 text-center truncate">{{ bubble.name }}</p>
            </button>
          </div>

          <!-- Enhanced Empty State -->
          <div *ngIf="!loadingBubbles && bubbles.length === 0" class="text-center py-12">
            <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
              </svg>
            </div>
            <p class="text-gray-900 font-semibold mb-1">No bubbles yet</p>
            <p class="text-sm text-gray-500">Join some bubbles to share content with specific groups</p>
          </div>
        </div>

        <!-- Section 2: Individuals (Direct Selection) -->
        <div class="p-5 sm:p-6 border-b border-gray-100">
          <div class="flex items-center gap-3 mb-5">
            <div class="p-2 rounded-xl bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10">
              <svg class="w-5 h-5 text-[#70AEB9]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">Specific People</h3>
              <p class="text-xs text-gray-600 mt-0.5">Add individuals directly</p>
            </div>
          </div>

          <!-- Enhanced Search Individuals -->
          <div class="relative mb-5">
            <input
              type="text"
              [formControl]="individualSearchControl"
              placeholder="Search by name or username..."
              class="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
            />
            <div class="absolute left-4 top-1/2 -translate-y-1/2">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div *ngIf="individualSearchControl.value && individualSearchControl.value.length > 0" class="absolute right-4 top-1/2 -translate-y-1/2">
              <button
                (click)="individualSearchControl.setValue('')"
                class="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Selected Individuals with Animation -->
          <div *ngIf="selectedIndividuals.length > 0" class="mb-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-sm font-bold text-gray-700">Selected</p>
              <span class="px-2.5 py-1 bg-[#70AEB9] text-white text-xs font-bold rounded-full">{{ selectedIndividuals.length }}</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <div
                *ngFor="let person of selectedIndividuals"
                class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#70AEB9]/10 to-[#4ECDC4]/10 border-2 border-[#70AEB9]/30 rounded-full hover:shadow-md transition-all duration-200 animate-fade-in"
              >
                <div class="w-6 h-6 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white text-xs font-bold">
                  {{ person.first_name.charAt(0) }}
                </div>
                <span class="text-sm font-semibold text-gray-900">{{ person.first_name }} {{ person.last_name }}</span>
                <button
                  (click)="removeIndividual(person.id)"
                  class="p-1 hover:bg-red-100 rounded-full transition-all duration-200 hover:scale-110 active:scale-90"
                >
                  <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Enhanced Search Loading State -->
          <div *ngIf="isSearchingIndividuals" class="space-y-3 animate-pulse">
            <div *ngFor="let i of [1,2,3]" class="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
              <div class="w-10 h-10 rounded-full bg-gray-200"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>

          <!-- Enhanced No Results -->
          <div *ngIf="!isSearchingIndividuals && individualSearchControl.value && individualSearchControl.value.trim().length >= 2 && individualSearchResults.length === 0" class="text-center py-8">
            <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <p class="text-gray-900 font-semibold mb-1">No users found</p>
            <p class="text-sm text-gray-500">Try searching for "{{ individualSearchControl.value }}"</p>
          </div>

          <!-- Enhanced Individual Search Results -->
          <div *ngIf="!isSearchingIndividuals && individualSearchResults.length > 0" class="space-y-2">
            <p class="text-xs font-semibold text-gray-600 mb-3">Search Results</p>
            <button
              *ngFor="let person of individualSearchResults; let i = index"
              (click)="addIndividual(person)"
              [disabled]="isIndividualSelected(person.id)"
              [style.animation-delay]="i * 50 + 'ms'"
              class="w-full p-4 flex items-center gap-3 border-2 border-gray-200 rounded-xl hover:border-[#70AEB9] hover:bg-gradient-to-r hover:from-[#70AEB9]/5 hover:to-[#4ECDC4]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md animate-fade-in"
            >
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white font-bold text-lg shadow-md">
                {{ person.first_name.charAt(0) }}{{ person.last_name.charAt(0) }}
              </div>
              <div class="flex-1 text-left min-w-0">
                <p class="font-bold text-gray-900 truncate">{{ person.first_name }} {{ person.last_name }}</p>
                <p class="text-sm text-gray-600 truncate">@{{ person.mbiu_username }}</p>
              </div>
              <div *ngIf="isIndividualSelected(person.id)" class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-[#70AEB9] flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <svg *ngIf="!isIndividualSelected(person.id)" class="w-6 h-6 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Section 3: Saved Groups (Shortcuts) -->
        <div class="p-5 sm:p-6">
          <div class="flex items-center justify-between mb-5">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-xl bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10">
                <svg class="w-5 h-5 text-[#70AEB9]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">Saved Groups</h3>
                <p class="text-xs text-gray-600 mt-0.5">Quick selection shortcuts</p>
              </div>
            </div>
            <button
              (click)="openCreateGroup()"
              class="text-sm px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white hover:shadow-xl transition-all duration-200 font-semibold hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Group</span>
            </button>
          </div>

          <!-- Skeleton Loading State -->
          <div *ngIf="loadingGroups" class="space-y-3 animate-pulse">
            <div *ngFor="let i of [1,2,3]" class="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gray-200"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>

          <!-- Enhanced Groups List -->
          <div *ngIf="!loadingGroups && groups.length > 0" class="space-y-3">
            <div
              *ngFor="let group of groups; let i = index"
              [class.ring-2]="isGroupSelected(group.id)"
              [class.ring-[#70AEB9]]="isGroupSelected(group.id)"
              [class.bg-gradient-to-r]="isGroupSelected(group.id)"
              [class.from-[#70AEB9]/10]="isGroupSelected(group.id)"
              [class.to-[#4ECDC4]/10]="isGroupSelected(group.id)"
              [class.shadow-md]="isGroupSelected(group.id)"
              [style.animation-delay]="i * 50 + 'ms'"
              class="relative border-2 border-gray-200 rounded-xl hover:border-[#70AEB9] hover:shadow-lg transition-all duration-200 group animate-fade-in"
            >
              <button
                (click)="toggleGroup(group.id)"
                class="w-full p-4 flex items-center justify-between hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200"
              >
                <div class="flex items-center gap-4 flex-1 min-w-0">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200">
                    <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                    </svg>
                  </div>
                  <div class="text-left flex-1 min-w-0">
                    <p class="font-bold text-gray-900 truncate">{{ group.name }}</p>
                    <div class="flex items-center gap-1.5 mt-1">
                      <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      <p class="text-sm text-gray-600 font-medium">{{ group.member_count }} {{ group.member_count === 1 ? 'member' : 'members' }}</p>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 flex-shrink-0">
                  <div *ngIf="isGroupSelected(group.id)" class="w-8 h-8 bg-[#70AEB9] rounded-full flex items-center justify-center shadow-md animate-bounce-in">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <!-- Group Actions Menu -->
                  <div class="relative">
                    <button
                      (click)="toggleGroupMenu($event, group.id)"
                      class="p-2 hover:bg-gray-200 rounded-lg transition-all duration-200 hover:scale-110 active:scale-90"
                      aria-label="Group options"
                    >
                      <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                      </svg>
                    </button>

                    <!-- Enhanced Dropdown Menu -->
                    <div
                      *ngIf="activeGroupMenu === group.id"
                      class="absolute right-0 top-10 z-10 w-40 bg-white border-2 border-gray-200 rounded-xl shadow-2xl py-1 animate-fade-in"
                      (click)="$event.stopPropagation()"
                    >
                      <button
                        (click)="editGroup(group); $event.stopPropagation()"
                        class="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-[#70AEB9]/10 hover:to-[#4ECDC4]/10 flex items-center gap-3 transition-all duration-200"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                        Edit Group
                      </button>
                      <div class="h-px bg-gray-200 my-1"></div>
                      <button
                        (click)="deleteGroup(group); $event.stopPropagation()"
                        class="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-all duration-200"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <!-- Enhanced Empty State -->
          <div *ngIf="!loadingGroups && groups.length === 0" class="text-center py-12">
            <div class="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center shadow-inner">
              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
            <p class="text-gray-900 font-bold mb-2">No saved groups yet</p>
            <p class="text-sm text-gray-600 mb-4 max-w-xs mx-auto">Create groups to quickly share content with the same people every time</p>
            <button
              (click)="openCreateGroup()"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Group
            </button>
          </div>
        </div>
      </div>

      <!-- Enhanced Footer -->
      <div class="p-5 border-t border-gray-200 flex gap-3 flex-shrink-0 bg-gradient-to-b from-white to-gray-50">
        <button
          (click)="close()"
          class="flex-1 px-6 py-3.5 border-2 border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:shadow-md active:scale-95"
        >
          Cancel
        </button>
        <button
          (click)="confirm()"
          class="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-bold rounded-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Confirm ({{ recipientCount }})</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Custom Scrollbar */
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #70AEB9;
      border-radius: 10px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #5a9aa3;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes bounceIn {
      0% {
        opacity: 0;
        transform: scale(0.3);
      }
      50% {
        opacity: 1;
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }

    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }

    .animate-bounce-in {
      animation: bounceIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    }

    /* Smooth transitions for all interactive elements */
    button, input, select {
      transition: all 0.2s ease;
    }
  `]
})
export class VisibilitySelectorComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);
  private readonly dialogRef = inject(MatDialogRef<VisibilitySelectorComponent>);

  // Data
  bubbles: Bubble[] = [];
  individuals: Individual[] = [];
  groups: VisibilityGroup[] = [];

  // Selection state
  selectedBubbleIds: Set<string> = new Set();
  selectedIndividuals: Individual[] = [];
  selectedGroupIds: Set<number> = new Set();
  
  // UI state
  loadingBubbles = true;
  loadingGroups = true;
  individualSearchControl = new FormControl('');
  individualSearchResults: Individual[] = [];
  isSearchingIndividuals = false;
  activeGroupMenu: number | null = null;

  ngOnInit(): void {
    this.loadBubbles();
    this.loadGroups();
    
    // Default: All bubbles selected (this is the key default behavior!)
    this.selectAllBubblesOnLoad();
    
    // Set up debounced search for individuals
    this.setupIndividualSearch();
  }
  
  private setupIndividualSearch(): void {
    // Set up debounced search for individuals (same as create-group-dialog)
    this.individualSearchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (query && query.trim().length >= 2) {
          this.isSearchingIndividuals = true;
          return this.searchIndividuals(query.trim());
        } else {
          this.individualSearchResults = [];
          this.isSearchingIndividuals = false;
          return of([]);
        }
      })
    ).subscribe({
      next: (results: Individual[]) => {
        this.individualSearchResults = results;
        this.isSearchingIndividuals = false;
      },
      error: (error) => {
        console.error('Individual search error:', error);
        this.isSearchingIndividuals = false;
        this.individualSearchResults = [];
      }
    });
  }

  private loadBubbles(): void {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });

    // Fetch user's chat groups/bubbles
    this.http.get<any[]>(`${environment.apiUrl}api/v1/chat/groups`, { headers })
      .subscribe({
        next: (response) => {
          // Transform the response to match our Bubble interface
          this.bubbles = response.map((group: any) => ({
            id: group.participant?.id || group.id,
            name: group.participant?.displayName || group.name || 'Unnamed Bubble',
            img_url: group.participant?.avatar || group.avatar,
            memberCount: group.participant?.participantCount || group.participant?.chattingTo?.length || 0
          }));
          console.log('📦 Loaded bubbles:', this.bubbles);
          this.selectAllBubblesOnLoad();
          this.loadingBubbles = false;
        },
        error: (error) => {
          console.error('Error loading bubbles:', error);
          this.loadingBubbles = false;
        }
      });
  }

  private loadGroups(): void {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });

    this.http.get<{ groups: VisibilityGroup[] }>(`${environment.apiUrl}api/v1/posts/visibility_groups/`, { headers })
      .subscribe({
        next: (response) => {
          this.groups = response.groups || [];
          this.loadingGroups = false;
        },
        error: (error) => {
          console.error('Error loading groups:', error);
          this.loadingGroups = false;
        }
      });
  }

  private selectAllBubblesOnLoad(): void {
    // IMPORTANT: All bubbles selected by default!
    this.selectedBubbleIds = new Set(this.bubbles.map(b => b.id));
  }

  private getHeaders() {
    const token = localStorage.getItem('mbiu-token');
    return {
      'Content-Type': 'application/json',
      'mbiu-token': token || ''
    };
  }

  private searchIndividuals(query: string) {
    const headers = this.getHeaders();
    const params = new HttpParams()
      .set('s', query)
      .set('users', '1')
      .set('per_page', '10');

    return this.http.get<{ users: Individual[] }>(
      `${environment.apiUrl.replace(/\/$/, '')}/api/v1/search`,
      { headers, params }
    ).pipe(
      switchMap(response => of(response.users || []))
    );
  }

  // Bubble methods
  toggleBubble(id: string): void {
    if (this.selectedBubbleIds.has(id)) {
      this.selectedBubbleIds.delete(id);
    } else {
      this.selectedBubbleIds.add(id);
    }
  }

  isBubbleSelected(id: string): boolean {
    return this.selectedBubbleIds.has(id);
  }

  areAllBubblesSelected(): boolean {
    return this.selectedBubbleIds.size === this.bubbles.length;
  }

  toggleAllBubbles(): void {
    if (this.areAllBubblesSelected()) {
      this.selectedBubbleIds.clear();
    } else {
      this.selectedBubbleIds = new Set(this.bubbles.map(b => b.id));
    }
  }

  // Individual methods
  addIndividual(person: Individual): void {
    if (!this.isIndividualSelected(person.id)) {
      this.selectedIndividuals.push(person);
    }
  }

  removeIndividual(id: number): void {
    this.selectedIndividuals = this.selectedIndividuals.filter(p => p.id !== id);
  }

  isIndividualSelected(id: number): boolean {
    return this.selectedIndividuals.some(p => p.id === id);
  }

  // Group methods
  toggleGroup(id: number): void {
    if (this.selectedGroupIds.has(id)) {
      this.selectedGroupIds.delete(id);
    } else {
      this.selectedGroupIds.add(id);
    }
  }

  isGroupSelected(id: number): boolean {
    return this.selectedGroupIds.has(id);
  }

  // Recipient count calculation
  get recipientCount(): number {
    if (this.isPublic) {
      return 0; // Everyone
    }
    
    // This is an approximation - actual count would need backend calculation
    let count = 0;
    
    // Count from bubbles (rough estimate: assume 10 users per bubble)
    count += this.selectedBubbleIds.size * 10;
    
    // Count individuals
    count += this.selectedIndividuals.length;
    
    // Count from groups
    this.groups.forEach(group => {
      if (this.selectedGroupIds.has(group.id)) {
        count += group.member_count;
      }
    });
    
    return count;
  }

  get isPublic(): boolean {
    // If all bubbles are selected and nothing else, it's public
    return this.areAllBubblesSelected() && 
           this.selectedIndividuals.length === 0 && 
           this.selectedGroupIds.size === 0;
  }

  resetToDefault(): void {
    this.selectAllBubblesOnLoad();
    this.selectedIndividuals = [];
    this.selectedGroupIds.clear();
  }

  openCreateGroup(): void {
    const dialogRef = this.dialog.open(CreateVisibilityGroupDialogComponent, {
      width: '90vw',
      maxWidth: '600px',
      maxHeight: '85vh',
      disableClose: false,
      panelClass: 'create-group-dialog'
    });

    dialogRef.afterClosed().subscribe((newGroup: any) => {
      if (newGroup) {
        console.log('✅ New visibility group created:', newGroup);
        
        // Add the new group to the list
        this.groups.push({
          id: newGroup.id,
          name: newGroup.name,
          member_count: newGroup.member_count || 0,
          members: newGroup.members || []
        });
        
        // Auto-select the newly created group
        this.selectedGroupIds.add(newGroup.id);
        
        console.log('📦 Updated groups list:', this.groups);
      }
    });
  }

  confirm(): void {
    const selection: VisibilitySelection = {
      is_public: this.isPublic,
      bubbles: Array.from(this.selectedBubbleIds),
      individuals: this.selectedIndividuals.map(p => p.id),
      groups: Array.from(this.selectedGroupIds)
    };
    
    this.dialogRef.close(selection);
  }

  close(): void {
    this.dialogRef.close(null);
  }

  // Group menu methods
  toggleGroupMenu(event: Event, groupId: number): void {
    event.stopPropagation();
    this.activeGroupMenu = this.activeGroupMenu === groupId ? null : groupId;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // Close group menu when clicking outside
    this.activeGroupMenu = null;
  }

  editGroup(group: VisibilityGroup): void {
    this.activeGroupMenu = null;
    // Open the create group dialog in edit mode
    const dialogRef = this.dialog.open(CreateVisibilityGroupDialogComponent, {
      width: '90vw',
      maxWidth: '600px',
      maxHeight: '85vh',
      disableClose: false,
      panelClass: 'create-group-dialog',
      data: { group, isEditMode: true }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log('✅ Group updated:', result);
        // Update the group in the list
        const index = this.groups.findIndex(g => g.id === result.id);
        if (index !== -1) {
          this.groups[index] = result;
        }
      }
    });
  }

  deleteGroup(group: VisibilityGroup): void {
    this.activeGroupMenu = null;
    const confirmDelete = confirm(`Are you sure you want to delete "${group.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    const token = this.getToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`${environment.apiUrl}api/v1/posts/visibility_groups/${group.id}/delete/`, { headers })
      .subscribe({
        next: () => {
          console.log('✅ Group deleted:', group.name);
          // Remove from the list
          this.groups = this.groups.filter(g => g.id !== group.id);
          // Remove from selection if it was selected
          this.selectedGroupIds.delete(group.id);
        },
        error: (error) => {
          console.error('❌ Error deleting group:', error);
          alert('Failed to delete group. Please try again.');
        }
      });
  }

  private getToken(): string {
    const user = localStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      return userData.token?.access || userData.token || '';
    }
    return '';
  }
}

