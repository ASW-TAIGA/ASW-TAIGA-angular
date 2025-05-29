
// src/app/issues/feature/issues/issues.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueSidebarComponent } from '../issue-sidebar/issue-sidebar.component';
import { IssueDetailComponent } from '../issue-detail/issue-detail.component';
import {
  IssueService,
  Issue,
  IssueOptions,
  IssueUpdatePayload,
  UserLite
} from '../../data-access/issue.service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Component, HostListener } from '@angular/core';
import { IssueSidebarComponent } from './issue-sidebar.component';
import { IssuesListComponent } from './issues-list/issues-list.component';


@Component({
  selector: 'app-issues',
  standalone: true,

  imports: [
    CommonModule,
    IssueSidebarComponent,
    IssueDetailComponent
  ],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.css',
})

export class IssuesComponent implements OnInit {
  private issueService = inject(IssueService);

  currentIssue$: Observable<Issue | null> = of(null);
  issueOptions$: Observable<IssueOptions | null> = of(null);
  currentUser$: Observable<UserLite | null> = of(null);
  allProjectUsers$: Observable<UserLite[]> = of([]);

  // MODIFIED: Made issueId public by removing 'private'
  issueId = '123'; // O cómo sea que obtengas el ID del issue

  ngOnInit(): void {
    this.loadIssueData();
    this.loadDropdownOptions();
    this.loadUserContext();
  }

  loadIssueData(): void {
    this.currentIssue$ = this.issueService.getIssue(this.issueId).pipe(
      tap(returnedIssue => console.log('IssuesComponent: Loaded issue data', returnedIssue)) // Changed 'issue' to 'returnedIssue' to avoid conflict if needed
    );
  }

  loadDropdownOptions(): void {
    this.issueOptions$ = this.issueService.getIssueOptions().pipe(
      tap(options => console.log('IssuesComponent: Loaded issue options', options))
    );
  }

  loadUserContext(): void {
    this.currentUser$ = this.issueService.getCurrentUser();
    this.allProjectUsers$ = this.issueService.getProjectUsers();
  }

  handleIssueUpdate(event: { field: keyof Issue, value: any, currentIssue: Issue }): void {
    // ... (resto del método sin cambios)
    if (!event.currentIssue || !event.currentIssue.id) {
      console.error('IssuesComponent: Cannot update issue, current issue or ID is missing.');
      return;
    }
    console.log(`IssuesComponent: Received update from sidebar for field '${String(event.field)}' with value`, event.value);
    const payload: IssueUpdatePayload = {};
    const fieldKey = event.field as string;

    if (fieldKey === 'status' && event.value && typeof event.value.id === 'number') {
      payload.status_id = event.value.id;
    } else if (fieldKey === 'issue_type' && event.value && typeof event.value.id === 'number') {
      payload.issue_type_id = event.value.id;
    } else if (fieldKey === 'severity' && event.value && typeof event.value.id === 'number') {
      payload.severity_id = event.value.id;
    } else if (fieldKey === 'priority' && event.value && typeof event.value.id === 'number') {
      payload.priority_id = event.value.id;
    } else if (fieldKey === 'deadline') {
      payload.deadline = event.value as string | null;
    } else if (fieldKey === 'title' || fieldKey === 'description') {
      payload[fieldKey as keyof IssueUpdatePayload] = event.value;
    } else if (fieldKey === 'assignee') {
      payload.assignee_id = event.value ? (event.value as UserLite).id : null;
    } else if (fieldKey === 'watchers') {
      const watcherUpdate = event.value as { action: 'add' | 'remove', user: UserLite };
      if (watcherUpdate.action === 'add') {
        payload.watchers_to_add = [watcherUpdate.user.id];
      } else if (watcherUpdate.action === 'remove') {
        payload.watchers_to_remove = [watcherUpdate.user.id];
      }
    }

    if (Object.keys(payload).length === 0) {
      console.log('IssuesComponent: No valid changes mapped to update payload.');
      return;
    }

    this.issueService.updateIssue(event.currentIssue.id, payload).subscribe({
      next: (updatedIssue: Issue) => {
        console.log('IssuesComponent: Issue updated successfully via service', updatedIssue);
        this.currentIssue$ = of(updatedIssue);
      },
      error: (err: any) => console.error('IssuesComponent: Error updating issue', err)
    });
  }

  handleDeleteIssue(issueIdToDelete: number): void {
    // ... (resto del método sin cambios)
    console.log(`IssuesComponent: Attempting to delete issue with ID: ${issueIdToDelete}`);
    this.issueService.deleteIssue(issueIdToDelete).subscribe({
      next: () => {
        console.log(`IssuesComponent: Issue ${issueIdToDelete} successfully deleted.`);
        alert(`Issue ${issueIdToDelete} deleted successfully!`);
        if (String(this.issueId) === String(issueIdToDelete)) {
          this.currentIssue$ = of(null);
          console.log('Current issue view cleared as it was deleted.');
        }
      },
      error: (err: any) => {
        console.error(`IssuesComponent: Error deleting issue ${issueIdToDelete}`, err);
        alert(`Failed to delete issue ${issueIdToDelete}. Please try again.`);
      }
    });
  }
}

