import { Component, inject, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { AuthService } from './core/services/auth.service'; // Import AuthService
import { CommonModule } from '@angular/common'; // Import CommonModule for @if

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent], // Added CommonModule
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private authService = inject(AuthService);
  title = 'Taiga Issues';

  isAuthenticated = computed(() => this.authService.isAuthenticated());
}
