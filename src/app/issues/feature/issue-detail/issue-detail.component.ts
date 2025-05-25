import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common'; // Import DatePipe
import { Issue } from '../../data-access/issue.service'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, DatePipe], // Añade DatePipe a los imports
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent {
  @Input() issue: Issue | null = null;
}
