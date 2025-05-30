import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, inject, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueSidebarComponent } from '../issue-sidebar/issue-sidebar.component';
import { IssueDetailComponent } from '../issue-detail/issue-detail.component';
import {
  IssueService,
  Issue,
  IssueOptions,
  IssueUpdatePayload,
  UserLite,
  AttachmentDetail // Added
} from '../../data-access/issue.service';
import { Observable, BehaviorSubject, of, Subscription, forkJoin } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-issues', // Changed selector from 'app-issues' to 'app-issue-view' or similar if this is a view component
  standalone: true,
  imports: [
    CommonModule,
    IssueSidebarComponent,
    IssueDetailComponent
  ],
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css'], // Ensure this file exists or remove if not needed
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueComponent implements OnInit, OnChanges, OnDestroy {
  @Input() issueToShow: Issue | null = null; // This will be the primary way to set the issue
  @Input() allIssueIds: (number | string)[] = []; // For prev/next navigation
  @Input() currentUserInput: UserLite | null = null;
  @Input() allProjectUsersInput: UserLite[] = [];
  @Input() issueOptionsInput: IssueOptions | null = null; // Pass options directly

  // Output to notify parent about navigation or if issue needs refresh from list
  @Output() changeIssueRequest = new EventEmitter<string | number>();
  @Output() issueDeletedInDetail = new EventEmitter<number>();


  private issueService = inject(IssueService);
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);

  private _currentIssueSubject = new BehaviorSubject<Issue | null>(null);
  currentIssue$: Observable<Issue | null> = this._currentIssueSubject.asObservable();

  // issueOptions$: Observable<IssueOptions | null> = of(null); // Will use @Input() issueOptionsInput

  // For navigation state
  canGoPrevious: boolean = false;
  canGoNext: boolean = false;
  private previousIssueId: string | number | null = null;
  private nextIssueId: string | number | null = null;

  private subscriptions = new Subscription();

  isLoadingIssue: boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.currentIssue$.subscribe(currentIssue => {
        this.updateNavigationState(currentIssue);
        this.cdr.markForCheck();
      })
    );

    if (this.issueToShow) {
      this._currentIssueSubject.next(this.issueToShow);
    }
    // No automatic loading by ID on init; parent should provide issueToShow
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issueToShow']) {
      const newIssue = changes['issueToShow'].currentValue as Issue | null;
      this._currentIssueSubject.next(newIssue);
      // updateNavigationState is called by the subscription to currentIssue$
    }
    if (changes['allIssueIds']) {
      this.updateNavigationState(this._currentIssueSubject.getValue());
    }
    // currentUserInput and allProjectUsersInput are passed down directly
    // issueOptionsInput is passed down directly
  }

  private updateNavigationState(currentIssue: Issue | null): void {
    if (currentIssue && currentIssue.id !== undefined && this.allIssueIds && this.allIssueIds.length > 0) {
      const currentIdStr = String(currentIssue.id);
      const currentIndex = this.allIssueIds.map(String).indexOf(currentIdStr);

      this.canGoPrevious = currentIndex > 0;
      this.previousIssueId = this.canGoPrevious ? this.allIssueIds[currentIndex - 1] : null;

      this.canGoNext = currentIndex >= 0 && currentIndex < this.allIssueIds.length - 1;
      this.nextIssueId = this.canGoNext ? this.allIssueIds[currentIndex + 1] : null;
    } else {
      this.canGoPrevious = false;
      this.canGoNext = false;
      this.previousIssueId = null;
      this.nextIssueId = null;
    }
    this.cdr.markForCheck();
  }

  // Centralized issue update logic
  handleIssuePropertyUpdate(event: { field: keyof IssueUpdatePayload | 'watchers_action', value: any, currentIssueId: number }): void {
    this.isLoadingIssue = true;
    this.cdr.markForCheck();

    const currentIssue = this._currentIssueSubject.getValue();
    if (!currentIssue || currentIssue.id !== event.currentIssueId) {
        this.toastr.error("Issue context mismatch. Please refresh.", "Update Error");
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
        return;
    }

    let payload: IssueUpdatePayload = {};
    const fieldKey = event.field;

    if (fieldKey === 'watchers_action') {
        const watcherUpdate = event.value as { action: 'add' | 'remove', user: UserLite };
        let currentWatcherIds = currentIssue.watchers.map(w => w.id);
        if (watcherUpdate.action === 'add' && !currentWatcherIds.includes(watcherUpdate.user.id)) {
            currentWatcherIds.push(watcherUpdate.user.id);
        } else if (watcherUpdate.action === 'remove') {
            currentWatcherIds = currentWatcherIds.filter(id => id !== watcherUpdate.user.id);
        }
        payload.watcher_ids = currentWatcherIds;
    } else if (fieldKey === 'status_id' || fieldKey === 'issue_type_id' || fieldKey === 'severity_id' || fieldKey === 'priority_id' || fieldKey === 'assignee_id' || fieldKey === 'deadline' || fieldKey === 'title' || fieldKey === 'description') {
        // Directly assign if it's a valid field of IssueUpdatePayload
         (payload as any)[fieldKey] = event.value;
    } else {
        this.toastr.warning(`Update for field '${String(fieldKey)}' is not implemented directly.`, "Developer Note");
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
        return;
    }
    
    if (Object.keys(payload).length === 0) {
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
        return; // No actual changes to send
    }

    this.issueService.updateIssue(event.currentIssueId, payload).pipe(
      finalize(() => {
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (updatedIssue: Issue) => {
        this._currentIssueSubject.next(updatedIssue);
        this.toastr.success('Issue updated!', 'Success');
      },
      error: (err: any) => {
        this.toastr.error(`Failed to update issue: ${err.message}`, 'Error');
        // Optionally, refetch or revert: this._currentIssueSubject.next(currentIssue);
      }
    });
  }
  
  // Handler for description changes from issue-detail
  handleIssueDataChangedFromDetail(updatedIssue: Issue): void {
    this._currentIssueSubject.next(updatedIssue); // Update the main subject
  }

  handleCommentAdded(event: { issueId: number, text: string }): void {
    this.isLoadingIssue = true;
    this.cdr.markForCheck();
    this.issueService.addComment(event.issueId, event.text).pipe(
      finalize(() => {
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (newComment) => {
        const currentIssue = this._currentIssueSubject.getValue();
        if (currentIssue && currentIssue.id === event.issueId) {
          const updatedComments = [...currentIssue.comments, newComment];
          this._currentIssueSubject.next({ ...currentIssue, comments: updatedComments });
          this.toastr.success('Comment added!', 'Success');
        }
      },
      error: (err) => this.toastr.error(`Failed to add comment: ${err.message}`, 'Error')
    });
  }

  handleAttachmentAdded(event: { issueId: number, file: File }): void {
    this.isLoadingIssue = true;
    this.cdr.markForCheck();
    this.issueService.addAttachment(event.issueId, event.file).pipe(
      finalize(() => {
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: (newAttachment) => {
        const currentIssue = this._currentIssueSubject.getValue();
        if (currentIssue && currentIssue.id === event.issueId) {
          const updatedAttachments = [...currentIssue.attachments, newAttachment];
          this._currentIssueSubject.next({ ...currentIssue, attachments: updatedAttachments });
          this.toastr.success('Attachment added!', 'Success');
        }
      },
      error: (err) => this.toastr.error(`Failed to add attachment: ${err.message}`, 'Error')
    });
  }

  handleAttachmentDeleted(event: { issueId: number, attachmentId: number }): void {
    this.isLoadingIssue = true;
    this.cdr.markForCheck();
    this.issueService.deleteAttachment(event.attachmentId).pipe(
      finalize(() => {
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        const currentIssue = this._currentIssueSubject.getValue();
        if (currentIssue && currentIssue.id === event.issueId) {
          const updatedAttachments = currentIssue.attachments.filter(att => att.id !== event.attachmentId);
          this._currentIssueSubject.next({ ...currentIssue, attachments: updatedAttachments });
          this.toastr.success('Attachment deleted!', 'Success');
        }
      },
      error: (err) => this.toastr.error(`Failed to delete attachment: ${err.message}`, 'Error')
    });
  }


  handleDeleteIssueFromSidebar(issueIdToDelete: number): void {
    this.isLoadingIssue = true;
    this.cdr.markForCheck();
    this.issueService.deleteIssue(issueIdToDelete).pipe(
      finalize(() => {
        this.isLoadingIssue = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.toastr.success(`Issue #${issueIdToDelete} deleted successfully!`, 'Success');
        this._currentIssueSubject.next(null); // Clear current issue
        this.issueDeletedInDetail.emit(issueIdToDelete); // Notify parent
      },
      error: (err: any) => {
        this.toastr.error(`Failed to delete issue #${issueIdToDelete}: ${err.message}`, 'Error');
      }
    });
  }

  onNavigateToPrevious(): void {
    if (this.canGoPrevious && this.previousIssueId !== null) {
      this.changeIssueRequest.emit(this.previousIssueId);
    }
  }

  onNavigateToNext(): void {
    if (this.canGoNext && this.nextIssueId !== null) {
      this.changeIssueRequest.emit(this.nextIssueId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
