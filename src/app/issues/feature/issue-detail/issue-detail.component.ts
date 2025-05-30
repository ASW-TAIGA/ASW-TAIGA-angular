// src/app/issues/feature/issue-detail/issue-detail.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Issue, AttachmentDetail, IssueService, CommentDetail, UserLite } from '../../data-access/issue.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueDetailComponent implements OnChanges {
  @Input() issue: Issue | null = null;
  @Input() canGoPrevious: boolean = false;
  @Input() canGoNext: boolean = false;
  @Input() currentUser: UserLite | null = null;

  @Output() navigateToPrevious = new EventEmitter<void>();
  @Output() navigateToNext = new EventEmitter<void>();
  // Emitting full issue for parent to handle update and re-fetch if necessary
  @Output() issueDataChanged = new EventEmitter<Issue>(); // Emits the full updated issue or triggers refresh
  @Output() commentAdded = new EventEmitter<{ issueId: number, text: string }>();
  @Output() attachmentAdded = new EventEmitter<{ issueId: number, file: File}>();
  @Output() attachmentDeleted = new EventEmitter<{ issueId: number, attachmentId: number }>();


  isEditingDescription: boolean = false;
  editableDescription: string = '';
  newCommentText: string = '';

  // For editing existing comments (future enhancement, not fully implemented yet)
  // editingCommentId: number | null = null;
  // editableCommentText: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private issueService = inject(IssueService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issue'] && this.issue) {
      if (!this.isEditingDescription) {
        this.editableDescription = this.issue.description;
      }
      // Reset comment edit state if issue changes
      // if (this.editingCommentId !== null && changes['issue'].previousValue?.id !== changes['issue'].currentValue?.id) {
      //   this.cancelEditComment();
      // }
      this.cdr.markForCheck();
    }
  }

  get sortedComments(): CommentDetail[] {
    if (!this.issue || !this.issue.comments) {
      return [];
    }
    return [...this.issue.comments].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // canManageComment(comment: CommentDetail): boolean {
  //   if (!this.currentUser || !comment.author) return false;
  //   return this.currentUser.id === comment.author.id;
  // }

  // startEditComment(comment: CommentDetail): void {
  //   if (this.canManageComment(comment)) {
  //     this.editingCommentId = comment.id;
  //     this.editableCommentText = comment.text;
  //     this.isEditingDescription = false; // Ensure description edit is off
  //     this.cdr.markForCheck();
  //   } else {
  //     this.toastr.warning("You can only edit your own comments.", "Permission Denied");
  //   }
  // }

  // saveEditComment(commentToSave: CommentDetail): void {
  //   if (!this.issue || this.editingCommentId === null || !this.canManageComment(commentToSave)) {
  //     if(!this.canManageComment(commentToSave)) {
  //       this.toastr.error("You do not have permission to save this comment.", "Permission Denied");
  //     }
  //     return;
  //   }
  //   // TODO: Implement actual service call for updating comment
  //   this.toastr.info('Comment "saved" (mock local update). Backend integration needed.');
  //   this.cancelEditComment();
  // }

  // cancelEditComment(): void {
  //   this.editingCommentId = null;
  //   this.editableCommentText = '';
  //   this.cdr.markForCheck();
  // }

  // confirmDeleteComment(commentToDelete: CommentDetail): void {
  //   if (!this.issue || !this.canManageComment(commentToDelete)) {
  //     if(!this.canManageComment(commentToDelete)) {
  //       this.toastr.error("You do not have permission to delete this comment.", "Permission Denied");
  //     }
  //     return;
  //   }
  //   if (window.confirm(`Are you sure you want to delete this comment by ${commentToDelete.author.username}?`)) {
  //     // TODO: Call actual service to delete comment
  //     this.toastr.info(`Comment by ${commentToDelete.author.username} "deleted" (mock local update).`);
  //   }
  // }

  postNewComment(): void {
    if (!this.issue || !this.issue.id || !this.newCommentText.trim() || !this.currentUser) {
      if (!this.currentUser) this.toastr.warning("You must be logged in to comment.", "Authentication");
      if (!this.newCommentText.trim()) this.toastr.warning("Comment cannot be empty.", "Input Error");
      return;
    }
    const textToPost = this.newCommentText.trim();
    // Emit event for parent to handle, so issue state is managed centrally
    this.commentAdded.emit({ issueId: this.issue.id, text: textToPost });
    this.newCommentText = ''; // Clear input after emitting
    this.cdr.markForCheck();
  }

  startEditDescription(): void {
    if (this.issue) {
      this.editableDescription = this.issue.description;
      this.isEditingDescription = true;
      // this.cancelEditComment(); // If comment editing is active
      this.cdr.markForCheck();
    }
  }

  saveDescription(): void {
    if (this.issue && this.issue.id) {
      const payload = { description: this.editableDescription };
      this.issueService.updateIssue(this.issue.id, payload).subscribe({
        next: (updatedIssue) => {
          this.issue = updatedIssue; // Update local issue
          this.isEditingDescription = false;
          this.toastr.success('Description updated!', 'Success');
          this.issueDataChanged.emit(updatedIssue); // Notify parent
          this.cdr.markForCheck();
        },
        error: (err) => {
          this.toastr.error(`Failed to update description: ${err.message}`, 'Error');
          // Optionally revert editableDescription to this.issue.description
        }
      });
    }
  }

  cancelEditDescription(): void {
    if (this.issue) {
      this.editableDescription = this.issue.description; // Revert
      this.isEditingDescription = false;
      this.cdr.markForCheck();
    }
  }

  onNavigateToPreviousClick(): void { if (this.canGoPrevious) this.navigateToPrevious.emit(); }
  onNavigateToNextClick(): void { if (this.canGoNext) this.navigateToNext.emit(); }
  triggerFileUpload(): void { if(this.fileInput) this.fileInput.nativeElement.click(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.issue && this.issue.id !== null && this.issue.id !== undefined) {
        // Emit event for parent to handle
        this.attachmentAdded.emit({ issueId: this.issue.id, file: file });
      }
      // Clear the input value to allow selecting the same file again
      if (this.fileInput && this.fileInput.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  confirmDeleteAttachment(attachmentToDelete: AttachmentDetail): void {
    if (!this.issue || !this.issue.id) {
      this.toastr.error("Issue context is missing.", "Error");
      return;
    }
    if (typeof attachmentToDelete.id === 'undefined') {
      this.toastr.error("Attachment ID is missing.", "Error");
      return;
    }
    if (window.confirm(`Are you sure you want to delete the attachment "${attachmentToDelete.file_name}"?`)) {
       // Emit event for parent to handle
      this.attachmentDeleted.emit({ issueId: this.issue.id, attachmentId: attachmentToDelete.id });
    }
  }
}
