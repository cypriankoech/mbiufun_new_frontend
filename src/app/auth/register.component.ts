import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthenticationService } from '../services/authentication.service';
import { CommonService } from '../services/common.service';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { StreakDialogComponent } from '../components/dialogs/streak-dialog.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthLayoutComponent,
    MatDialogModule
  ],
  template: `
    <app-auth-layout>
      <form [formGroup]="registerForm" class="py-8 px-8 flex gap-6 flex-col w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <!-- First Name Field -->
        <div class="w-full flex flex-col gap-2">
          <label for="firstName" class="text-sm font-semibold text-gray-800">First Name</label>
          <input id="firstName" formControlName="firstName" type="text"
            class="w-full h-12 rounded-lg bg-white border-2 text-gray-900 placeholder-gray-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
            [ngClass]="{
              'border-gray-200 hover:border-[#70AEB9]': !registerForm.get('firstName')?.invalid || !registerForm.get('firstName')?.touched,
              'border-red-500 focus:border-red-500 focus:ring-red-500/50': registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched
            }"
            placeholder="Enter your first name" />
          <div *ngIf="registerForm.get('firstName')?.invalid && registerForm.get('firstName')?.touched"
               class="text-red-600 text-sm mt-1 bg-red-50 px-3 py-1 rounded border border-red-200">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            First name is required
          </div>
        </div>

        <!-- Last Name Field -->
        <div class="w-full flex flex-col gap-2">
          <label for="lastName" class="text-sm font-semibold text-gray-800">Last Name</label>
          <input id="lastName" formControlName="lastName" type="text"
            class="w-full h-12 rounded-lg bg-white border-2 text-gray-900 placeholder-gray-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
            [ngClass]="{
              'border-gray-200 hover:border-[#70AEB9]': !registerForm.get('lastName')?.invalid || !registerForm.get('lastName')?.touched,
              'border-red-500 focus:border-red-500 focus:ring-red-500/50': registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched
            }"
            placeholder="Enter your last name" />
          <div *ngIf="registerForm.get('lastName')?.invalid && registerForm.get('lastName')?.touched"
               class="text-red-600 text-sm mt-1 bg-red-50 px-3 py-1 rounded border border-red-200">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            Last name is required
          </div>
        </div>

        <!-- Email Field -->
        <div class="w-full flex flex-col gap-2">
          <label for="email" class="text-sm font-semibold text-gray-800">Email</label>
          <input id="email" formControlName="email" type="email"
            class="w-full h-12 rounded-lg bg-white border-2 text-gray-900 placeholder-gray-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
            [ngClass]="{
              'border-gray-200 hover:border-[#70AEB9]': !registerForm.get('email')?.invalid || !registerForm.get('email')?.touched,
              'border-red-500 focus:border-red-500 focus:ring-red-500/50': registerForm.get('email')?.invalid && registerForm.get('email')?.touched
            }"
            placeholder="Enter your email address" />
          <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
               class="text-red-600 text-sm mt-1 bg-red-50 px-3 py-1 rounded border border-red-200">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            <span *ngIf="registerForm.get('email')?.hasError('required')">Email is required</span>
            <span *ngIf="registerForm.get('email')?.hasError('email')">Please enter a valid email address</span>
          </div>
        </div>

        <!-- Password Field -->
        <div class="w-full flex flex-col gap-2">
          <label for="password" class="text-sm font-semibold text-gray-800">Password</label>
          <div class="relative">
            <input id="password" formControlName="password" [type]="passwordFieldType"
              class="w-full h-12 rounded-lg bg-white border-2 text-gray-900 placeholder-gray-500 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
              [ngClass]="{
                'border-gray-200 hover:border-[#70AEB9]': !registerForm.get('password')?.invalid || !registerForm.get('password')?.touched,
                'border-red-500 focus:border-red-500 focus:ring-red-500/50': registerForm.get('password')?.invalid && registerForm.get('password')?.touched
              }"
              placeholder="Create a strong password" />
            <button type="button" (click)="togglePasswordFieldType()"
              class="absolute inset-y-0 right-3 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-[#70AEB9] hover:bg-gray-50 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="passwordFieldType === 'password'"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path *ngIf="passwordFieldType === 'password'"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                <path *ngIf="passwordFieldType === 'text'"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            </button>
          </div>
          <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
               class="text-red-600 text-sm mt-1 bg-red-50 px-3 py-1 rounded border border-red-200">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            <span *ngIf="registerForm.get('password')?.hasError('required')">Password is required</span>
            <span *ngIf="registerForm.get('password')?.hasError('minlength')">Password must be at least 6 characters</span>
          </div>
        </div>

        <!-- Confirm Password Field -->
        <div class="w-full flex flex-col gap-2">
          <label for="confirmPassword" class="text-sm font-semibold text-gray-800">Confirm Password</label>
          <div class="relative">
            <input id="confirmPassword" formControlName="confirmPassword" [type]="confirmPasswordFieldType"
              class="w-full h-12 rounded-lg bg-white border-2 text-gray-900 placeholder-gray-500 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
              [ngClass]="{
                'border-gray-200 hover:border-[#70AEB9]': !registerForm.get('confirmPassword')?.invalid || !registerForm.get('confirmPassword')?.touched,
                'border-red-500 focus:border-red-500 focus:ring-red-500/50': registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched
              }"
              placeholder="Confirm your password" />
            <button type="button" (click)="toggleConfirmPasswordFieldType()"
              class="absolute inset-y-0 right-3 flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-[#70AEB9] hover:bg-gray-50 transition-all duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path *ngIf="confirmPasswordFieldType === 'password'"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path *ngIf="confirmPasswordFieldType === 'password'"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                <path *ngIf="confirmPasswordFieldType === 'text'"
                      stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
              </svg>
            </button>
          </div>
          <div *ngIf="(registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched) || (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched)"
               class="text-red-600 text-sm mt-1 bg-red-50 px-3 py-1 rounded border border-red-200">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            <span *ngIf="registerForm.get('confirmPassword')?.hasError('required')">Confirm password is required</span>
            <span *ngIf="registerForm.hasError('passwordMismatch')">Passwords do not match</span>
          </div>
        </div>

        <!-- Location Field -->
        <div class="w-full flex flex-col gap-2">
          <label for="location" class="text-sm font-semibold text-gray-800">Location <span class="text-gray-500 font-normal">(Optional)</span></label>
          <input id="location" formControlName="location" type="text"
            class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 hover:border-[#70AEB9] text-gray-900 placeholder-gray-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
            placeholder="Where are you located?" />
        </div>

        <!-- Terms and Conditions -->
        <div class="w-full flex flex-col gap-2">
          <div class="flex items-start gap-3">
            <input id="agreeToTerms" formControlName="agreeToTerms" type="checkbox"
              class="mt-1 w-6 h-6 rounded border-2 border-gray-400 bg-white focus:ring-2 focus:ring-[#70AEB9]/50 focus:outline-none cursor-pointer"
            />
            <label for="agreeToTerms" class="text-sm text-gray-700 leading-relaxed cursor-pointer">
              <span class="flex flex-wrap items-center">
                <span class="font-medium mr-1">I agree</span>
                <span class="mr-1">to the</span>
                <a href="#" class="mx-1 text-[#70AEB9] hover:text-[#5a9aa3] underline font-medium">Terms of Service</a>
                <span class="mx-1">and</span>
                <a href="#" class="mx-1 text-[#70AEB9] hover:text-[#5a9aa3] underline font-medium">Privacy Policy</a>
              </span>
            </label>
          </div>
          <div class="text-xs text-gray-600 ml-8">Required to create an account</div>
          <div *ngIf="registerForm.get('agreeToTerms')?.invalid && registerForm.get('agreeToTerms')?.touched"
               class="text-red-600 text-sm mt-1 bg-red-50 px-3 py-1 rounded border border-red-200">
            <i class="fas fa-exclamation-triangle mr-1"></i>
            You must agree to the terms and conditions to continue
          </div>
        </div>

        <!-- Submit Button -->
        <button type="button" [disabled]="registerForm.invalid || isLoading" (click)="onSubmit()"
          class="w-full h-12 rounded-lg bg-[#70AEB9] hover:bg-[#5a9aa3] text-white font-semibold text-base shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#70AEB9]/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-400 transition-all duration-200 cursor-pointer"
          [ngClass]="{'invalid': registerForm.invalid }">
          <span class="flex items-center justify-center gap-2">
            <span>{{ isLoading ? 'Creating Account...' : 'Sign up' }}</span>
            <svg *ngIf="isLoading" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        </button>
      </form>

      <!-- Loading overlay -->
      <div *ngIf="isLoading" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <span class="text-gray-700 font-medium">Creating account...</span>
        </div>
      </div>
    </app-auth-layout>
  `,
  styles: [`
    .input-enhanced:focus {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
    }

    .input-enhanced.error {
      border-color: rgba(239, 68, 68, 0.5);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }

    @keyframes scale-in {
      0% { transform: scale(0); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .animate-scale-in {
      animation: scale-in 0.3s ease-out;
    }

    @keyframes progress {
      0% { width: 0%; }
      100% { width: 100%; }
    }

    .animate-progress {
      animation: progress 3s ease-in-out infinite;
    }

    /* Password strength colors */
    .text-red-400 { color: #f87171; }
    .text-yellow-400 { color: #facc15; }
    .text-green-400 { color: #4ade80; }
    .text-blue-400 { color: #60a5fa; }

    .bg-red-400 { background-color: #f87171; }
    .bg-yellow-400 { background-color: #facc15; }
    .bg-green-400 { background-color: #4ade80; }
    .bg-blue-400 { background-color: #60a5fa; }

    /* Enhanced focus states */
    input:focus, select:focus {
      outline: none;
    }

    button:focus {
      outline: none;
    }

    /* Custom checkbox styling - high contrast */
    input[type="checkbox"] {
      appearance: none;
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid #cbd5e1; /* slate-300 */
      border-radius: 0.25rem;
      background: #ffffff;
      position: relative;
      cursor: pointer;
      box-shadow: 0 0 0 2px rgba(112, 174, 185, 0.15);
      transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
    }

    input[type="checkbox"]:hover {
      border-color: #70AEB9;
    }

    input[type="checkbox"]:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba(112, 174, 185, 0.35);
    }

    input[type="checkbox"]:checked {
      background: #70AEB9;
      border-color: #70AEB9;
    }

    input[type="checkbox"]:checked::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 0.875rem;
      font-weight: bold;
    }

    /* Mobile optimizations */
    @media (max-width: 640px) {
      .grid-cols-2 {
        grid-template-columns: 1fr;
      }
      
      .btn-enhanced:hover {
        transform: none;
      }
      
      .input-enhanced {
        font-size: 16px; /* Prevent zoom on iOS */
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  passwordFieldType: 'password' | 'text' = 'password';
  confirmPasswordFieldType: 'password' | 'text' = 'password';
  currentStep = 1;
  passwordStrengthPercentage = 0;
  passwordStrengthText = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private commonService: CommonService,
    private dialog: MatDialog
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      location: [''],
      agreeToTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Initialize password strength
    this.updatePasswordStrength();
  }

  // Debug getters
  get formValid(): boolean {
    return this.registerForm.valid;
  }

  get formInvalid(): boolean {
    return this.registerForm.invalid;
  }

  get formErrors(): any {
    return this.registerForm.errors;
  }

  get formValue(): any {
    return this.registerForm.value;
  }

  private getMissingFields(): string[] {
    const missing: string[] = [];

    if (this.registerForm.get('firstName')?.invalid) missing.push('First Name');
    if (this.registerForm.get('lastName')?.invalid) missing.push('Last Name');
    if (this.registerForm.get('email')?.invalid) missing.push('Email');
    if (this.registerForm.get('password')?.invalid) missing.push('Password');
    if (this.registerForm.get('confirmPassword')?.invalid) missing.push('Confirm Password');
    if (this.registerForm.hasError('passwordMismatch')) missing.push('Matching Passwords');
    if (this.registerForm.get('agreeToTerms')?.invalid) missing.push('Terms Agreement');

    return missing;
  }

  /**
   * Parse field-specific errors from backend response
   * Handles errors like: {"email":["user with this email already exists."]}
   * @param errorObject - The error object from backend
   * @returns Array of formatted error messages
   */
  private parseFieldErrors(errorObject: any): string[] {
    const errors: string[] = [];
    const fieldNameMap: { [key: string]: string } = {
      'email': 'Email',
      'password': 'Password',
      'confirm': 'Password confirmation',
      'first_name': 'First name',
      'last_name': 'Last name',
      'location': 'Location',
      'tribe': 'Tribe',
      'username': 'Username'
    };

    // Iterate through each field in the error object
    for (const [field, messages] of Object.entries(errorObject)) {
      const fieldName = fieldNameMap[field] || field;
      
      if (Array.isArray(messages)) {
        // Handle array of error messages for a field
        messages.forEach((msg: string) => {
          errors.push(`${fieldName}: ${msg}`);
        });
      } else if (typeof messages === 'string') {
        // Handle single string error message
        errors.push(`${fieldName}: ${messages}`);
      }
    }

    return errors;
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { 'passwordMismatch': true }
      : null;
  }

  togglePasswordFieldType(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  toggleConfirmPasswordFieldType(): void {
    this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    
    // Add haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }

  updatePasswordStrength(): void {
    const password = this.registerForm.get('password')?.value || '';
    let strength = 0;
    let text = '';

    if (password.length >= 6) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 15;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 10;

    this.passwordStrengthPercentage = Math.min(strength, 100);

    if (strength < 25) text = 'Very Weak';
    else if (strength < 50) text = 'Weak';
    else if (strength < 75) text = 'Good';
    else if (strength < 90) text = 'Strong';
    else text = 'Very Strong';

    this.passwordStrengthText = text;
  }

  getPasswordStrengthColor(): string {
    if (this.passwordStrengthPercentage < 25) return 'text-red-400';
    if (this.passwordStrengthPercentage < 50) return 'text-yellow-400';
    if (this.passwordStrengthPercentage < 75) return 'text-blue-400';
    return 'text-green-400';
  }

  getPasswordStrengthBarClass(): string {
    if (this.passwordStrengthPercentage < 25) return 'bg-red-400';
    if (this.passwordStrengthPercentage < 50) return 'bg-yellow-400';
    if (this.passwordStrengthPercentage < 75) return 'bg-blue-400';
    return 'bg-green-400';
  }

  nextStep(): void {
    if (this.currentStep < 3) {
      this.currentStep++;
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      
      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  }

  isStep1Valid(): boolean {
    const firstName = this.registerForm.get('firstName');
    const lastName = this.registerForm.get('lastName');
    const email = this.registerForm.get('email');
    
    return !!(firstName?.valid && lastName?.valid && email?.valid);
  }

  isStep2Valid(): boolean {
    const password = this.registerForm.get('password');
    const confirmPassword = this.registerForm.get('confirmPassword');
    
    return !!(password?.valid && confirmPassword?.valid && !this.registerForm.hasError('passwordMismatch'));
  }

  isStep3Valid(): boolean {
    const agreeToTerms = this.registerForm.get('agreeToTerms');
    return !!(agreeToTerms?.valid);
  }

  onSubmit(): void {
    console.log('🚀 REGISTER COMPONENT: Sign up button clicked');
    console.log('📝 REGISTER COMPONENT: Form valid:', this.registerForm.valid);
    console.log('📋 REGISTER COMPONENT: Form value:', this.registerForm.value);
    console.log('⚠️ REGISTER COMPONENT: Form errors:', this.registerForm.errors);

    // Log individual field validation status
    console.log('🔍 REGISTER COMPONENT: Field validation status:');
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      console.log(`  - ${key}: valid=${control?.valid}, touched=${control?.touched}, errors=${JSON.stringify(control?.errors)}`);
    });

    if (this.registerForm.valid) {
      console.log('✅ REGISTER COMPONENT: Form is valid, proceeding with registration');
      this.isLoading = true;
      const formData = this.registerForm.value;

      console.log('🗑️ REGISTER COMPONENT: Removing agreeToTerms field from form data');
      // Remove the agreeToTerms field before sending
      delete formData.agreeToTerms;

      console.log('🔄 REGISTER COMPONENT: Transforming form data to API format');
      // Transform form data to match API expectations
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm: formData.confirmPassword,
        location: formData.location || '',
        tribe: 5  // Default to Kurwu tribe (same as old frontend)
      };

      console.log('📤 REGISTER COMPONENT: Final user data to send:', userData);

      // Add haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      console.log('📡 REGISTER COMPONENT: Making API call to registration endpoint');
      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('✅ REGISTER COMPONENT: Registration API success, response:', response);
          this.isLoading = false;

          console.log('🎉 REGISTER COMPONENT: Showing registration success message');
          // Show detailed success message following old frontend pattern
          this.showRegistrationSuccess();

          console.log('⏰ REGISTER COMPONENT: Setting timeout to open streak dialog in 3 seconds');
          // After success overlay, open streak dialog, then navigate to login
          setTimeout(() => {
            console.log('🎯 REGISTER COMPONENT: Timeout expired, opening streak dialog');
            this.openStreakDialog();
          }, 3000);
        },
        error: (error) => {
          console.log('❌ REGISTER COMPONENT: Registration API error:', error);
          console.log('📊 REGISTER COMPONENT: Error status:', error.status);
          console.log('📄 REGISTER COMPONENT: Error body:', error.error);
          console.log('🔗 REGISTER COMPONENT: Error headers:', error.headers);
          console.log('🛤️ REGISTER COMPONENT: Error url:', error.url);
          this.isLoading = false;

          let errorMessage = 'Registration failed. Please try again.';
          
          // Parse error message from various error formats
          if (error.error) {
            // Case 1: Field-specific errors like {"email":["user with this email already exists."]}
            if (typeof error.error === 'object' && !error.error.err && !error.error.error) {
              const fieldErrors = this.parseFieldErrors(error.error);
              if (fieldErrors.length > 0) {
                console.log('🔍 REGISTER COMPONENT: Found field-specific errors:', fieldErrors);
                errorMessage = fieldErrors.join(' ');
              }
            }
            // Case 2: Standard error format with .err field
            else if (error.error?.err) {
              console.log('🔍 REGISTER COMPONENT: Error has .err field:', error.error.err);
              errorMessage = Array.isArray(error.error.err)
                ? error.error.err[0]
                : error.error.err;
            }
            // Case 3: Standard error format with .error field
            else if (error.error?.error) {
              console.log('🔍 REGISTER COMPONENT: Error has .error field:', error.error.error);
              errorMessage = error.error.error;
            }
            // Case 4: Direct string error message
            else if (typeof error.error === 'string') {
              console.log('🔍 REGISTER COMPONENT: Error is a string:', error.error);
              errorMessage = error.error;
            }
          }
          
          // Case 5: Network errors or other HTTP errors
          if (error.status === 0) {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.status === 503) {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          }

          console.log('💬 REGISTER COMPONENT: Final error message:', errorMessage);
          this.showMicroFeedback(errorMessage, 'error');

          // Shake animation for error
          const form = document.querySelector('form');
          if (form) {
            console.log('📳 REGISTER COMPONENT: Adding shake animation to form');
            form.classList.add('animate-shake');
            setTimeout(() => {
              form.classList.remove('animate-shake');
            }, 500);
          }
        }
      });
    } else {
      console.log('❌ REGISTER COMPONENT: Form is invalid, showing validation errors');

      // Mark all fields as touched to show validation errors
      Object.keys(this.registerForm.controls).forEach(key => {
        this.registerForm.get(key)?.markAsTouched();
        console.log(`  - Marked ${key} as touched`);
      });

      // Show user-friendly error message
      const missingFields = this.getMissingFields();
      const errorMessage = `Please complete the following: ${missingFields.join(', ')}`;
      this.commonService.showError(errorMessage);
    }
  }

  private showRegistrationSuccess(): void {
    // Create enhanced success overlay following old frontend pattern
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in';
    
    const successCard = document.createElement('div');
    successCard.className = 'glass rounded-2xl p-8 max-w-md mx-4 text-center border border-green-400/30';
    
    successCard.innerHTML = `
      <div class="mb-6">
        <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
          <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
        <p class="text-white/80 leading-relaxed">
          Your account has been created successfully. 
          <strong>Check your email for the activation link</strong> to complete your registration.
        </p>
      </div>
      <div class="text-white/60 text-sm">
        <p class="mb-2">📧 Activation email sent to your inbox</p>
        <p>Redirecting to login page in 3 seconds...</p>
      </div>
    `;
    
    overlay.appendChild(successCard);
    document.body.appendChild(overlay);
    
    // Remove overlay after timeout
    setTimeout(() => {
      document.body.removeChild(overlay);
    }, 3000);
    
    // Also show toast notification
    this.showMicroFeedback('Registration successful! Check your email for activation link 📧');
  }

  private showMicroFeedback(message: string, type: 'success' | 'error' = 'success'): void {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl text-white font-medium z-50 transition-all duration-300 ${
      type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
    } backdrop-blur-lg border ${
      type === 'success' ? 'border-green-400/30' : 'border-red-400/30'
    } shadow-2xl translate-y-[-100px] opacity-0`;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translate(-50%, 0)';
      toast.style.opacity = '1';
    }, 100);
    
    // Animate out
    setTimeout(() => {
      toast.style.transform = 'translate(-50%, -100px)';
      toast.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  private openStreakDialog(): void {
    console.log('🎯 REGISTER COMPONENT: Opening StreakDialogComponent');
    console.log('⚙️ REGISTER COMPONENT: Dialog configuration:', {
      width: '95vw',
      maxWidth: '95vw',
      minWidth: '95vw',
      maxHeight: '95vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'streak-dialog-panel',
      hasBackdrop: true,
      backdropClass: 'streak-dialog-backdrop',
    });

    const dialogRef = this.dialog.open(StreakDialogComponent, {
      width: 'min(560px, 92vw)',
      maxWidth: '92vw',
      maxHeight: '92vh',
      disableClose: false,
      autoFocus: true,
      panelClass: 'streak-dialog-panel',
      hasBackdrop: true,
      backdropClass: 'streak-dialog-backdrop',
    });

    console.log('📋 REGISTER COMPONENT: Streak dialog opened, subscribing to afterClosed');
    dialogRef.afterClosed().subscribe(() => {
      console.log('🔒 REGISTER COMPONENT: Streak dialog closed, navigating to /login');
      // After streak dialog closes, navigate to login page
      this.router.navigate(['/login']);
    });
  }
}