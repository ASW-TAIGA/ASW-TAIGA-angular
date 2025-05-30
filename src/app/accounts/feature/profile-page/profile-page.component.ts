import { Component, OnInit, inject, signal, WritableSignal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../data-access/account.service';
import { UserProfileData, UserSelfProfileUpdatePayload } from '../../models/user.model';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

type ActiveTab = 'assigned' | 'watched' | 'comments';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css'], // We'll create this for specific styles
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private toastrService = inject(ToastrService);

  public profileData: WritableSignal<UserProfileData | null> = signal(null);
  public isLoading: WritableSignal<boolean> = signal(true);
  public isMyProfile: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string | null> = signal(null);

  public isEditingBio: WritableSignal<boolean> = signal(false);
  public editableBio: WritableSignal<string> = signal('');
  
  public selectedAvatarFile: WritableSignal<File | null> = signal(null);
  public avatarPreviewUrl: WritableSignal<string | ArrayBuffer | null> = signal(null);
  
  private routeSubscription: Subscription | undefined;
  private currentUserProfileSubscription: Subscription | undefined;

  public activeTab: WritableSignal<ActiveTab> = signal('assigned');

  // Placeholder data for stats - these would come from other services in a real app
  public openAssignedIssuesCount: WritableSignal<number> = signal(0);
  public watchedIssuesCount: WritableSignal<number> = signal(0);
  public commentsCount: WritableSignal<number> = signal(0);


  constructor() {
    effect(() => {
      const currentProfile = this.profileData();
      if (currentProfile) {
        if (!this.isEditingBio()) {
          this.editableBio.set(currentProfile.profile?.bio || '');
        }
        // Placeholder: Update stats if they were part of profileData
        // For now, they are separate signals with mock values.
      }
    });
  }

  /**
   * Component initialization logic.
   */
  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const username = params.get('username');
      if (this.router.url.endsWith('/profile/me')) {
        this.isMyProfile.set(true);
        this.loadMyProfile();
      } else if (username) {
        this.isMyProfile.set(false);
        this.loadUserPublicProfile(username);
      } else {
        this.isLoading.set(false);
        this.errorMessage.set('Invalid profile URL.');
        this.toastrService.error('The profile URL is invalid.', 'Routing Error');
        this.router.navigate(['/accounts/select-user']);
      }
    });
  }

  /**
   * Loads the profile data for the currently "logged-in" user.
   */
  private loadMyProfile(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    if (this.currentUserProfileSubscription) {
        this.currentUserProfileSubscription.unsubscribe();
    }
    this.currentUserProfileSubscription = this.accountService.currentUserProfile$.subscribe({
      next: (userProfile) => {
        if (userProfile) {
          this.profileData.set(userProfile);
          this.avatarPreviewUrl.set(userProfile.profile?.avatar_url || null);
          this.editableBio.set(userProfile.profile?.bio || ''); // Initialize editableBio
          this.isLoading.set(false);
          // Mock stats for "my profile"
          this.openAssignedIssuesCount.set(5); // Example
          this.watchedIssuesCount.set(12);   // Example
          this.commentsCount.set(37);        // Example
        } else {
          const apiKey = this.accountService.getCurrentApiKeySnapshot();
          if (!apiKey) {
            this.toastrService.info('Please select a user to view your profile.', 'Not Logged In');
            this.router.navigate(['/accounts/select-user']);
            this.isLoading.set(false);
          }
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Could not load your profile.');
        console.error('ProfilePageComponent: Error loading my profile from service subscription', err);
      }
    });
  }

  /**
   * Loads the public profile data for a given username.
   */
  private loadUserPublicProfile(username: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.accountService.getUserPublicProfile(username)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (publicProfile) => {
          this.profileData.set(publicProfile);
          this.avatarPreviewUrl.set(publicProfile.profile?.avatar_url || null);
           // Mock stats for public profile
          this.openAssignedIssuesCount.set(3); // Example
          this.watchedIssuesCount.set(8);    // Example
          this.commentsCount.set(21);         // Example
        },
        error: (err) => {
          this.errorMessage.set(`Could not load profile for ${username}.`);
          console.error(`ProfilePageComponent: Error loading public profile for ${username}`, err);
        }
      });
  }

  /**
   * Handles the selection of an avatar file.
   */
  public onAvatarSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList[0]) {
      const file = fileList[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.toastrService.error('Avatar image must be smaller than 5MB.', 'File Too Large');
        this.selectedAvatarFile.set(null);
        this.avatarPreviewUrl.set(this.profileData()?.profile?.avatar_url || null);
        element.value = '';
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        this.toastrService.error('Please select a valid image file (JPG, PNG, GIF).', 'Invalid File Type');
        this.selectedAvatarFile.set(null);
        this.avatarPreviewUrl.set(this.profileData()?.profile?.avatar_url || null);
        element.value = '';
        return;
      }
      this.selectedAvatarFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => this.avatarPreviewUrl.set(e.target?.result || null);
      reader.readAsDataURL(file);
      // Automatically trigger save when a new avatar is selected and valid
      this.saveAvatarChange();
    }
  }

  /**
   * Saves only the avatar change.
   */
  private saveAvatarChange(): void {
    if (!this.isMyProfile() || !this.selectedAvatarFile()) return;

    this.isLoading.set(true);
    const payload: UserSelfProfileUpdatePayload = {
      profile: {
        avatar: this.selectedAvatarFile()
      }
    };

    this.accountService.updateUserProfile(payload)
      .pipe(finalize(() => {
        this.isLoading.set(false);
      }))
      .subscribe({
        next: (updatedUser) => {
          this.selectedAvatarFile.set(null); // Clear selected file after successful upload
          // profileData will be updated via the currentUserProfile$ subscription
          this.toastrService.success('Avatar updated successfully!', 'Profile Updated');
        },
        error: (err) => {
          // Revert preview to original if save fails
          this.avatarPreviewUrl.set(this.profileData()?.profile?.avatar_url || null);
          this.selectedAvatarFile.set(null);
          // Toastr error is handled by the service
          console.error('ProfilePageComponent: Error saving avatar', err);
        }
      });
  }
  
  /**
   * Toggles the edit state for the user's bio.
   */
  public toggleEditBio(): void {
    this.isEditingBio.update(editing => !editing);
    if (this.isEditingBio()) { // When starting edit
       this.editableBio.set(this.profileData()?.profile?.bio || '');
    }
    // If cancelling, the saveBio method will handle reset or save
  }

  /**
   * Saves the bio if it has changed.
   */
  public saveBio(): void {
    const currentProfile = this.profileData();
    if (!this.isMyProfile() || !currentProfile || this.editableBio() === (currentProfile.profile?.bio || '')) {
      this.isEditingBio.set(false); // No changes, just close editor
      if (this.editableBio() === (currentProfile?.profile?.bio || '')) {
        // No toast if no changes were actually made
      } else {
        this.toastrService.info('No changes to bio.', 'Profile Update');
      }
      return;
    }

    this.isLoading.set(true);
    const payload: UserSelfProfileUpdatePayload = {
      profile: {
        bio: this.editableBio()
      }
    };

    this.accountService.updateUserProfile(payload)
      .pipe(finalize(() => {
        this.isLoading.set(false);
        this.isEditingBio.set(false);
      }))
      .subscribe({
        next: (updatedUser) => {
          // profileData will be updated via the currentUserProfile$ subscription
          // Toastr success is handled by the service
        },
        error: (err) => {
          // Revert editableBio if save fails
          this.editableBio.set(currentProfile.profile?.bio || '');
          console.error('ProfilePageComponent: Error saving bio', err);
        }
      });
  }

  /**
   * Logs out the current user and navigates to the user selection page.
   */
  public logout(): void {
    this.accountService.logout();
    this.router.navigate(['/accounts/select-user']);
    this.toastrService.info('You have been logged out.', 'Logged Out');
  }
  
  /**
   * Generates initials from a user's first and last names.
   */
  public getUserInitials(firstName?: string | null, lastName?: string | null): string {
    let initials = '';
    if (firstName && firstName.length > 0) {
      initials += firstName[0].toUpperCase();
    }
    if (lastName && lastName.length > 0) {
      initials += lastName[0].toUpperCase();
    }
    return initials || (this.profileData()?.username?.[0]?.toUpperCase() || '?') ;
  }

  /**
   * Sets the active tab for the right column content.
   */
  public setActiveTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  /**
   * Cleans up subscriptions when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.currentUserProfileSubscription) {
      this.currentUserProfileSubscription.unsubscribe();
    }
  }
}
