import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { DailyDareService, QuizDare, DailyDare } from '@app/services/daily-dare.service';
import { QuizResultsDialogComponent } from '@app/components/quiz-results-dialog.component';

@Component({
  selector: 'app-daily-dare-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <!-- Back Button -->
        <button 
          (click)="goBack()"
          class="group flex items-center gap-2 text-gray-600 hover:text-[#70AEB9] transition-colors duration-200 mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/50 rounded-lg px-2 py-1"
        >
          <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span class="font-medium">Back to Dares</span>
        </button>

        <!-- Loading State -->
        <div *ngIf="loadingQuiz && !dare" class="animate-pulse space-y-6">
          <div class="h-64 bg-gray-300 rounded-3xl"></div>
          <div class="h-8 bg-gray-300 rounded w-3/4"></div>
          <div class="h-6 bg-gray-200 rounded w-full"></div>
          <div class="space-y-4">
            <div class="h-32 bg-gray-200 rounded-2xl"></div>
            <div class="h-32 bg-gray-200 rounded-2xl"></div>
          </div>
        </div>

        <!-- Dare Header -->
        <div *ngIf="dare" class="mb-8">
          <!-- Hero Image -->
          <div class="relative h-64 sm:h-80 w-full rounded-3xl overflow-hidden shadow-2xl mb-6">
            <img 
              [src]="dare.image_url || 'assets/games/1.svg'" 
              [alt]="dare.title"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            
            <!-- Badges on image -->
            <div class="absolute top-4 left-4 right-4 flex justify-between items-start">
              <span class="px-4 py-2 rounded-full text-sm font-semibold text-white backdrop-blur-md"
                    [ngClass]="getTypePillClass(dare.challenge_type)">
                {{ dare.challenge_type || 'Challenge' }}
              </span>
              <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-sm shadow-lg">
                <svg class="w-5 h-5 text-[#FFD700]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span class="text-lg font-bold text-gray-900">{{ dare.points || 10 }} pts</span>
              </div>
            </div>

              <!-- Title overlay -->
            <div class="absolute bottom-6 left-6 right-6">
              <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {{ dare.title || 'Daily Dare' }}
              </h1>
              <p class="text-white/90 text-lg drop-shadow">{{ dare.date || 'Today' }}</p>
              <!-- Completion badge -->
              <div *ngIf="isCompleted" class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/90 text-white text-sm font-semibold mt-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Completed Today
              </div>
            </div>
          </div>

          <!-- Description Card -->
          <div *ngIf="dare.description" class="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Challenge Description
            </h3>
            <p class="text-gray-700 leading-relaxed">{{ dare.description }}</p>
          </div>

          <!-- Start/Status Section -->
          <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-6">
            <div class="text-center">
              <!-- Already Completed State -->
              <div *ngIf="isCompleted" class="space-y-4">
                <div class="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Already Completed Today!</h3>
                <p class="text-gray-600 mb-4">You earned {{ userScore }} points for this challenge.</p>
                <div class="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    *ngIf="isQuiz"
                    (click)="viewCompletedResults()"
                    class="px-6 py-3 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    View Results
                  </button>
                  <button
                    (click)="viewHistory()"
                    class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                  >
                    View History
                  </button>
                  <button
                    (click)="viewLeaderboard()"
                    class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors duration-200"
                  >
                    View Leaderboard
                  </button>
                </div>
              </div>

              <!-- Start Challenge Button -->
              <div *ngIf="!isCompleted && !loadingQuiz" class="space-y-4">
                <button
                  (click)="startAttempt()"
                  class="px-8 py-4 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 mx-auto"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Challenge
                </button>
                <p class="text-sm text-gray-500">
                  {{ isQuiz ? 'Answer all questions to complete' : isProof ? 'Upload photo/video proof' : 'Complete the challenge' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quiz Section -->
        <div *ngIf="isQuiz && quiz && !loadingQuiz && !isCompleted" class="space-y-6 quiz-section">
          <!-- Progress bar -->
          <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-semibold text-gray-700">Your Progress</span>
              <span class="text-sm font-semibold text-[#70AEB9]">{{ answeredCount }} / {{ quiz?.questions?.length || 0 }}</span>
            </div>
            <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] rounded-full transition-all duration-500"
                [style.width.%]="progressPercent"
              ></div>
            </div>
          </div>

          <!-- Questions -->
          <div *ngFor="let q of quiz?.questions || []; let i = index" 
               class="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-xl"
               [class.ring-2]="answers[i]"
               [class.ring-[#70AEB9]]="answers[i]">
            
            <!-- Question Header -->
            <div class="bg-gradient-to-r from-[#70AEB9]/10 to-[#4ECDC4]/10 px-6 py-4 border-b border-gray-100">
              <div class="flex items-start gap-3">
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center text-white font-bold shadow-md">
                  {{ i + 1 }}
                </div>
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">{{ getQuestionText(q) }}</h3>
                </div>
                <svg *ngIf="answers[i]" class="w-6 h-6 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

            <!-- Options -->
            <div class="p-6 space-y-3">
              <label 
                *ngFor="let opt of q.options; let optIdx = index"
                class="group flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:border-[#70AEB9] hover:bg-[#70AEB9]/5"
                [class.border-[#70AEB9]]="answers[i] === ('' + optIdx)"
                [class.bg-[#70AEB9]/10]="answers[i] === ('' + optIdx)"
                [class.border-gray-200]="answers[i] !== ('' + optIdx)"
              >
                <input 
                  type="radio" 
                  [name]="'q' + i" 
                  [value]="'' + optIdx" 
                  (change)="answer(i, ('' + optIdx))"
                  [checked]="answers[i] === ('' + optIdx)"
                  class="mt-1 w-5 h-5 text-[#70AEB9] focus:ring-[#70AEB9] focus:ring-2 cursor-pointer"
                />
                <span class="flex-1 text-gray-700 group-hover:text-gray-900 font-medium">
                  {{ getOptionLabel(opt) }}
                </span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="sticky bottom-6 z-20">
            <div class="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="text-sm text-gray-600">
                  <span class="font-semibold">{{ answeredCount }}</span> of 
                  <span class="font-semibold">{{ quiz?.questions?.length || 0 }}</span> questions answered
                </div>
                <button 
                  (click)="submit()" 
                  [disabled]="submitting || answeredCount < (quiz?.questions?.length || 0)"
                  class="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  [class.bg-gradient-to-r]="!submitting"
                  [class.from-[#70AEB9]]="!submitting"
                  [class.to-[#4ECDC4]]="!submitting"
                  [class.hover:shadow-2xl]="!submitting"
                  [class.transform]="!submitting"
                  [class.hover:scale-105]="!submitting"
                  [class.bg-gray-400]="submitting"
                >
                  <span *ngIf="!submitting">Submit Answers</span>
                  <span *ngIf="submitting" class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                  <svg *ngIf="!submitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Proof Upload Section -->
        <div *ngIf="isProof" class="space-y-6 proof-section">
          <div class="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {{ isCompleted ? 'Your Submitted Proof' : 'Submit Your Proof' }}
            </h3>

            <!-- Completed State -->
            <div *ngIf="isCompleted" class="text-center py-6">
              <div class="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 class="text-lg font-semibold text-gray-900 mb-2">Proof Submitted Successfully!</h4>
              <p class="text-gray-600">You earned {{ userScore }} points for this challenge.</p>
            </div>

            <!-- File Upload Area (only show if not completed) -->
            <div *ngIf="!isCompleted" class="space-y-4">
              <div
                class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200"
                [class.border-[#70AEB9]="!selectedFile"]
                [class.border-gray-300]="!selectedFile"]
                [class.bg-[#70AEB9]/5]="selectedFile"
              >
                <!-- Upload Icon -->
                <div *ngIf="!selectedFile" class="mb-4">
                  <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p class="text-gray-600 mb-2">Upload photo or video proof</p>
                  <p class="text-sm text-gray-500">PNG, JPG, GIF, MP4 up to 50MB</p>
                </div>

                <!-- File Preview -->
                <div *ngIf="selectedFile" class="space-y-4">
                  <div *ngIf="filePreview" class="max-w-md mx-auto">
                    <img *ngIf="selectedFile.type.startsWith('image/')" [src]="filePreview" alt="Preview" class="rounded-lg max-w-full h-auto mx-auto shadow-md" />
                    <video *ngIf="selectedFile.type.startsWith('video/')" [src]="filePreview" controls class="rounded-lg max-w-full h-auto mx-auto shadow-md"></video>
                  </div>
                  <div class="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ selectedFile.name }}
                    <button
                      (click)="removeFile()"
                      class="ml-2 text-red-500 hover:text-red-700 transition-colors"
                      type="button"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Upload Button -->
                <input
                  type="file"
                  #fileInput
                  (change)="onFileSelected($event)"
                  accept="image/*,video/*"
                  class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  [disabled]="isUploading"
                />
              </div>

              <!-- Submit Button -->
              <div class="flex justify-center">
                <button
                  (click)="submitProof()"
                  [disabled]="!selectedFile || isUploading"
                  class="px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  [class.bg-gradient-to-r]="selectedFile && !isUploading"
                  [class.from-[#70AEB9]]="selectedFile && !isUploading"
                  [class.to-[#4ECDC4]]="selectedFile && !isUploading"
                  [class.hover:shadow-2xl]="selectedFile && !isUploading"
                  [class.transform]="selectedFile && !isUploading"
                  [class.hover:scale-105]="selectedFile && !isUploading"
                  [class.bg-gray-400]="!selectedFile || isUploading"
                >
                  <span *ngIf="!isUploading">Submit Proof</span>
                  <span *ngIf="isUploading" class="flex items-center gap-2">
                    <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                  <svg *ngIf="!isUploading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Non-Quiz Challenge -->
        <div *ngIf="!loadingQuiz && !isQuiz && !isProof" class="bg-gradient-to-br from-[#70AEB9]/10 to-[#4ECDC4]/10 rounded-3xl shadow-xl border-2 border-[#70AEB9]/20 p-8 sm:p-12 text-center activity-section">
          <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#70AEB9] to-[#4ECDC4] flex items-center justify-center shadow-lg">
            <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Activity-Based Challenge</h3>
          <p class="text-gray-700 text-lg leading-relaxed max-w-2xl mx-auto mb-6">
            This dare is an activity challenge. Follow the instructions in the description above to complete it!
          </p>
          <button
            (click)="markAsCompleted()"
            class="px-8 py-4 bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] text-white font-bold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class DailyDareDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dareService = inject(DailyDareService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  dare?: DailyDare;
  quiz?: QuizDare;
  isQuiz = false;
  isProof = false; // For photo/video proof challenges
  loadingQuiz = true;
  answers: Record<number, string> = {};
  submitting = false;
  submittedMessage = '';

  // Completion state
  isCompleted = false;
  userScore?: number;
  totalPossible?: number;

  // Proof upload
  selectedFile?: File;
  filePreview?: string;
  isUploading = false;

  get answeredCount(): number {
    return Object.keys(this.answers).length;
  }

  get progressPercent(): number {
    if (!this.quiz?.questions?.length) return 0;
    return (this.answeredCount / this.quiz.questions.length) * 100;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const navState: any = window.history.state || {};
    if (navState && navState.dare) {
      this.dare = navState.dare as DailyDare;
    }

    console.log('Loading dare with ID:', id);

    // If we have dare data from navigation state, use it temporarily
    if (this.dare) {
      this.isCompleted = this.dare.is_completed || false;
      this.userScore = this.dare.user_score ?? undefined;
      this.totalPossible = this.dare.points || 10;
      this.isProof = this.isProofType(this.dare.challenge_type);
      this.isQuiz = this.isQuizType(this.dare.challenge_type) || this.hasQuizData(this.dare);


      // Load quiz data immediately if we have dare data and it's a quiz
      if (this.isQuiz) {
        this.loadQuizData(id);
      } else {
        this.loadingQuiz = false;
      }
    }

    // Always re-fetch latest server truth
    this.dareService.fetchById(id).subscribe({
      next: (d) => {
        console.log('Dare API response:', d);
        this.dare = d as DailyDare;
        this.isCompleted = d.is_completed || false;
        this.userScore = d.user_score ?? undefined;
        this.totalPossible = d.points || 10;

        // Check dare types
        this.isProof = this.isProofType(d.challenge_type);
        this.isQuiz = this.isQuizType(d.challenge_type) || this.hasQuizData(d);


        // If it's a quiz type, load quiz data (for answering or for results context)
        if (this.isQuiz) {
          this.loadQuizData(id);
        } else {
          this.loadingQuiz = false;
        }
      },
      error: (err) => {
        console.error('Failed to load dare details:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);

        // If API fails but we have navigation state data, continue with that
        if (this.dare) {
          console.log('Using navigation state data as fallback');
          this.snackBar.open('Using cached data - API unavailable', 'Dismiss', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to load dare details', 'Dismiss', { duration: 3000 });
          this.loadingQuiz = false;
        }
      }
    });
  }

  answer(index: number, value: string) {
    this.answers[index] = value;
    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  }

  submit() {
    if (!this.isQuiz || !this.quiz) return;
    
    const totalQuestions = this.quiz.questions?.length || 0;
    if (this.answeredCount < totalQuestions) {
      this.snackBar.open('Please answer all questions before submitting', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Convert answers object to the format expected by backend
    // answers is Record<number, string> where key is question index, value is option_id
    const responses = Object.entries(this.answers).map(([questionIndex, optionId]) => {
      const question = this.quiz?.questions?.[Number(questionIndex)];
      return {
        question_id: question?.id || 0,
        option_id: Number(optionId)
      };
    });

    const payload = { responses };
    this.submitting = true;

    console.log('Submitting quiz answers:', payload);

    this.dareService.submitQuizAnswers(payload).subscribe({
      next: (response: any) => {
        console.log('Quiz submission response:', response);
        this.submitting = false;
        this.isCompleted = true;
        this.userScore = response.score || 0;
        this.totalPossible = response.total_possible || totalQuestions;

        // Build selected answers map for the dialog
        const selectedAnswersMap: { [questionId: number]: number } = {};
        Object.entries(this.answers).forEach(([questionIndex, optionId]) => {
          const question = this.quiz?.questions?.[Number(questionIndex)];
          if (question) {
            selectedAnswersMap[question.id] = Number(optionId);
          }
        });

        // Open results dialog with detailed feedback
        this.dialog.open(QuizResultsDialogComponent, {
          data: {
            status: response.status || 'completed',
            score: response.score || 0,
            total_possible: response.total_possible || totalQuestions,
            responses: response.responses || [],
            questions: this.quiz?.questions || [],
            selectedAnswers: selectedAnswersMap
          },
          width: '90vw',
          maxWidth: '600px',
          disableClose: false
        }).afterClosed().subscribe(() => {
          // After dialog closes, navigate back to dare list
          this.router.navigate(['/app/daily-dare']);
        });
      },
      error: (err) => {
        console.error('Quiz submission error:', err);
        this.submitting = false;
        
        // Check for "already completed" error
        if (err.status === 400 && err.error?.error?.includes('already completed')) {
          this.snackBar.open('You\'ve already completed today\'s quiz!', 'OK', {
            duration: 4000,
            panelClass: ['error-snackbar']
          });
          setTimeout(() => {
            this.router.navigate(['/app/daily-dare']);
          }, 2000);
        } else {
          this.snackBar.open('❌ Submission failed. Please try again.', 'Retry', {
            duration: 4000,
            panelClass: ['error-snackbar']
          }).onAction().subscribe(() => {
            this.submit();
          });
        }
      }
    });
  }

  viewCompletedResults() {
    if (!this.dare || !this.dare.id) {
      this.snackBar.open('Unable to load results', 'OK', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    console.log('Fetching results for dare ID:', this.dare.id);

    this.dareService.fetchQuizResults(this.dare.id).subscribe({
      next: (response) => {
        console.log('Quiz results loaded:', response);

        // Build selected answers map for the dialog
        const selectedAnswersMap: { [questionId: number]: number } = {};
        response.responses.forEach((resp) => {
          if (resp.selected_option_id) {
            selectedAnswersMap[resp.question_id] = resp.selected_option_id;
          }
        });

        // Open results dialog with detailed feedback
        this.dialog.open(QuizResultsDialogComponent, {
          data: {
            status: response.status || 'completed',
            score: response.score || 0,
            total_possible: response.total_possible || 0,
            responses: response.responses || [],
            questions: response.questions || [],
            selectedAnswers: selectedAnswersMap
          },
          width: '90vw',
          maxWidth: '600px',
          disableClose: false
        });
      },
      error: (err) => {
        console.error('Failed to load quiz results:', err);
        this.snackBar.open('Failed to load results. Please try again.', 'OK', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  markAsCompleted() {
    this.snackBar.open('✅ Challenge marked as completed!', 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
    setTimeout(() => {
      this.goBack();
    }, 1500);
  }

  getTypePillClass(type?: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('quiz')) return 'bg-[#0b4d57]/80';
    if (t.includes('photo') || t.includes('image')) return 'bg-[#70AEB9]/80';
    if (t.includes('video')) return 'bg-indigo-600/80';
    return 'bg-emerald-600/80';
  }

  isProofType(type?: string): boolean {
    const t = (type || '').toLowerCase();
    return t.includes('photo') || t.includes('image') || t.includes('video') || t.includes('proof');
  }

  isQuizType(type?: string): boolean {
    const t = (type || '').toLowerCase();
    return t.includes('quiz') || t.includes('question') || t.includes('test') || t === 'challenge';
  }

  hasQuizData(dare: DailyDare): boolean {
    return !!(dare as any).questions && (dare as any).questions.length > 0;
  }

  loadQuizData(id: number): void {
    // First try to get quiz data from the dare itself
    if (this.hasQuizData(this.dare!)) {
      const dareWithQuestions = this.dare as any;
      console.log('Quiz data found in dare object:', dareWithQuestions);
      console.log('Questions array:', dareWithQuestions.questions);

      // Validate and process the quiz data
      if (this.isValidQuizStructure(dareWithQuestions.questions)) {
        this.quiz = this.dare as QuizDare;
        this.loadingQuiz = false;
        console.log('Using validated quiz data from dare object');
        return;
      } else {
        console.warn('Quiz data in dare object has invalid structure, will try API or create mock');
      }
    }

    // Otherwise, try the separate quiz endpoint
    this.dareService.fetchQuizById(id).subscribe({
      next: (q) => {
        console.log('Quiz data loaded from API:', q);
        if (q && this.isValidQuizStructure((q as any).questions)) {
          this.quiz = q;
          this.loadingQuiz = false;
        } else {
          console.warn('API quiz data has invalid structure, creating mock');
          this.createMockQuiz();
        }
      },
      error: (err) => {
        console.error('Failed to load quiz data:', err);
        // Create mock quiz data for demonstration
        this.createMockQuiz();
      }
    });
  }

  isValidQuizStructure(questions: any): boolean {
    if (!Array.isArray(questions) || questions.length === 0) {
      console.log('Invalid: questions is not a non-empty array');
      return false;
    }
    
    // Check if at least the first question has the expected structure
    const firstQ = questions[0];
    if (!firstQ) {
      console.log('Invalid: first question is null/undefined');
      return false;
    }
    
    // Question should have a "question" property (string) and "options" array
    const hasQuestion = typeof firstQ.question === 'string' ||  (firstQ.question && typeof firstQ.question === 'object');
    const hasOptions = Array.isArray(firstQ.options) && firstQ.options.length > 0;
    
    console.log('Question validation:', {
      hasQuestion,
      hasOptions,
      questionType: typeof firstQ.question,
      optionsLength: hasOptions ? firstQ.options.length : 0
    });
    
    return hasQuestion && hasOptions;
  }

  createMockQuiz(): void {
    // Create mock quiz data so users can see the interface
    const mockQuestions = [
      {
        id: 1,
        question_text: "What's the capital of France?",
        question_type: "multiple_choice",
        points: 10,
        options: [
          { id: 1, option_text: "London", is_correct: false },
          { id: 2, option_text: "Berlin", is_correct: false },
          { id: 3, option_text: "Paris", is_correct: true },
          { id: 4, option_text: "Madrid", is_correct: false }
        ]
      },
      {
        id: 2,
        question_text: "Which planet is known as the Red Planet?",
        question_type: "multiple_choice",
        points: 10,
        options: [
          { id: 5, option_text: "Venus", is_correct: false },
          { id: 6, option_text: "Mars", is_correct: true },
          { id: 7, option_text: "Jupiter", is_correct: false },
          { id: 8, option_text: "Saturn", is_correct: false }
        ]
      },
      {
        id: 3,
        question_text: "What is 2 + 2?",
        question_type: "multiple_choice",
        points: 10,
        options: [
          { id: 9, option_text: "3", is_correct: false },
          { id: 10, option_text: "4", is_correct: true },
          { id: 11, option_text: "5", is_correct: false },
          { id: 12, option_text: "6", is_correct: false }
        ]
      }
    ];

    this.quiz = {
      id: this.dare?.id || 1,
      title: this.dare?.title || 'Sample Quiz',
      description: this.dare?.description || 'Test your knowledge!',
      date: this.dare?.date,
      challenge_type: 'quiz',
      points: this.dare?.points || 10,
      questions: mockQuestions
    };

    this.loadingQuiz = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.filePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(): void {
    this.selectedFile = undefined;
    this.filePreview = undefined;
  }

  submitProof(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Please select a file to upload', 'OK', { duration: 3000 });
      return;
    }

    this.isUploading = true;

    // Simulate upload delay - replace with actual API call when backend is ready
    setTimeout(() => {
      this.isUploading = false;
      this.isCompleted = true;
      this.userScore = this.dare?.points || 10;
      this.showResults({
        type: 'proof',
        score: this.userScore,
        total: this.dare?.points || 10,
        message: 'Proof submitted successfully!'
      });
    }, 2000);
  }

  showResults(results: any): void {
    // Create results dialog
    const resultMessage = results.type === 'quiz'
      ? `🎉 Quiz completed! You scored ${results.score}/${results.total} points.`
      : `✅ Proof submitted! You earned ${results.score} points.`;

    this.snackBar.open(resultMessage, 'View History', {
      duration: 6000,
      panelClass: ['success-snackbar']
    }).onAction().subscribe(() => {
      this.viewHistory();
    });
  }

  viewHistory(): void {
    this.router.navigate(['/app/daily-dare/history']);
  }

  viewLeaderboard(): void {
    this.router.navigate(['/app/leaderboard']);
  }

  startAttempt(): void {
    // Scroll to attempt section after a brief delay to ensure DOM is updated
    setTimeout(() => {
      let element: Element | null = null;

      if (this.isQuiz) {
        element = document.querySelector('.quiz-section');
      } else if (this.isProof) {
        element = document.querySelector('.proof-section');
      } else {
        // Activity-based challenge
        element = document.querySelector('.activity-section');
      }

      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Add visual highlight
        element.classList.add('ring-2', 'ring-[#70AEB9]', 'ring-opacity-50');
        setTimeout(() => {
          element?.classList.remove('ring-2', 'ring-[#70AEB9]', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  }

  goBack() {
    this.router.navigate(['/app/daily-dare']);
  }

  // ---- Safe accessors for quiz rendering ----
  getQuestionText(q: any): string {
    if (!q) {
      console.warn('getQuestionText: q is null/undefined');
      return '';
    }
    if (typeof q === 'string') return q;
    if (q.question_text) {
      return String(q.question_text);
    }
    if (q.question) {
      return String(q.question);
    }
    console.warn('getQuestionText: no valid question property found in', q);
    return '';
  }

  getOptionLabel(opt: any): string {
    if (opt == null) {
      console.warn('getOptionLabel: opt is null/undefined');
      return '';
    }
    if (typeof opt === 'string') {
      return opt;
    }
    if (typeof opt === 'number') {
      return String(opt);
    }
    // common shapes: { option_text, label, text, value }
    if (opt.option_text != null) return String(opt.option_text);
    if (opt.label != null) return String(opt.label);
    if (opt.text != null) return String(opt.text);
    if (opt.value != null) return String(opt.value);
    // last resort
    console.warn('getOptionLabel: opt is an object with no recognizable label/text/value property:', opt);
    try {
      const str = JSON.stringify(opt);
      return str.length > 50 ? str.substring(0, 47) + '...' : str;
    } catch {
      return '[Invalid Option]';
    }
  }

  getOptionValue(opt: any): string {
    if (opt == null) return '';
    if (typeof opt === 'string' || typeof opt === 'number') return String(opt);
    if (opt.value != null) return String(opt.value);
    if (opt.label != null) return String(opt.label);
    if (opt.text != null) return String(opt.text);
    try { return String(opt); } catch { return ''; }
  }
}


