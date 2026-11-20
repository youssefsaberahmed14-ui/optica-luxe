import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AdminUser;
  };
}

const TOKEN_KEY = 'optica_luxe_admin_token';
const USER_KEY = 'optica_luxe_admin_user';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokenSignal = signal<string | null>(this.loadToken());
  private currentUserSignal = signal<AdminUser | null>(this.loadUser());

  readonly token = this.tokenSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.setSession(res.data.token, res.data.user);
          }
        })
      );
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/admin/login']);
  }

  private setSession(token: string, user: AdminUser): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
  }

  private loadToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  }

  private loadUser(): AdminUser | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const u = localStorage.getItem(USER_KEY);
      if (u) {
        try {
          return JSON.parse(u);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
