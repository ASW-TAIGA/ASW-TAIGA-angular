import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class SettingsComponent {
  navLinks = [
    { path: 'statuses', label: 'Statuses' },
    { path: 'priorities', label: 'Priorities' },
    { path: 'severities', label: 'Severities' },
    { path: 'issue-types', label: 'Issue Types' },
  ];
}
