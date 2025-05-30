import { Injectable, signal, WritableSignal, computed, EffectRef, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: number;
  username: string;
  apiKey: string;
  avatarUrl?: string | null; 
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser: WritableSignal<AuthUser | null> = signal(null);
  private router = inject(Router);
  private persistenceKey = 'ventuS_authUser';

  // Public signals for components to consume
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly currentUserId = computed(() => this._currentUser()?.id || null);
  readonly currentUsername = computed(() => this._currentUser()?.username || null);
  readonly currentApiKey = computed(() => this._currentUser()?.apiKey || null);
  readonly currentUserAvatar = computed(() => this._currentUser()?.avatarUrl || null);


  constructor() {
    this.loadUserFromStorage();
    // Effect to react to changes in currentUser for persistence or other side effects if needed
    effect(() => {
      const user = this._currentUser();
      if (user) {
        sessionStorage.setItem(this.persistenceKey, JSON.stringify(user));
      } else {
        sessionStorage.removeItem(this.persistenceKey);
      }
    });
  }

  private loadUserFromStorage(): void {
    const storedUser = sessionStorage.getItem(this.persistenceKey);
    if (storedUser) {
      try {
        this._currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing stored user data", e);
        sessionStorage.removeItem(this.persistenceKey);
      }
    }
  }

  login(user: AuthUser): void {
    if (!user.apiKey) {
        console.error('Login attempt without API key for user:', user.username);
        // Optionally, navigate to an error page or show a message
        return;
    }
    this._currentUser.set(user);
    // ApiService will now pick up the key via its own injection of AuthService
    this.router.navigate(['/issues']); // Navigate to a default page after login
  }

  logout(): void {
    this._currentUser.set(null);
    // ApiService will lose its key as it gets it from AuthService
    this.router.navigate(['/users']); // Navigate to user selection/login page
  }
}
