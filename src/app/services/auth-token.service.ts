import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private cookieService: CookieService) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get currentUserObservable(): Observable<User | null> {
    return this.currentUser;
  }

  public getToken(): string {
    const user = this.currentUserValue;
    return user?.token?.['access'] || '';
  }

  public setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.cookieService.set('currentUser', JSON.stringify(user), 7); // 7 days
    } else {
      localStorage.removeItem('currentUser');
      this.cookieService.delete('currentUser');
    }
    this.currentUserSubject.next(user);
  }

  public logout(): void {
    this.setCurrentUser(null);
  }
}








