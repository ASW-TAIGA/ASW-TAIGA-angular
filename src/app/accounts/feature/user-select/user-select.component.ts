import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { AccountService } from '../../data-access/account.service';
import { UserListItem } from '../../models/user.model';

@Component({
  selector: 'app-user-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-select.component.html',
  // styleUrls: ['./user-select.component.css'] // Add if specific styles are needed
})
export class UserSelectComponent implements OnInit {
  private accountService = inject(AccountService);
  private router = inject(Router);

  /**
   * Observable of the list of users available for selection.
   */
  users$!: Observable<UserListItem[]>;

  /**
   * Flag to indicate if the user list is currently being loaded.
   */
  isLoading = true;

  /**
   * Flag to indicate if a user selection is in progress.
   */
  isSelectingUser: { [key: number]: boolean } = {};


  /**
   * Stores any error message that occurs while fetching the user list.
   */
  errorMessage: string | null = null;

  /**
   * Initializes the component by fetching the list of users.
   */
  ngOnInit(): void {
    this.users$ = this.accountService.getUsersList().pipe(
      tap(() => {
        this.isLoading = false;
      }),
      catchError(err => {
        this.isLoading = false;
        // The service already shows a toastr, here we can set a local message if needed for the UI
        this.errorMessage = 'Could not load users. Please try again later.';
        console.error('UserSelectComponent: Error fetching user list', err);
        return of([]); // Return empty array on error to prevent breaking the async pipe
      })
    );
  }

  /**
   * Handles the selection of a user.
   * Sets the selected user in the AccountService and navigates to their profile page.
   * @param user The UserListItem that was selected.
   */
  selectUser(user: UserListItem): void {
    if (!user || user.id === undefined) {
      console.error('UserSelectComponent: Invalid user selected.');
      return;
    }
    this.isSelectingUser[user.id] = true;
    this.errorMessage = null; // Clear previous errors

    this.accountService.setCurrentUser(user).pipe(
      finalize(() => {
        this.isSelectingUser[user.id] = false;
      })
    ).subscribe({
      next: (loggedInUser) => {
        // Navigate to the 'my profile' page.
        // Assuming a route like '/accounts/profile/me' is set up for the current user's profile.
        this.router.navigate(['/accounts/profile/me']);
      },
      error: (err) => {
        // Error is already handled by the AccountService (toastr)
        // We've already reset isSelectingUser in finalize
        console.error(`UserSelectComponent: Failed to set user ${user.username}`, err);
        // Optionally set a component-specific error message if needed
        // this.errorMessage = `Could not log in as ${user.username}.`;
      }
    });
  }

  /**
   * Generates initials from a user's first and last names.
   * @param firstName The user's first name.
   * @param lastName The user's last name.
   * @returns A string containing the initials, or an empty string if names are not provided.
   */
  getUserInitials(firstName?: string | null, lastName?: string | null): string {
    let initials = '';
    if (firstName && firstName.length > 0) {
      initials += firstName[0].toUpperCase();
    }
    if (lastName && lastName.length > 0) {
      initials += lastName[0].toUpperCase();
    }
    return initials || '?'; // Fallback if no name parts are available
  }
}
