import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService, AuthUser } from '../../../core/services/auth.service';
import { UserListItem } from '../../models/user-list-item.model';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-select.component.html',
  styleUrls: ['./user-select.component.css']
})
export class UserSelectComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  users: WritableSignal<UserListItem[]> = signal([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // If already authenticated, redirect away from user select, unless it's an explicit choice page
    if (this.authService.isAuthenticated()) {
      // this.router.navigate(['/issues']); // Or keep them here to switch user
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.error.set(null);
    // The backend URL for listing users is /api/v1/accounts/users/
    // The api.service adds /api/v1, so endpoint is /accounts/users/
    this.apiService.get<UserListItem[]>('/users/') 
      .subscribe({
        next: (data) => {
          console.log(data);
          this.users.set(data);
          console.log("signal set", this.users());
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load users', err);
          this.error.set('Could not load user list. Please try again later.');
          this.isLoading.set(false);
        }
      });
  }

  selectUser(user: UserListItem): void {
    if (user.api_key_object && user.api_key_object.key_display) {
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        apiKey: user.api_key_object.key_display,
        avatarUrl: user.avatar_url
      };
      this.authService.login(authUser);
    } else {
      console.warn(`User ${user.username} does not have an API key to use for login.`);
      this.error.set(`User ${user.username} does not have an API key. Cannot login.`);
      // Optionally, display this error more prominently in the UI
    }
  }
}
