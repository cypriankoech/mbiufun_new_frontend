import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DailyDareService, QuizDare, DailyDare } from '@app/services/daily-dare.service';

@Component({
  selector: 'app-daily-dare-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <button class="text-[#0b4d57] hover:underline mb-4" (click)="goBack()">← Back to Dares</button>
        <h1 class="text-2xl font-bold text-[#0b4d57]">{{dare?.title || 'Daily Dare'}}</h1>
        <p class="mt-1 text-[#0b4d57]/70">{{dare?.description}}</p>

        <div *ngIf="isQuiz; else nonQuiz" class="mt-6 space-y-4">
          <div *ngFor="let q of quiz?.questions; let i = index" class="p-4 border rounded-xl">
            <div class="font-semibold text-[#0b4d57]">Q{{i+1}}. {{q.question}}</div>
            <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label *ngFor="let opt of q.options" class="flex items-center gap-2 p-2 rounded border hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="q{{i}}" [value]="opt" (change)="answer(i,opt)">
                <span>{{opt}}</span>
              </label>
            </div>
          </div>

          <div class="pt-2 flex gap-3">
            <button class="px-4 py-2 rounded-lg bg-[#70AEB9] text-white font-semibold" (click)="submit()" [disabled]="submitting">
              {{ submitting ? 'Submitting…' : 'Submit Answers' }}
            </button>
            <div *ngIf="submittedMessage" class="self-center text-sm text-green-600">{{submittedMessage}}</div>
          </div>
        </div>

        <ng-template #nonQuiz>
          <div class="mt-6 p-6 rounded-2xl border bg-[#70AEB9]/5 text-[#0b4d57]">
            This challenge isn’t a quiz. Follow the instructions above to complete it.
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class DailyDareDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dareService = inject(DailyDareService);

  dare?: DailyDare;
  quiz?: QuizDare;
  isQuiz = false;
  loadingQuiz = true;
  answers: Record<number, string> = {};
  submitting = false;
  submittedMessage = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const navState: any = window.history.state || {};
    if (navState && navState.dare) {
      this.dare = navState.dare as DailyDare;
      // proceed to quiz probe below regardless
    }

    // Always re-fetch latest server truth
    this.dareService.fetchById(id).subscribe({
      next: (d) => {
        this.dare = d as DailyDare;
        // continue to quiz probe anyway
      },
      error: () => {
        // continue to quiz probe anyway
      }
    });

    // Probe quiz endpoint to determine quiz nature
    this.dareService.fetchQuizById(id).subscribe({
      next: (q) => { this.quiz = q; this.isQuiz = true; this.loadingQuiz = false; },
      error: () => { this.isQuiz = false; this.loadingQuiz = false; }
    });
  }

  private loadQuiz(id: number) {
    this.loadingQuiz = true;
    this.dareService.fetchQuizById(id).subscribe({ next: (q) => { this.quiz = q; this.isQuiz = true; this.loadingQuiz = false; }, error: () => { this.loadingQuiz = false; } });
  }

  answer(index: number, value: string) {
    this.answers[index] = value;
  }

  submit() {
    if (!this.isQuiz || !this.quiz) return;
    const payload = { answers: this.answers, dare_id: this.quiz.id };
    this.submitting = true;
    this.dareService.submitQuizAnswers(payload).subscribe({
      next: () => { this.submitting = false; this.submittedMessage = 'Answers submitted successfully!'; },
      error: () => { this.submitting = false; this.submittedMessage = 'Submission failed. Try again.'; }
    });
  }

  goBack() { this.router.navigate(['/app/daily-dare']); }
}


