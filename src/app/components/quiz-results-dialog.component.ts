import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

export interface QuizDareOption {
  id: number;
  option_text: string;
  is_correct: boolean;
}

export interface QuizDareQuestion {
  id: number;
  question_text: string;
  question_type: string;
  points: number;
  order: number;
  options: QuizDareOption[];
}

export interface QuizResultResponse {
  question_id: number;
  is_correct: boolean;
  points_earned: number;
}

export interface QuizSubmissionResponse {
  status: string;
  score: number;
  total_possible: number;
  responses: QuizResultResponse[];
}

export interface QuizResultsData extends QuizSubmissionResponse {
  questions: QuizDareQuestion[];
  selectedAnswers: { [questionId: number]: number };
}

@Component({
  selector: 'app-quiz-results-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="p-4 sm:p-6 bg-white rounded-lg max-w-full sm:max-w-2xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl sm:text-3xl font-bold text-[#70AEB9]">
          Quiz Results
        </h2>
        <button 
          (click)="closeDialog()" 
          class="flex items-center justify-center w-10 h-10 text-gray-500 hover:text-[#70AEB9] hover:bg-gray-100 rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/50" 
          aria-label="Close dialog"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Score Summary -->
      <div class="bg-gradient-to-r from-[#70AEB9]/10 to-[#4ECDC4]/10 p-6 rounded-2xl mb-6 border border-[#70AEB9]/20">
        <div class="flex flex-col sm:flex-row sm:justify-between items-center gap-6">
          <div class="text-center sm:text-left">
            <div class="text-4xl sm:text-5xl font-bold text-[#70AEB9] mb-1">
              {{ data.score }}
            </div>
            <div class="text-sm text-gray-600 font-medium">Points Earned</div>
          </div>
          <div class="text-center">
            <div class="text-3xl sm:text-4xl font-semibold text-gray-700 mb-1">
              {{ data.total_possible }}
            </div>
            <div class="text-sm text-gray-600 font-medium">Total Possible</div>
          </div>
          <div class="text-center sm:text-right">
            <div class="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] bg-clip-text text-transparent mb-1">
              {{ getPercentage() }}%
            </div>
            <div class="text-sm text-gray-600 font-medium">Success Rate</div>
          </div>
        </div>
      </div>

      <!-- Congratulations Message -->
      <div *ngIf="getPercentage() >= 80" class="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div class="font-bold text-green-800 text-lg">Excellent Work!</div>
            <div class="text-sm text-green-700">You scored above 80%. Keep up the great work!</div>
          </div>
        </div>
      </div>

      <div *ngIf="getPercentage() >= 50 && getPercentage() < 80" class="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
          <div>
            <div class="font-bold text-blue-800 text-lg">Good Job!</div>
            <div class="text-sm text-blue-700">You're doing well! Review the questions to improve even more.</div>
          </div>
        </div>
      </div>

      <div *ngIf="getPercentage() < 50" class="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <div class="font-bold text-orange-800 text-lg">Keep Learning!</div>
            <div class="text-sm text-orange-700">Review the correct answers below and try again tomorrow!</div>
          </div>
        </div>
      </div>

      <!-- Question Results -->
      <div class="mb-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5 text-[#70AEB9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Detailed Results
        </h3>
        
        <div class="max-h-[50vh] overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div *ngFor="let response of data.responses; let i = index"
               class="bg-white border-2 rounded-xl p-4 sm:p-5 transition-all duration-200 hover:shadow-md"
               [ngClass]="{
                 'border-green-300 bg-green-50/50': response.is_correct,
                 'border-red-300 bg-red-50/50': !response.is_correct
               }">

            <!-- Question Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                     [ngClass]="{
                       'bg-gradient-to-br from-green-500 to-green-600': response.is_correct,
                       'bg-gradient-to-br from-red-500 to-red-600': !response.is_correct
                     }">
                  {{ i + 1 }}
                </div>
                <span class="font-semibold text-gray-700 text-sm">Question {{ i + 1 }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-bold px-3 py-1 rounded-full"
                      [ngClass]="{
                        'text-green-700 bg-green-100': response.is_correct,
                        'text-red-700 bg-red-100': !response.is_correct
                      }">
                  {{ response.is_correct ? '✓ Correct' : '✗ Incorrect' }}
                </span>
                <span class="text-sm text-gray-600 font-medium">
                  {{ response.points_earned }}/{{ getQuestionPoints(response.question_id) }} pts
                </span>
              </div>
            </div>

            <!-- Question Text -->
            <div class="mb-4 p-3 bg-white rounded-lg border border-gray-200">
              <p class="text-base text-gray-800 font-medium leading-relaxed">
                {{ getQuestionText(response.question_id) }}
              </p>
            </div>

            <!-- Result Details -->
            <div class="space-y-3">
              <!-- Your Answer -->
              <div class="flex items-start gap-2">
                <span class="font-semibold text-gray-700 text-sm min-w-[100px]">Your Answer:</span>
                <span class="px-3 py-1.5 rounded-lg text-sm font-medium flex-1"
                      [ngClass]="{
                        'bg-green-100 text-green-800 border border-green-300': response.is_correct,
                        'bg-red-100 text-red-800 border border-red-300': !response.is_correct
                      }">
                  {{ getSelectedAnswerText(response.question_id) }}
                </span>
              </div>

              <!-- Correct Answer (if wrong) -->
              <div *ngIf="!response.is_correct" class="flex items-start gap-2">
                <span class="font-semibold text-gray-700 text-sm min-w-[100px]">Correct Answer:</span>
                <span class="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-300 flex-1">
                  {{ getCorrectAnswerText(response.question_id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button 
          (click)="closeDialog()"
          class="px-6 py-2.5 font-semibold text-white bg-gradient-to-r from-[#70AEB9] to-[#4ECDC4] rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#70AEB9]/50"
        >
          Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    /* Custom scrollbar styles */
    .scrollbar-thin::-webkit-scrollbar {
      width: 6px;
    }
    .scrollbar-thin::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 10px;
    }
    .scrollbar-thin::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  `]
})
export class QuizResultsDialogComponent {
  Math = Math;

  constructor(
    private readonly dialogRef: MatDialogRef<QuizResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: QuizResultsData
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  getPercentage(): number {
    return this.data.total_possible > 0 
      ? Math.round((this.data.score / this.data.total_possible) * 100) 
      : 0;
  }

  getSelectedAnswerText(questionId: number): string {
    const selectedOptionId = this.data.selectedAnswers[questionId];
    if (selectedOptionId) {
      const question = this.data.questions.find(q => q.id === questionId);
      if (question) {
        const selectedOption = question.options.find(option => option.id === selectedOptionId);
        return selectedOption ? selectedOption.option_text : 'Not answered';
      }
    }
    return 'Not answered';
  }

  getCorrectAnswerText(questionId: number): string {
    const question = this.data.questions.find(q => q.id === questionId);
    if (question) {
      const correctOption = question.options.find(option => option.is_correct);
      return correctOption ? correctOption.option_text : 'Unknown';
    }
    return 'Unknown';
  }

  getQuestionText(questionId: number): string {
    const question = this.data.questions.find(q => q.id === questionId);
    return question ? question.question_text : 'Question not found';
  }

  getQuestionPoints(questionId: number): number {
    const question = this.data.questions.find(q => q.id === questionId);
    return question ? question.points : 0;
  }
}










