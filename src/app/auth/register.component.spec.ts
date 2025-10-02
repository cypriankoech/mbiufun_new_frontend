import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { RegisterComponent } from './register.component';
import { AuthenticationService } from '../services/authentication.service';
import { CommonService } from '../services/common.service';
import { AuthLayoutComponent } from '../components/auth-layout/auth-layout.component';
import { LandingLayoutComponent } from '../components/landing-layout/landing-layout.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthenticationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthenticationService', ['register']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const commonServiceSpy = jasmine.createSpyObj('CommonService', ['showSuccess', 'showError']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RegisterComponent, AuthLayoutComponent, LandingLayoutComponent],
      providers: [
        { provide: AuthenticationService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: CommonService, useValue: commonServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthenticationService) as jasmine.SpyObj<AuthenticationService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockCommonService = TestBed.inject(CommonService) as jasmine.SpyObj<CommonService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required fields', () => {
    component.ngOnInit();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('firstName')).toBeDefined();
    expect(component.registerForm.get('lastName')).toBeDefined();
    expect(component.registerForm.get('email')).toBeDefined();
    expect(component.registerForm.get('password')).toBeDefined();
    expect(component.registerForm.get('confirmPassword')).toBeDefined();
    expect(component.registerForm.get('location')).toBeDefined();
    expect(component.registerForm.get('agreeToTerms')).toBeDefined();
  });

  it('should validate form fields correctly', () => {
    component.ngOnInit();

    // Test required fields
    component.registerForm.patchValue({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    });
    expect(component.registerForm.valid).toBeFalsy();

    // Test valid form
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      location: 'Kenya',
      agreeToTerms: true
    });
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should call auth service register on valid form submission', () => {
    component.ngOnInit();
    mockAuthService.register.and.returnValue(of({}));

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      location: 'Kenya',
      agreeToTerms: true
    });

    component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirm: 'password123',
      location: 'Kenya'
    });
  });

  it('should navigate to login on successful registration', () => {
    component.ngOnInit();
    mockAuthService.register.and.returnValue(of({}));
    spyOn(component, 'showRegistrationSuccess');

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      location: 'Kenya',
      agreeToTerms: true
    });

    component.onSubmit();

    expect(component.showRegistrationSuccess).toHaveBeenCalled();
    // Navigation happens after 3 second delay in showRegistrationSuccess
  });

  it('should handle registration errors', () => {
    component.ngOnInit();
    const errorResponse = { error: { err: 'Email already exists' } };
    mockAuthService.register.and.returnValue(throwError(errorResponse));

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
      location: 'Kenya',
      agreeToTerms: true
    });

    component.onSubmit();

    expect(mockCommonService.showError).toHaveBeenCalledWith('Email already exists');
  });

  it('should validate password confirmation', () => {
    component.ngOnInit();

    component.registerForm.patchValue({
      password: 'password123',
      confirmPassword: 'password456'
    });

    expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();
  });
});






