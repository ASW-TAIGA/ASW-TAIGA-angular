import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service'; // Import AuthService

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  userName = computed(() => this.authService.currentUsername() || 'User');
  // For the "My Profile" link, we'll navigate to /profile/me which the profile page handles
  // currentUserId = computed(() => this.authService.currentUserId()); 

  logout(): void {
    this.authService.logout();
    // Navigation to /users is handled by AuthService.logout()
  }
}
