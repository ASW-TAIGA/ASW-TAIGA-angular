import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { BulkCreateIssuePayloadItem, Issue } from '../../models';

@Component({
  selector: 'app-issue-bulk-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './issue-bulk-create.component.html',
  styleUrls: ['./issue-bulk-create.component.css']
})
export class IssueBulkCreateComponent {
  private apiService = inject(ApiService);
  private router = inject(Router);

  issueTitlesInput = signal('');
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  submitBulkIssues(): void {
    if (!this.issueTitlesInput().trim()) {
      this.error.set('Please enter at least one issue title.');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const titles = this.issueTitlesInput().trim().split('\n').filter(title => title.trim() !== '');
    const payload: BulkCreateIssuePayloadItem[] = titles.map(title => ({ title: title.trim() }));

    if (payload.length === 0) {
      this.error.set('No valid issue titles provided.');
      this.isSubmitting.set(false);
      return;
    }

    this.apiService.post<Issue[]>('/issues/bulk_create/', payload)
      .subscribe({
        next: (createdIssues) => {
          this.isSubmitting.set(false);
          this.successMessage.set(`${createdIssues.length} issue(s) created successfully!`);
          this.issueTitlesInput.set('');
          // Optionally navigate away or provide links to created issues
          // For now, just show success and clear form.
        },
        error: (err) => {
          console.error('Failed to bulk create issues', err);
          this.error.set(err.error?.detail || 'An error occurred during bulk creation. Please check your input or try again.');
          this.isSubmitting.set(false);
        }
      });
  }
}
