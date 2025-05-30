import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent {
  navItems = [
    { path: 'statuses', label: 'Statuses' },
    { path: 'priorities', label: 'Priorities' },
    { path: 'severities', label: 'Severities' },
    { path: 'types', label: 'Types' }
  ];
}
