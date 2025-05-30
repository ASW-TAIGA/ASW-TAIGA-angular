import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Issue, Comment as IssueComment, Attachment } from '../../models';
import { CreateCommentPayload } from '../../models/comment.model';
import { FormsModule } from '@angular/forms'; // For new comment form

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);

  issue: WritableSignal<Issue | null> = signal(null);
  comments: WritableSignal<IssueComment[]> = signal([]);
  attachments: WritableSignal<Attachment[]> = signal([]);
  
  isLoading = signal(true);
  error = signal<string | null>(null);

  newCommentText = signal('');
  isSubmittingComment = signal(false);

  showDeleteConfirmation = signal(false);
  isDeleting = signal(false);

  private issueId!: number;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.issueId = +idParam;
      this.loadIssueDetails();
      this.loadComments();
      this.loadAttachments();
    } else {
      this.error.set('Issue ID not found.');
      this.isLoading.set(false);
    }
  }

  loadIssueDetails(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.apiService.get<Issue>(`/issues/${this.issueId}/`)
      .subscribe({
        next: (data) => {
          this.issue.set(data);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load issue details.');
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  loadComments(): void {
    this.apiService.get<IssueComment[]>(`/comments/?issue_id=${this.issueId}`) // Assuming API supports filtering and returns array directly
      .subscribe({
        next: (data) => this.comments.set(data), // If paginated, adjust accordingly
        error: (err) => console.error('Failed to load comments', err)
      });
  }

  loadAttachments(): void {
     this.apiService.get<Attachment[]>(`/attachments/?issue_id=${this.issueId}`) // Assuming API supports filtering
      .subscribe({
        next: (data) => this.attachments.set(data), // If paginated, adjust accordingly
        error: (err) => console.error('Failed to load attachments', err)
      });
  }

  addComment(): void {
    if (!this.newCommentText().trim() || !this.issueId) return;

    this.isSubmittingComment.set(true);
    const payload: CreateCommentPayload = {
      issue: this.issueId,
      text: this.newCommentText().trim()
    };

    this.apiService.post<IssueComment>('/comments/', payload)
      .subscribe({
        next: (comment) => {
          this.comments.update(currentComments => [...currentComments, comment]);
          this.newCommentText.set('');
          this.isSubmittingComment.set(false);
        },
        error: (err) => {
          console.error('Failed to add comment', err);
          alert('Error adding comment. Please try again.'); // Replace with better UI
          this.isSubmittingComment.set(false);
        }
      });
  }

  confirmDeleteIssue(): void {
    this.showDeleteConfirmation.set(true);
  }

  cancelDeleteIssue(): void {
    this.showDeleteConfirmation.set(false);
  }

  deleteIssue(): void {
    if (!this.issueId) return;
    this.isDeleting.set(true);
    this.apiService.delete(`/issues/${this.issueId}/`)
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.showDeleteConfirmation.set(false);
          this.router.navigate(['/issues']);
          // Add a success message/toast here
        },
        error: (err) => {
          console.error('Failed to delete issue', err);
          alert('Error deleting issue. Please try again.'); // Replace with better UI
          this.isDeleting.set(false);
          this.showDeleteConfirmation.set(false);
        }
      });
  }

  uploadAttachment(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('issue', this.issueId.toString());

      // Add loading state for attachment upload
      this.apiService.postMultipart<Attachment>('/attachments/', formData)
        .subscribe({
          next: (attachment) => {
            this.attachments.update(atts => [...atts, attachment]);
            // Add success message
          },
          error: (err) => {
            console.error('Failed to upload attachment', err);
            alert('Error uploading attachment.'); // Replace with better UI
          }
        });
    }
  }

  deleteAttachment(attachmentId: number, event: MouseEvent): void {
    event.stopPropagation(); // Prevent click bubbling if on a clickable row
    if (!confirm('Are you sure you want to delete this attachment?')) return; // Replace with better UI

    this.apiService.delete(`/attachments/${attachmentId}/`)
      .subscribe({
        next: () => {
          this.attachments.update(atts => atts.filter(att => att.id !== attachmentId));
          // Add success message
        },
        error: (err) => {
          console.error('Failed to delete attachment', err);
          alert('Error deleting attachment.'); // Replace with better UI
        }
      });
  }

  getPriorityColor(priorityName?: string): string {
    if (!priorityName) return 'bg-slate-200 text-slate-700';
    switch (priorityName.toLowerCase()) {
      case 'highest': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-yellow-400 text-gray-800';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  }

   getSeverityColor(severityName?: string): string {
     if (!severityName) return 'bg-slate-200 text-slate-700';
    switch (severityName.toLowerCase()) {
      case 'critical': return 'bg-red-700 text-white';
      case 'major': return 'bg-orange-600 text-white';
      case 'minor': return 'bg-yellow-500 text-gray-800';
      case 'trivial': return 'bg-blue-500 text-white';
      default: return 'bg-slate-200 text-slate-700';
    }
  }
}
