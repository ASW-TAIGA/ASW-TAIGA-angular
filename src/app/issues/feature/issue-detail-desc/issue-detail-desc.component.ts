import {
  Component,
  Input,
  OnInit,
  effect,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel
import {
  IssueDetailService,
  Issue,
  Comment,
  Attachment,
  User,
} from './issue-detail-desc-service';
import { catchError, filter, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-issue-detail-desc',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe], // DatePipe needed for date formatting
  templateUrl: './issue-detail-desc.component.html',
  styleUrl: './issue-detail-desc.component.css',
})
export class IssueDetailDescComponent implements OnInit {
  // Input property to receive the issue ID from a parent component
  @Input() issueId!: number;

  // Signals for reactive state management
  issueDetails: WritableSignal<Issue | null> = signal(null);
  newCommentText: WritableSignal<string> = signal('');
  selectedFile: WritableSignal<File | null> = signal(null);
  isLoading: WritableSignal<boolean> = signal(false);
  errorMessage: WritableSignal<string | null> = signal(null);
  currentUser: WritableSignal<User | null> = signal(null); // Signal for current user

  constructor(private issueService: IssueDetailService) {
    // Effect to react to changes in issueId and fetch new data
    // This runs initially and whenever issueId changes
    effect(() => {
      if (this.issueId) {
        this.fetchIssueDetails(this.issueId);
      }
    });
  }

  ngOnInit(): void {
    // Initialize current user from the service
    this.currentUser.set(this.issueService.getCurrentUser());
  }

  /**
   * Fetches issue details from the service.
   * Uses Observables for the async call and updates a Signal.
   * @param id The ID of the issue to fetch.
   */
  fetchIssueDetails(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null); // Clear previous errors

    this.issueService
      .getIssueDetails(id)
      .pipe(
        tap(() => this.isLoading.set(false)), // Set loading to false on success or error
        catchError((error) => {
          console.error('Error fetching issue details:', error);
          this.errorMessage.set(
            `Failed to load issue: ${error.message || 'Unknown error'}`
          );
          this.isLoading.set(false);
          return of(null); // Return observable of null to continue stream
        })
      )
      .subscribe((issue) => {
        if (issue) {
          this.issueDetails.set(issue);
        } else {
          this.issueDetails.set(null); // Set to null if issue not found or error occurred
        }
      });
  }

  /**
   * Handles the submission of a new comment.
   * Calls the service to add the comment and updates the issue details.
   */
  onCommentSubmit(): void {
    const commentText = this.newCommentText().trim();
    const issue = this.issueDetails();

    if (!commentText || !issue || !this.currentUser()) {
      this.errorMessage.set('Comment text, issue, or current user is missing.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.issueService
      .addComment(issue.id, commentText)
      .pipe(
        tap(() => this.isLoading.set(false)),
        catchError((error) => {
          console.error('Error adding comment:', error);
          this.errorMessage.set(
            `Failed to add comment: ${error.message || 'Unknown error'}`
          );
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe((addedComment) => {
        if (addedComment) {
          // Update the issueDetails signal immutably to trigger reactivity
          this.issueDetails.update((currentIssue) => {
            if (currentIssue) {
              return {
                ...currentIssue,
                comments: [...currentIssue.comments, addedComment],
                updatedAt: new Date(), // Update last updated time
              };
            }
            return currentIssue;
          });
          this.newCommentText.set(''); // Clear the comment input
        }
      });
  }

  /**
   * Handles file selection for attachments.
   * @param event The DOM event from the file input.
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile.set(input.files[0]);
    } else {
      this.selectedFile.set(null);
    }
  }

  /**
   * Handles the attachment upload.
   * Calls the service to upload the file and updates the issue details.
   */
  onAttachmentUpload(): void {
    const file = this.selectedFile();
    const issue = this.issueDetails();

    if (!file || !issue) {
      this.errorMessage.set('No file selected or issue is missing.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.issueService
      .uploadAttachment(issue.id, file)
      .pipe(
        tap(() => this.isLoading.set(false)),
        catchError((error) => {
          console.error('Error uploading attachment:', error);
          this.errorMessage.set(
            `Failed to upload attachment: ${error.message || 'Unknown error'}`
          );
          this.isLoading.set(false);
          return of(null);
        })
      )
      .subscribe((addedAttachment) => {
        if (addedAttachment) {
          // Update the issueDetails signal immutably
          this.issueDetails.update((currentIssue) => {
            if (currentIssue) {
              return {
                ...currentIssue,
                attachments: [...currentIssue.attachments, addedAttachment],
                updatedAt: new Date(), // Update last updated time
              };
            }
            return currentIssue;
          });
          this.selectedFile.set(null); // Clear selected file
          // Reset file input value to allow re-uploading the same file
          const fileInput = document.getElementById(
            'attachmentInput'
          ) as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        }
      });
  }
}
