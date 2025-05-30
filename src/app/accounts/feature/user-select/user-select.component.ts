import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AccountService } from '../../data-access/account.service';
import { UserListItem, UserProfileData } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-select.component.html',
  // styleUrls: ['./user-select.component.css'] // Add if specific styles are needed
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSelectComponent implements OnInit {
  private accountService = inject(AccountService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);

  users$!: Observable<UserListItem[]>;
  isLoading = true;
  isSelectingUser: { [key: number]: boolean } = {};
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.isLoading = true;
    this.cdr.markForCheck();
    this.users$ = this.accountService.getUsersList().pipe(
      tap(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),
      catchError(err => {
        this.isLoading = false;
        this.errorMessage = 'Could not load users. Please try again later.';
        // Toastr error is handled by the service
        this.cdr.markForCheck();
        return of([]);
      })
    );
  }

  selectUser(user: UserListItem): void {
    if (!user || user.id === undefined) {
      this.toastr.error('Invalid user data.', 'Selection Error');
      return;
    }
    if (!user.api_key_object || !user.api_key_object.key_display) {
        this.toastr.error('Selected user is missing API key information and cannot be logged in.', 'API Key Missing');
        this.isSelectingUser[user.id] = false; // Ensure button is re-enabled
        this.cdr.markForCheck();
        return;
    }

    this.isSelectingUser[user.id] = true;
    this.errorMessage = null;
    this.cdr.markForCheck();

    // The AccountService's setCurrentUser method already handles fetching the profile.
    // We just subscribe to know when it's done or if an error occurred.
    this.accountService.setCurrentUser(user).pipe(
      finalize(() => {
        this.isSelectingUser[user.id] = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (loggedInUserProfile: UserProfileData | null) => {
        if (loggedInUserProfile) {
          // Navigate to the issues page upon successful "login" (API key set and profile fetched)
          this.router.navigate(['/issues']);
        } else {
          // This case should ideally be handled by setCurrentUser's error path,
          // but as a fallback:
          this.toastr.error(`Could not complete login for ${user.username}. Profile data missing.`, "Login Failed");
        }
      },
      error: (err) => {
        // Error is already handled by the AccountService (toastr)
        // No need to set errorMessage here as service does it.
        // isSelectingUser is reset in finalize.
      }
    });
  }

  getUserInitials(firstName?: string | null, lastName?: string | null): string {
    let initials = '';
    if (firstName && firstName.length > 0) {
      initials += firstName[0].toUpperCase();
    }
    if (lastName && lastName.length > 0) {
      initials += lastName[0].toUpperCase();
    }
    return initials || '?';
  }
}
