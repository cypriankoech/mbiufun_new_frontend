import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthenticationService } from '../services/authentication.service';
import { CommonService } from '../services/common.service';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { StreakDialogComponent } from '../components/dialogs/streak-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AuthLayoutComponent,
    MatDialogModule
  ],
  template: `
    <app-auth-layout>
      <form [formGroup]="loginForm" class="p-8 flex flex-col gap-6 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
        <div class="w-full flex flex-col gap-2">
          <label for="username" class="text-sm font-semibold text-gray-800">Email/Username</label>
          <input id="username" formControlName="username" type="email"
            class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 hover:border-[#70AEB9] text-gray-900 placeholder-gray-500 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
            placeholder="Enter email address or username" />
        </div>
        <div class="w-full flex flex-col gap-2">
          <label for="password" class="text-sm font-semibold text-gray-800">Password</label>
          <div class="relative">
            <input id="password" formControlName="password" [type]="passwordFieldType"
              class="w-full h-12 rounded-lg bg-white border-2 border-gray-200 hover:border-[#70AEB9] text-gray-900 placeholder-gray-500 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#70AEB9]/50 focus:border-[#70AEB9] transition-all duration-200 text-base"
              placeholder="Enter your password" />
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
            <div class="flex justify-between items-center mt-3">
              <div class="flex gap-3 items-center">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked id="remember"
                         class="w-4 h-4 rounded border-2 border-gray-300 bg-white text-[#70AEB9] focus:ring-2 focus:ring-[#70AEB9]/50 focus:ring-offset-0 transition-all duration-200 checked:bg-[#70AEB9] checked:border-[#70AEB9]">
                  <span class="text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200">Remember me</span>
                </label>
              </div>
              <a routerLink="/forgot-password" class="text-sm text-[#70AEB9] hover:text-[#5a9aa3] hover:underline underline-offset-2 transition-all duration-200 font-medium">Forgot password?</a>
            </div>
          </div>
        </div>

        <button type="button" [disabled]="loginForm.invalid" (click)="onSubmit()"
          class="w-full h-12 rounded-lg bg-[#70AEB9] hover:bg-[#5a9aa3] text-white font-semibold text-base shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-[#70AEB9]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          [ngClass]="{'invalid': loginForm.invalid }">
          <span class="flex items-center justify-center gap-2">
            <span>{{ isLoading ? 'Signing in...' : 'Sign in' }}</span>
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
          <span class="text-gray-700 font-medium">Signing in...</span>
        </div>
      </div>
    </app-auth-layout>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  passwordFieldType: 'password' | 'text' = 'password';
  returnUrl: string = '/app';

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router,
    private commonService: CommonService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/app';
  }

  togglePasswordFieldType(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  onSubmit(): void {
    console.log('🔐 LOGIN COMPONENT: Sign in button clicked');
    console.log('📝 LOGIN COMPONENT: Form valid:', this.loginForm.valid);
    console.log('📋 LOGIN COMPONENT: Form value:', this.loginForm.value);
    console.log('⚠️ LOGIN COMPONENT: Form errors:', this.loginForm.errors);

    if (this.loginForm.valid) {
      console.log('✅ LOGIN COMPONENT: Form is valid, proceeding with login');
      this.isLoading = true;
      const { username, password } = this.loginForm.value;

      console.log('📡 LOGIN COMPONENT: Making API call to login endpoint');
      this.authService.login(username, password).subscribe({
        next: (response) => {
          console.log('✅ LOGIN COMPONENT: Login API success, response:', response);
          this.isLoading = false;
          this.authService.setCurrentUser(response);
          this.commonService.showSuccess('Login successful!');
          console.log('🎯 LOGIN COMPONENT: Opening streak dialog');
          this.openStreakDialog();
        },
        error: (error) => {
          console.log('❌ LOGIN COMPONENT: Login API error:', error);
          console.log('📊 LOGIN COMPONENT: Error status:', error.status);
          console.log('📄 LOGIN COMPONENT: Error body:', error.error);
          this.isLoading = false;

          let errorMessage = 'Login failed. Please check your credentials.';
          
          // Parse error message from various error formats
          if (error.error) {
            // Case 1: Field-specific errors like {"username":["Invalid credentials"]}
            if (typeof error.error === 'object' && !error.error.err && !error.error.error) {
              const fieldErrors = this.parseFieldErrors(error.error);
              if (fieldErrors.length > 0) {
                console.log('🔍 LOGIN COMPONENT: Found field-specific errors:', fieldErrors);
                errorMessage = fieldErrors.join(' ');
              }
            }
            // Case 2: Standard error format with .err field
            else if (error.error?.err) {
              errorMessage = Array.isArray(error.error.err)
                ? error.error.err[0]
                : error.error.err;
            }
            // Case 3: Standard error format with .error field
            else if (error.error?.error) {
              errorMessage = error.error.error;
            }
            // Case 4: Direct string error message
            else if (typeof error.error === 'string') {
              errorMessage = error.error;
            }
            // Case 5: Non-field errors (like "detail" field in DRF)
            else if (error.error?.detail) {
              errorMessage = error.error.detail;
            }
          }
          
          // Case 6: Network errors or other HTTP errors
          if (error.status === 0) {
            errorMessage = 'Network error. Please check your internet connection.';
          } else if (error.status === 401) {
            errorMessage = 'Invalid email/username or password. Please try again.';
          } else if (error.status === 403) {
            errorMessage = 'Account not activated. Please check your email for the activation link.';
          } else if (error.status === 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.status === 503) {
            errorMessage = 'Service temporarily unavailable. Please try again later.';
          }

          console.log('💬 LOGIN COMPONENT: Showing error message:', errorMessage);
          this.commonService.showError(errorMessage);
        }
      });
    } else {
      console.log('❌ LOGIN COMPONENT: Form is invalid, cannot proceed');
    }
  }

  private openStreakDialog(): void {
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

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate([this.returnUrl]);
    });
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  /**
   * Parse field-specific errors from backend response
   * Handles errors like: {"username":["Invalid credentials"]}
   * @param errorObject - The error object from backend
   * @returns Array of formatted error messages
   */
  private parseFieldErrors(errorObject: any): string[] {
    const errors: string[] = [];
    const fieldNameMap: { [key: string]: string } = {
      'username': 'Username/Email',
      'password': 'Password',
      'email': 'Email',
      'non_field_errors': 'Error'
    };

    // Iterate through each field in the error object
    for (const [field, messages] of Object.entries(errorObject)) {
      const fieldName = fieldNameMap[field] || field;
      
      if (Array.isArray(messages)) {
        // Handle array of error messages for a field
        messages.forEach((msg: string) => {
          // For non-field errors, don't prepend field name
          if (field === 'non_field_errors') {
            errors.push(msg);
          } else {
            errors.push(`${fieldName}: ${msg}`);
          }
        });
      } else if (typeof messages === 'string') {
        // Handle single string error message
        if (field === 'non_field_errors') {
          errors.push(messages);
        } else {
          errors.push(`${fieldName}: ${messages}`);
        }
      }
    }

    return errors;
  }
}
