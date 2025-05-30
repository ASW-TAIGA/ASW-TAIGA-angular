import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service'; // Import AuthService
import { UserProfileApiResponse, DetailedUserForView, UserProfileUpdatePayload } from '../../models/detailed-user.model';
import { Issue, Comment as IssueComment } from '../../../issues-v2/models';
import { HttpParams } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, tap, map } from 'rxjs/operators';

type SortableIssueKeys = 'id' | 'title' | 'priority' | 'status' | 'updated_at' | 'issue_type' | 'severity';
type TabType = 'assigned' | 'watched' | 'comments';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService); // Inject AuthService

  profileData: WritableSignal<UserProfileApiResponse | null> = signal(null);
  isLoadingPage = signal(true);
  pageError = signal<string | null>(null);
  
  userForView = computed<DetailedUserForView | null>(() => {
    const pd = this.profileData();
    if (!pd) return null;
    return {
      id: pd.id,
      username: pd.username,
      first_name: pd.first_name,
      last_name: pd.last_name,
      email: pd.email,
      profile: pd.profile,
      stats: pd.stats
    };
  });
  tabContent = computed<Issue[] | IssueComment[]>(() => this.profileData()?.tab_content || []);
  activeTabSignal = computed<TabType>(() => this.profileData()?.active_tab || 'assigned'); // Renamed to avoid conflict
  listTitle = computed<string>(() => this.profileData()?.list_title || 'Content');
  currentSortField = computed(() => this.profileData()?.current_sort_field || null);
  currentSortDirection = computed(() => this.profileData()?.current_sort_direction || null);

  // Get logged-in user's username from AuthService
  loggedInUsername = computed(() => this.authService.currentUsername());

  isOwnProfile = signal(false);
  viewedUsernameFromRoute: string | null = null;

  editProfileForm!: FormGroup;
  selectedAvatarFile: File | null = null;
  isUpdatingProfile = signal(false);
  avatarPreviewUrl: string | ArrayBuffer | null = null;
  showEditModal = signal(false);


  constructor() {
    this.editProfileForm = this.fb.group({
      bio: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.isLoadingPage.set(true);
        this.pageError.set(null);
        this.profileData.set(null);
        
        const isMeRoute = this.route.snapshot.data['ownProfile'] === true || this.router.url.endsWith('/profile/me');
        const usernameFromParam = params.get('username');

        if (isMeRoute) {
          this.viewedUsernameFromRoute = this.loggedInUsername(); 
          this.isOwnProfile.set(true);
        } else if (usernameFromParam) {
          this.viewedUsernameFromRoute = usernameFromParam;
          this.isOwnProfile.set(this.loggedInUsername() === usernameFromParam);
        } else {
          this.pageError.set("User identifier not found in route.");
          this.isLoadingPage.set(false);
          return of(null);
        }
        
        if (!this.viewedUsernameFromRoute) {
             this.pageError.set("Cannot determine user profile to load.");
             this.isLoadingPage.set(false);
             return of(null);
        }
        return this.loadProfileData(this.viewedUsernameFromRoute, 'assigned'); // Default tab
      })
    ).subscribe();
  }

  loadProfileData(username: string, tab: TabType, sortBy?: string): Observable<UserProfileApiResponse | null> {
    this.isLoadingPage.set(true); // Ensure loading is true at start of any load
    // this.pageError.set(null); // Clear previous errors for this specific load attempt

    let params = new HttpParams().set('tab', tab);
    if (sortBy) {
      params = params.set('sort_by', sortBy);
    }
    const endpoint = `/profile/${username}/`;

    return this.apiService.get<UserProfileApiResponse>(endpoint, params).pipe(
      tap(data => {
        this.profileData.set(data);
        if (this.isOwnProfile() && data) {
            this.editProfileForm.patchValue({ bio: data.profile?.bio || '' });
        }
        this.isLoadingPage.set(false);
      }),
      catchError(err => {
        console.error(`Failed to load profile for ${username}, tab: ${tab}`, err);
        this.pageError.set(`Could not load profile data for ${username}.`);
        // this.profileData.set(null); // Keep existing data on partial load failure or clear? For now, clear.
        this.isLoadingPage.set(false);
        return of(null);
      })
    );
  }

  selectTab(tabName: TabType): void {
    if (this.viewedUsernameFromRoute && this.activeTabSignal() !== tabName) { // Only load if tab changed
      this.loadProfileData(this.viewedUsernameFromRoute, tabName, this.currentSortField() ?? undefined).subscribe();
    }
  }

  applySort(key: SortableIssueKeys) {
    if (!this.viewedUsernameFromRoute) return;

    const currentSortAPI = this.currentSortField();
    const currentDirAPI = this.currentSortDirection();
    let newSortParam = key.toString();

    if (currentSortAPI === key) { // If current sort field is the same, toggle direction
      newSortParam = (currentDirAPI === 'asc' ? '-' : '') + key;
    } // Else, new field, backend defaults to ascending, or we specify `key` for asc.
      // The API doc says default sort is -updated_at. If we click a new field, it should sort asc.
      // So if currentSortAPI !== key, newSortParam = key (for asc) is fine.
      // If backend defaults to desc for some fields, this might need adjustment or rely on backend default.

    this.loadProfileData(this.viewedUsernameFromRoute, this.activeTabSignal(), newSortParam).subscribe();
  }

  openEditModal(): void {
    const user = this.userForView();
    if (user && this.isOwnProfile()) {
        this.editProfileForm.patchValue({ bio: user.profile?.bio || '' });
        this.selectedAvatarFile = null;
        this.avatarPreviewUrl = user.profile?.avatar_url || null;
        this.showEditModal.set(true);
    }
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedAvatarFile = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.avatarPreviewUrl = reader.result;
      reader.readAsDataURL(this.selectedAvatarFile);
    } else {
        this.selectedAvatarFile = null;
        this.avatarPreviewUrl = this.userForView()?.profile?.avatar_url || null; 
    }
  }

  saveProfileChanges(): void {
    if (!this.isOwnProfile() || !this.userForView()) return;
    if (this.editProfileForm.invalid) return;

    this.isUpdatingProfile.set(true);
    
    const profileUpdatePayload: UserProfileUpdatePayload['profile'] = {
      bio: this.editProfileForm.value.bio
    };
    const textDataPayload: UserProfileUpdatePayload = { profile: profileUpdatePayload };

    this.apiService.patch<UserProfileApiResponse>('/profile/me/', textDataPayload) // Expect full profile response
      .pipe(
        switchMap((updatedUserFromText) => {
          // Update local state immediately after text update
          this.profileData.set(updatedUserFromText);

          if (this.selectedAvatarFile) {
            const avatarFormData = new FormData();
            avatarFormData.append('profile.avatar', this.selectedAvatarFile, this.selectedAvatarFile.name);
            return this.apiService.patchMultipart<UserProfileApiResponse>('/profile/me/', avatarFormData);
          }
          return of(updatedUserFromText); 
        }),
        catchError(err => {
          console.error('Failed to update profile', err);
          alert('Error updating profile. Please check console for details.');
          this.isUpdatingProfile.set(false);
          return of(null); 
        })
      )
      .subscribe(finalUpdatedUser => {
        if (finalUpdatedUser) {
           this.profileData.set(finalUpdatedUser);
        }
        this.isUpdatingProfile.set(false);
        this.closeEditModal();
        this.selectedAvatarFile = null; 
      });
  }
  
  getTextColor(backgroundColor: string | undefined | null): string {
    if (!backgroundColor) return '#000000'; 
    try {
      const hex = backgroundColor.replace('#', '');
      if (hex.length !== 3 && hex.length !== 6) return '#000000';
      const r = parseInt(hex.length === 3 ? hex.substring(0,1).repeat(2) : hex.substring(0, 2), 16);
      const g = parseInt(hex.length === 3 ? hex.substring(1,2).repeat(2) : hex.substring(2, 4), 16);
      const b = parseInt(hex.length === 3 ? hex.substring(2,3).repeat(2) : hex.substring(4, 6), 16);
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luma > 128 ? '#000000' : '#FFFFFF'; 
    } catch (e) { return '#000000'; }
  }

  asIssues(content: Issue[] | IssueComment[] | undefined): Issue[] {
    if (!content) return [];
    // Simple check, assumes if first item has 'title' it's Issue[], otherwise Comment[]
    // This is a bit naive; a more robust check or typed backend response for tab_content would be better.
    return content.length > 0 && 'title' in content[0] ? content as Issue[] : [];
  }
  asComments(content: Issue[] | IssueComment[] | undefined): IssueComment[] {
     if (!content) return [];
    return content.length > 0 && 'text' in content[0] ? content as IssueComment[] : [];
  }
}
