import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthTokenService } from './auth-token.service';
import { environment } from '../../environments/environment';

const baseUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient, private authTokenService: AuthTokenService) {}

  getUserToken(): string {
    return this.authTokenService.getToken();
  }

  get<T = any>(route: string, data?: any): Observable<T> {
    const headers = new HttpHeaders({
      'mbiu-token': this.getUserToken()
    });
    let params = new HttpParams();
    if (data !== undefined) {
      Object.getOwnPropertyNames(data).forEach(key => {
        params = params.set(key, data[key]);
      });
    }

    const call = this.http.get<T>(baseUrl + route, {
      responseType: 'json',
      headers: headers,
      params
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status == 403 || err.status == 401) {
          this.authTokenService.logout();
        }
        return throwError(err);
      })
    );

    return call;
  }

  getRemote(url: string, data?: any) {
    let params = new HttpParams();
    if (data !== undefined) {
      Object.getOwnPropertyNames(data).forEach(key => {
        params = params.set(key, data[key]);
      });
    }

    return this.http.get(baseUrl + url, {
      responseType: 'json',
      params
    });
  }

  post<T = any>(route: string, data?: any): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': this.getUserToken()
    });

    const call = this.http.post<T>(baseUrl + route, data, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 403 || err.status == 401) {
            this.authTokenService.logout();
          }
          return throwError(err);
        })
      );

    return call;
  }

  post_multipart(route: string, data?: any) {
    const headers = new HttpHeaders({
      'mbiu-token': this.getUserToken()
    });

    const call = this.http.post(baseUrl + route, data, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(err);
        })
      );

    return call;
  }

  put<T = any>(route: string, data?: any): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': this.getUserToken()
    });

    const call = this.http.put<T>(baseUrl + route, data, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 403 || err.status == 401) {
            this.authTokenService.logout();
          }
          return throwError(err);
        })
      );

    return call;
  }

  patch<T = any>(route: string, data?: any): Observable<T> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'mbiu-token': this.getUserToken()
    });

    const call = this.http.patch<T>(baseUrl + route, data, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 403 || err.status == 401) {
            this.authTokenService.logout();
          }
          return throwError(err);
        })
      );

    return call;
  }

  delete<T = any>(route: string): Observable<T> {
    const headers = new HttpHeaders({
      'mbiu-token': this.getUserToken()
    });

    const call = this.http.delete<T>(baseUrl + route, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status == 403 || err.status == 401) {
            this.authTokenService.logout();
          }
          return throwError(err);
        })
      );

    return call;
  }
}
