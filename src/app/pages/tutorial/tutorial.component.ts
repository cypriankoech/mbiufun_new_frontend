import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Help Center</h1>
          <p class="text-gray-600">Get help and learn how to make the most of Mbiufun</p>
        </div>

        <div *ngIf="isLoading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70AEB9] mx-auto"></div>
          <p class="mt-4 text-gray-600">Loading help content...</p>
        </div>

        <div *ngIf="!isLoading" class="space-y-6">
          <!-- Getting Started Section -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-[#70AEB9] text-white p-6">
              <h2 class="text-xl font-bold mb-2">Getting Started</h2>
              <p class="text-blue-100">Learn the basics of using Mbiufun</p>
            </div>
            <div class="p-6 space-y-4">
              <div *ngFor="let tutorial of gettingStartedTutorials" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                   (click)="openTutorial(tutorial)">
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-[#70AEB9] rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10V9a2 2 0 012-2h2a2 2 0 012 2v1.586a1 1 0 01-.293.707L12 12.414a1 1 0 00-.293.707V15"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-800">{{ tutorial.title }}</h3>
                    <p class="text-gray-600 text-sm">{{ tutorial.description }}</p>
                  </div>
                </div>
                <div class="text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Features Section -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-green-500 text-white p-6">
              <h2 class="text-xl font-bold mb-2">Features</h2>
              <p class="text-green-100">Discover all the amazing features</p>
            </div>
            <div class="p-6 space-y-4">
              <div *ngFor="let tutorial of featureTutorials" 
                   class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                   (click)="openTutorial(tutorial)">
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-800">{{ tutorial.title }}</h3>
                    <p class="text-gray-600 text-sm">{{ tutorial.description }}</p>
                  </div>
                </div>
                <div class="text-gray-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ Section -->
          <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="bg-purple-500 text-white p-6">
              <h2 class="text-xl font-bold mb-2">Frequently Asked Questions</h2>
              <p class="text-purple-100">Quick answers to common questions</p>
            </div>
            <div class="p-6 space-y-4">
              <div *ngFor="let faq of faqs" 
                   class="border border-gray-200 rounded-lg">
                <button 
                  class="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                  (click)="toggleFaq(faq)">
                  <span class="font-semibold text-gray-800">{{ faq.question }}</span>
                  <svg class="w-5 h-5 text-gray-400 transform transition-transform duration-200"
                       [class.rotate-180]="faq.expanded">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div *ngIf="faq.expanded" class="px-4 pb-4">
                  <p class="text-gray-600">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TutorialComponent implements OnInit {
  private readonly router = inject(Router);
  
  isLoading = true;
  private subscriptions: Subscription[] = [];

  gettingStartedTutorials = [
    {
      id: 1,
      title: 'Welcome to Mbiufun',
      description: 'Learn the basics of navigating the app',
      type: 'getting-started'
    },
    {
      id: 2,
      title: 'Setting Up Your Profile',
      description: 'Complete your profile to get started',
      type: 'getting-started'
    },
    {
      id: 3,
      title: 'Finding Friends',
      description: 'Connect with friends and build your network',
      type: 'getting-started'
    }
  ];

  featureTutorials = [
    {
      id: 4,
      title: 'Daily Dare Challenges',
      description: 'How to participate in daily challenges',
      type: 'features'
    },
    {
      id: 5,
      title: 'Vibes & Activities',
      description: 'Discover and plan activities with friends',
      type: 'features'
    },
    {
      id: 6,
      title: 'Group Bubbles',
      description: 'Create and manage group conversations',
      type: 'features'
    }
  ];

  faqs = [
    {
      question: 'How do I earn points?',
      answer: 'You can earn points by completing daily dares, participating in activities, and engaging with friends on the platform.',
      expanded: false
    },
    {
      question: 'How do I join a group?',
      answer: 'You can join groups by receiving invitations from friends or by searching for public groups in the Groups section.',
      expanded: false
    },
    {
      question: 'What are Vibes?',
      answer: 'Vibes are your interests and preferences that help us recommend activities and connect you with like-minded friends.',
      expanded: false
    },
    {
      question: 'How do I reset my password?',
      answer: 'Go to the login page and click "Forgot Password". Enter your email address and follow the instructions sent to your email.',
      expanded: false
    }
  ];

  async ngOnInit(): Promise<void> {
    // TODO: Add analytics logging
    // await this.analytics.logEvent('page_view', {"component": "TutorialComponent"});

    // Show loading for a very short time to demonstrate the loading state
    setTimeout(() => {
      this.isLoading = false;
    }, 100);
  }

  openTutorial(tutorial: any): void {
    // TODO: Open tutorial dialog or navigate to tutorial page
    console.log('Opening tutorial:', tutorial);
  }

  toggleFaq(faq: any): void {
    faq.expanded = !faq.expanded;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}