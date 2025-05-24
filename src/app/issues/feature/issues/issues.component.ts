import {Component, HostListener} from '@angular/core';
import { IssueSidebarComponent } from './issue-sidebar.component';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [IssueSidebarComponent],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.css'
})
export class IssuesComponent {

}
