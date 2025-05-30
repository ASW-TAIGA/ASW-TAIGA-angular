import { Component, OnInit, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import {
  Issue,
  IssueService,
  UserLite,
  IssueOptions,
  IssueUpdatePayload,
  NewIssueFormData
} from '../../data-access/issue.service';
import { IssueFormComponent } from '../issue-form/issue-form.component';

type SortableColumnKey = 'issue_type' | 'severity' | 'priority' | 'status';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, DatePipe, IssueFormComponent],
  templateUrl: './issues-list.component.html',
  styleUrls: ['./issues-list.component.css']
})
export class IssuesListComponent implements OnInit {
  private issueService = inject(IssueService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  issues: Issue[] = [];
  isLoading: boolean = true;

  currentSortColumn: SortableColumnKey | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';

  showNewIssueForm: boolean = false;
  issueOptionsForForm: IssueOptions | null = null;
  currentUser: UserLite | null = null;
  allProjectUsers: UserLite[] = [];

  activeAssigneeDropdownForIssueId: number | string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;

    forkJoin({
      issues: this.issueService.getIssues(),
      currentUser: this.issueService.getCurrentUser(),
      projectUsers: this.issueService.getProjectUsers(),
      issueOptions: this.issueService.getIssueOptions()
    }).pipe(
      tap(data => console.log('IssuesListComponent: Initial data fetched from service', data)),
      catchError(error => {
        console.error('IssuesListComponent: Error loading initial data', error);
        this.isLoading = false;
        // Aquí podrías inicializar con arrays/objetos vacíos para evitar errores en la plantilla
        this.issues = [];
        this.currentUser = null;
        this.allProjectUsers = [];
        this.issueOptionsForForm = null;
        // Mostrar un mensaje de error en la UI sería ideal aquí
        alert('Failed to load initial data. Please check connectivity or API status.');
        return of(null); // Devuelve un observable que completa para que la cadena no se rompa
      })
    ).subscribe(data => {
      if (data) {
        this.issues = data.issues;
        this.currentUser = data.currentUser;
        this.allProjectUsers = data.projectUsers;
        this.issueOptionsForForm = data.issueOptions;

        if (this.currentSortColumn) {
          this.applyCurrentSort();
        }
      }
      this.isLoading = false;
      console.log('IssuesListComponent: Initial data loading complete.');
    });
  }

  selectIssueAndNavigate(issue: Issue): void {
    console.log('IssuesListComponent: Navigating to issue ID:', issue.id);
    this.router.navigate(['/issues', issue.id]);
  }

  toggleNewIssueForm(): void {
    this.showNewIssueForm = !this.showNewIssueForm;
  }

  handleIssueCreated(eventPayload: { issueData: NewIssueFormData, files: File[] }): void {
    console.log('IssuesListComponent: handleIssueCreated, data from form:', eventPayload.issueData);
    if (!this.currentUser) {
      alert("Error: Current user not available for creating issue.");
      return;
    }

    this.issueService.createIssue(eventPayload.issueData, this.currentUser).subscribe({
      next: (createdIssue) => {
        console.log('IssuesListComponent: Issue created successfully by service:', createdIssue);
        this.issues = [createdIssue, ...this.issues];
        if (this.currentSortColumn) {
          this.applyCurrentSort();
        }
        this.showNewIssueForm = false;
        this.selectIssueAndNavigate(createdIssue);
      },
      error: (err) => {
        console.error('IssuesListComponent: Error creating issue:', err);
        alert(`Failed to create issue: ${err.message || 'Unknown error'}`);
      }
    });
  }

  sortBy(column: SortableColumnKey): void {
    if (this.currentSortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyCurrentSort();
  }

  private applyCurrentSort(): void {
    if (!this.currentSortColumn || !this.issues || this.issues.length === 0) return;
    const column = this.currentSortColumn;
    this.issues.sort((a, b) => {
      let valA: string | number = 0;
      let valB: string | number = 0;
      switch (column) {
        case 'issue_type': valA = a.issue_type.order; valB = b.issue_type.order; break;
        case 'severity':   valA = a.severity.order;   valB = b.severity.order;   break;
        case 'priority':   valA = a.priority.order;   valB = b.priority.order;   break;
        case 'status':     valA = a.status.order;     valB = b.status.order;     break;
      }
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      return this.sortDirection === 'asc' ? comparison : comparison * -1;
    });
    this.issues = [...this.issues];
  }

  toggleAssigneeDropdown(issueId: number | string, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeAssigneeDropdownForIssueId === issueId) {
      this.activeAssigneeDropdownForIssueId = null;
    } else {
      this.activeAssigneeDropdownForIssueId = issueId;
    }
  }

  changeAssignee(targetIssue: Issue, newAssignee: UserLite | null, event: MouseEvent): void {
    event.stopPropagation();
    const payload: IssueUpdatePayload = {
      assignee_id: newAssignee ? newAssignee.id : null
    };
    this.issueService.updateIssue(targetIssue.id, payload).subscribe({
      next: (updatedIssue) => {
        const index = this.issues.findIndex(iss => iss.id === updatedIssue.id);
        if (index > -1) {
          this.issues[index] = updatedIssue;
          this.issues = [...this.issues];
        }
      },
      error: (err) => {
        console.error('Failed to update assignee in list:', err);
        alert('Error updating assignee. Please try again.');
      },
      complete: () => {
        this.activeAssigneeDropdownForIssueId = null;
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.activeAssigneeDropdownForIssueId !== null) {
      const targetElement = event.target as HTMLElement;
      if (!targetElement.closest('.assignee-dropdown-trigger, .assignee-dropdown-menu')) {
        this.activeAssigneeDropdownForIssueId = null;
      }
    }
  }
}
