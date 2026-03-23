import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { User, UserRegistration } from '@app/models/user';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private readonly http = inject(HttpClient);
  private readonly cookieService = inject(CookieService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();
  
  private readonly cookieName = 'currentUser'; // environment.cookieName;
  
  private readonly headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  constructor() {
    const localStoreTxt = localStorage.getItem(this.cookieName);
    if (localStoreTxt) {
      try {
        const localJSON = JSON.parse(localStoreTxt);
        this.currentUserSubject.next(localJSON);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem(this.cookieName);
      }
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  updateUserName(userName: string): Observable<any> {
    const token = this.getUserToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<any>(
      `${environment.apiUrl}api/v1/user/update-username/`, 
      { username: userName }, 
      { headers }
    );
  }

  getUserProfile(): Observable<any> {
    const token = this.getUserToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<any>(
      `${environment.apiUrl}api/v1/user/profile/`, 
      { headers }
    );
  }

  updateUserProfile(formData: FormData): Observable<any> {
    const token = this.getUserToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<any>(
      `${environment.apiUrl}api/v1/user/profile/`, 
      formData, 
      { headers }
    );
  }

  updateUserVibes(req: { vibe_ids: number[] }): Observable<any> {
    const token = this.getUserToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post<any>(
      `${environment.apiUrl}api/v1/user/vibes/`, 
      req, 
      { headers }
    );
  }

  getUserVibes(): Observable<any> {
    const token = this.getUserToken();
    const headers = new HttpHeaders({
      'mbiu-token': token,
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<any>(
      `${environment.apiUrl}api/v1/user/vibes/`, 
      { headers }
    );
  }

  login(username: string, password: string): Observable<User> {
    this.deleteAllCookies();
    
    return this.http.post<User>(
      `${environment.apiUrl}api/v1/user/login/`, 
      { username, password }, 
      { headers: this.headers }
    ).pipe(
      map(user => {
        localStorage.setItem(this.cookieName, JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      })
    );
  }

  loginWithSocial(username: string, password: string): Observable<any> {
    this.deleteAllCookies();
    
    return this.http.post<any>(
      `${environment.apiUrl}api/v1/user/login/`, 
      { username, password }, 
      { headers: this.headers }
    );
  }

  updateUserData(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.cookieName, JSON.stringify(user));
  }

  setCurrentUser(user: User): void {
    this.updateUserData(user);
  }

  getToken(): string {
    return this.getUserToken();
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null;
  }

  register(user: { first_name: string, last_name: string, email: string, password: string, confirm: string, location: string, tribe: number }): Observable<any> {
    console.log('🔐 AUTH SERVICE: Register method called with user data:', user);
    console.log('📡 AUTH SERVICE: Making POST request to:', `${environment.apiUrl}api/v1/user/register/`);
    console.log('📦 AUTH SERVICE: Request payload:', { user });

    return this.http.post<any>(
      `${environment.apiUrl}api/v1/user/register/`,
      { user }
    ).pipe(
      map(response => {
        console.log('✅ AUTH SERVICE: Register API success, response:', response);
        return response;
      })
    );
  }

  getUserToken(): string {
    const user = this.currentUserValue;
    if (!user) return '';
    
    return user.token?.['access'] ?? user.token ?? '';
  }

  getUserDetailsViaUsername(username: string): Observable<User> {
    return this.http.get<User>(
      `${environment.apiUrl}api/v1/user/users/${username}`,
      { headers: this.headers }
    );
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}api/v1/user/password_reset/`, 
      { email }, 
      { headers: this.headers }
    ).pipe(
      map(response => {
        this.snackBar.open(
          "Password reset link sent successfully. Check your email", 
          "X", 
          {
            horizontalPosition: "center",
            verticalPosition: "top",
            duration: 5000,
          }
        );
        return response;
      })
    );
  }

  resetPassword(email: string, password: string, code: string): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}api/v1/auth/reset/`, 
      { email, password, code }, 
      { headers: this.headers }
    );
  }

  logout(): void {
    localStorage.removeItem(this.cookieName);
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
    this.deleteAllCookies();
    this.router.navigateByUrl('/login');
  }

  getProfilePicture(): string {
    const user = this.currentUserValue;
    if (user?.profile_image) {
      return user.profile_image;
    }
    return `https://picsum.photos/200?rnd=${user?.id || 'default'}`;
  }

  private deleteAllCookies(): void {
    const cookies = document.cookie.split(";");
    
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
}