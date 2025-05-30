import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserProfileData, UserListItem, UserSelfProfileUpdatePayload } from '../models/user.model';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private toastrService = inject(ToastrService);

  private apiUrl = 'http://localhost:8000/api/v1'; // Corrected base API URL

  private currentApiKeySubject = new BehaviorSubject<string | null>(null);
  private currentUserProfileSubject = new BehaviorSubject<UserProfileData | null>(null);

  public readonly currentUserProfile$ = this.currentUserProfileSubject.asObservable();
  public readonly currentApiKey$ = this.currentApiKeySubject.asObservable();
  public readonly isAuthenticated$: Observable<boolean> = this.currentApiKey$.pipe(
    map((key: string | null) => !!key)
  );

  /**
   * Fetches a list of users for the initial selection page.
   * The backend is expected to return UserListItem which includes api_key_object.
   */
  getUsersList(): Observable<UserListItem[]> {
    return this.http.get<UserListItem[]>(`${this.apiUrl}/users/`).pipe(
      catchError(error => this.handleError(error, 'Failed to load user list.'))
    );
  }

  /**
   * Sets the selected user, stores their API key, and fetches their full profile.
   * @param userToSet - The UserListItem selected by the frontend user.
   * @returns An Observable emitting the full UserProfileData once fetched.
   */
  setCurrentUser(userToSet: UserListItem): Observable<UserProfileData> {
    if (!userToSet.api_key_object || !userToSet.api_key_object.key_display) {
      const errorMsg = 'Selected user is missing API key information.';
      console.error('AccountService: User selected does not have an API key.', userToSet);
      this.toastrService.error(errorMsg, 'User Selection Error');
      this.clearCurrentUser();
      return throwError(() => new Error(errorMsg));
    }

    const apiKey = userToSet.api_key_object.key_display;
    this.currentApiKeySubject.next(apiKey);

    return this.fetchAndSetMyProfile().pipe(
      tap(fullUserProfile => {
        // console.log(`AccountService: Full profile fetched for ${fullUserProfile.username}`, fullUserProfile);
      }),
      catchError(err => {
        console.error(`AccountService: Failed to fetch profile for ${userToSet.username} after setting API key. Clearing user.`, err);
        this.clearCurrentUser();
        return throwError(() => err);
      })
    );
  }

  /**
   * Fetches the full profile for the "logged-in" user from /profile/me/.
   * The backend response for /profile/me is expected to match UserProfileData structure
   * (i.e., includes email, api_key_object etc.).
   */
  private fetchAndSetMyProfile(): Observable<UserProfileData> {
    const apiKey = this.currentApiKeySubject.getValue();
    if (!apiKey) {
      const errorMsg = 'No API key available to fetch user profile.';
      return throwError(() => new Error(errorMsg));
    }

    const headers = this.createAuthHeaders(apiKey);
    // Expecting the /profile/me/ endpoint to return data that fits UserProfileData
    return this.http.get<UserProfileData>(`${this.apiUrl}/profile/me/`, { headers }).pipe(
      tap(userProfile => {
        this.currentUserProfileSubject.next(userProfile);
      }),
      catchError(error => this.handleError(error, 'Failed to load your profile information.'))
    );
  }

  /**
   * Fetches the public profile for a specific user by their username.
   * The backend response for /profile/:username/ is expected to match UserProfileData structure
   * (fields like email, api_key_object will be undefined or null).
   */
  getUserPublicProfile(username: string): Observable<UserProfileData> {
    const apiKey = this.currentApiKeySubject.getValue();
    if (!apiKey) {
      const errorMsg = 'Cannot fetch public profile, no API key available (user not "logged in").';
      this.toastrService.error('You must be logged in to view user profiles.', 'Authentication Error');
      return throwError(() => new Error(errorMsg));
    }
    const headers = this.createAuthHeaders(apiKey);
    // Expecting the /profile/:username/ endpoint to return data that fits UserProfileData
    return this.http.get<UserProfileData>(`${this.apiUrl}/profile/${username}/`, { headers }).pipe(
      catchError(error => this.handleError(error, `Failed to load profile for ${username}.`))
    );
  }

  /**
   * Synchronously retrieves the currently "logged-in" user's profile data.
   */
  public getCurrentUserProfileSnapshot(): UserProfileData | null {
    return this.currentUserProfileSubject.getValue();
  }

  /**
   * Synchronously retrieves the currently stored API key.
   */
  public getCurrentApiKeySnapshot(): string | null {
    return this.currentApiKeySubject.getValue();
  }

  /**
   * Updates the profile for the currently "logged-in" user.
   * @param payload - The data to update for the user's profile.
   * @returns An Observable emitting the updated UserProfileData.
   */
  updateUserProfile(payload: UserSelfProfileUpdatePayload): Observable<UserProfileData> {
    const apiKey = this.currentApiKeySubject.getValue();
    if (!apiKey) {
      const errorMsg = 'Cannot update profile, no API key available (user not "logged in").';
      this.toastrService.error('You must be logged in to update your profile.', 'Authentication Error');
      return throwError(() => new Error(errorMsg));
    }

    let headers = this.createAuthHeaders(apiKey);
    let body: any = {};

    if (payload.profile && payload.profile.avatar instanceof File) {
      const formData = new FormData();
      if (payload.profile.bio !== undefined) {
        formData.append('profile.bio', payload.profile.bio);
      }
      formData.append('profile.avatar', payload.profile.avatar, payload.profile.avatar.name);
      
      if (payload.email !== undefined) formData.append('email', payload.email);
      if (payload.first_name !== undefined) formData.append('first_name', payload.first_name);
      if (payload.last_name !== undefined) formData.append('last_name', payload.last_name);
      body = formData;
    } else {
      if (payload.email !== undefined) body.email = payload.email;
      if (payload.first_name !== undefined) body.first_name = payload.first_name;
      if (payload.last_name !== undefined) body.last_name = payload.last_name;
      
      const profilePayload: { bio?: string; avatar?: null } = {};
      let hasProfileData = false;
      if (payload.profile) {
        if (payload.profile.bio !== undefined) {
          profilePayload.bio = payload.profile.bio;
          hasProfileData = true;
        }
        if (payload.profile.avatar === null) {
          profilePayload.avatar = null;
          hasProfileData = true;
        }
      }
      if(hasProfileData) {
        body.profile = profilePayload;
      }
    }
    
    return this.http.put<UserProfileData>(`${this.apiUrl}/profile/me/`, body, { headers }).pipe(
      tap(updatedUserProfile => {
        this.currentUserProfileSubject.next(updatedUserProfile);
        this.toastrService.success('Profile updated successfully!', 'Success');
      }),
      catchError(error => this.handleError(error, 'Failed to update your profile.'))
    );
  }

  /**
   * Clears the current user and API key, effectively "logging out".
   */
  logout(): void {
    this.clearCurrentUser();
    console.log('AccountService: User logged out, API key and user data cleared.');
  }

  /**
   * Clears the current user and API key subjects.
   */
  private clearCurrentUser(): void {
    this.currentApiKeySubject.next(null);
    this.currentUserProfileSubject.next(null);
  }

  /**
   * Creates HttpHeaders with the current API key for authorization.
   */
  private createAuthHeaders(apiKey: string): HttpHeaders {
    if (!apiKey) {
      console.error("AccountService: Attempted to create auth headers without an API key.");
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `ApiKey ${apiKey}`);
  }

  /**
   * Handles HTTP errors from API calls and displays a toastr notification.
   */
  private handleError(error: HttpErrorResponse, userFriendlyMessage: string = 'An unexpected error occurred.') {
    let developerErrorMessage = 'API Error: ';
    let displayMessage = userFriendlyMessage;

    if (error.error instanceof ErrorEvent) {
      developerErrorMessage += `Client-side error: ${error.error.message}`;
    } else {
      developerErrorMessage += `Code: ${error.status}, Message: ${error.message}`;
      if (error.error && typeof error.error === 'object') {
        const backendErrorDetail = error.error.detail || error.error.message;
        if (backendErrorDetail && typeof backendErrorDetail === 'string') {
          displayMessage = backendErrorDetail;
        }
        developerErrorMessage += `\nBackend Details: ${JSON.stringify(error.error)}`;
      } else if (typeof error.error === 'string' && error.error.length < 150) {
         displayMessage = error.error;
         developerErrorMessage += `\nBackend Detail: ${error.error}`;
      }
    }
    console.error("AccountService API Error (Detailed):", developerErrorMessage, error);
    this.toastrService.error(displayMessage, 'Operation Failed');
    return throwError(() => new Error(developerErrorMessage));
  }
}
