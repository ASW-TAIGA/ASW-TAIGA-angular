import { Component, HostListener } from '@angular/core';
import { IssueSidebarComponent } from './issue-sidebar.component';
import { IssuesListComponent } from './issues-list/issues-list.component';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [IssueSidebarComponent, IssuesListComponent],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.css',
})
export class IssuesComponent {}
