import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService as Auth0Service } from '@auth0/auth0-angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user';
import { tap } from 'rxjs/operators';

export interface UserWithPermissions extends Omit<User, 'role'> {
  permissions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserWithPermissions | null>(null);
  public currentUser: Observable<UserWithPermissions | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth0: Auth0Service,
    private router: Router
  ) {
    this.auth0.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.auth0.user$.subscribe(user => {
          // console.log('Raw Auth0 user:', user);
          
          // Haal de access token op om permissions te krijgen
          this.auth0.getAccessTokenSilently().subscribe(token => {
            const decodedToken = this.decodeToken(token);
            // console.log('Decoded token:', decodedToken);
            // console.log('Raw token:', token);
            
            if (user) {
              const mappedUser: UserWithPermissions = {
                id: user.sub || '',
                username: user.nickname || user.name || user.email || '',
                email: user.email || '',
                permissions: decodedToken?.permissions || []
              };
              // console.log('Mapped user:', mappedUser);
              this.currentUserSubject.next(mappedUser);
            }
          });
        });
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  login(): void {
    this.auth0.loginWithRedirect();
  }

  logout(): void {
    this.auth0.logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.auth0.isAuthenticated$;
  }  

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions.includes('manage:all') || false;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.permissions.includes(permission) || false;
  }

  get currentUserValue(): UserWithPermissions | null {
    return this.currentUserSubject.value;
  }

  get auth0Service(): Auth0Service {
    return this.auth0;
  }
}