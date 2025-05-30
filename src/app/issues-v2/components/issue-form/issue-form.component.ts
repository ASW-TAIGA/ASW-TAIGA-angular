import { Component, OnInit, inject, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Issue, CreateIssuePayload, UpdateIssuePayload, User, IssueStatus, Priority, Severity, IssueType, PaginatedResponse } from '../../models';
import { forkJoin, of, Observable } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
  providers: [DatePipe],
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.css']
})
export class IssueFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private datePipe = inject(DatePipe);

  issueForm!: FormGroup;
  isEditMode = signal(false);
  issueId: number | null = null;
  isLoading = signal(true); // True initially for loading dropdowns and potentially issue data
  isSubmitting = signal(false);
  error = signal<string | null>(null);
  pageTitle = signal('Create New Issue');

  users: WritableSignal<User[]> = signal([]);
  statuses: WritableSignal<IssueStatus[]> = signal([]);
  priorities: WritableSignal<Priority[]> = signal([]);
  severities: WritableSignal<Severity[]> = signal([]);
  issueTypes: WritableSignal<IssueType[]> = signal([]);

  constructor() {
    this.issueForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      status_id: [null],
      priority_id: [null],
      severity_id: [null],
      issue_type_id: [null],
      assignee_id: [null],
      watcher_ids: [[]],
      deadline: [null]
    });

    effect(() => {
      // This effect will run when isEditMode or issueId changes.
      // We set isLoading to true here if isEditMode is true and issueId is present,
      // because we'll be fetching issue data.
      if (this.isEditMode() && this.issueId) {
        this.pageTitle.set(`Edit Issue #${this.issueId}`);
      } else {
        this.pageTitle.set('Create New Issue');
      }
    });
  }

  ngOnInit(): void {
    this.isLoading.set(true); // Start loading for dropdowns
    this.loadDropdownData().subscribe({
      next: () => {
        // Dropdowns loaded, now check if we are in edit mode
        this.route.paramMap.pipe(
          switchMap(params => {
            const id = params.get('id');
            if (id) {
              this.isEditMode.set(true);
              this.issueId = +id;
              // isLoading is already true or will be set by this fetch
              return this.apiService.get<Issue>(`/issues/${this.issueId}/`);
            }
            this.isLoading.set(false); // Not edit mode, no issue to fetch, dropdowns loaded
            return of(null);
          }),
          catchError(err => {
            this.error.set('Failed to load issue data for editing.');
            console.error(err);
            this.isLoading.set(false);
            return of(null);
          })
        ).subscribe(issue => {
          if (issue) {
            this.issueForm.patchValue({
              title: issue.title,
              description: issue.description,
              status_id: issue.status?.id,
              priority_id: issue.priority?.id,
              severity_id: issue.severity?.id,
              issue_type_id: issue.issue_type?.id,
              assignee_id: issue.assignee?.id,
              watcher_ids: issue.watchers?.map((w: any) => w.id) || [],
              deadline: issue.deadline ? this.datePipe.transform(issue.deadline, 'yyyy-MM-dd') : null
            });
          }
          // If not in edit mode, or if issue fetch finished (successfully or not)
          if (!this.isEditMode() || issue !== undefined) {
             this.isLoading.set(false);
          }
        });
      },
      error: (dropdownError) => {
        console.error("Failed to load dropdown data", dropdownError);
        this.error.set('Failed to load required form data. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  loadDropdownData(): Observable<void> {
    const users$ = this.apiService.get<User[]>('/users/').pipe(
        map(response => {
            // Assuming /users/ might return PaginatedResponse<User> or User[]
            // Adjust if your /users/ endpoint returns a paginated response
            if (Array.isArray(response)) {
                return response;
            }
            return (response as PaginatedResponse<User>).results || [];
        }),
        catchError(err => {
            console.error('Failed to load users', err);
            this.error.update(current => (current ? current + '; ' : '') + 'Failed to load users.');
            return of([]); // Return empty array on error to allow form to load
        })
    );
    const statuses$ = this.apiService.get<IssueStatus[]>('/settings/statuses/').pipe(catchError(err => { console.error('Failed to load statuses', err); this.error.update(current => (current ? current + '; ' : '') + 'Failed to load statuses.'); return of([]); }));
    const priorities$ = this.apiService.get<Priority[]>('/settings/priorities/').pipe(catchError(err => { console.error('Failed to load priorities', err); this.error.update(current => (current ? current + '; ' : '') + 'Failed to load priorities.'); return of([]); }));
    const severities$ = this.apiService.get<Severity[]>('/settings/severities/').pipe(catchError(err => { console.error('Failed to load severities', err); this.error.update(current => (current ? current + '; ' : '') + 'Failed to load severities.'); return of([]); }));
    const issueTypes$ = this.apiService.get<IssueType[]>('/settings/types/').pipe(catchError(err => { console.error('Failed to load issue types', err); this.error.update(current => (current ? current + '; ' : '') + 'Failed to load issue types.'); return of([]); }));

    return forkJoin([
      users$,
      statuses$,
      priorities$,
      severities$,
      issueTypes$
    ]).pipe(
      map(([users, statuses, priorities, severities, issueTypes]) => {
        this.users.set(users);
        this.statuses.set(statuses);
        this.priorities.set(priorities);
        this.severities.set(severities);
        this.issueTypes.set(issueTypes);
        // isLoading will be set to false after issue data is potentially loaded in ngOnInit
      })
    );
  }


  onSubmit(): void {
    if (this.issueForm.invalid) {
      this.error.set('Please fill in all required fields.');
      this.issueForm.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);
    this.error.set(null);

    const formValue = this.issueForm.value;
    let deadlinePayload: string | null = null;
    if (formValue.deadline) {
      const date = new Date(formValue.deadline + 'T00:00:00'); // Ensure date is interpreted as local midnight
      deadlinePayload = date.toISOString();
    }

    const payload: CreateIssuePayload | UpdateIssuePayload = {
      title: formValue.title,
      description: formValue.description || null,
      status_id: formValue.status_id ? Number(formValue.status_id) : undefined,
      priority_id: formValue.priority_id ? Number(formValue.priority_id) : undefined,
      severity_id: formValue.severity_id ? Number(formValue.severity_id) : undefined,
      issue_type_id: formValue.issue_type_id ? Number(formValue.issue_type_id) : undefined,
      assignee_id: formValue.assignee_id ? Number(formValue.assignee_id) : null,
      watcher_ids: formValue.watcher_ids || [],
      deadline: deadlinePayload
    };

    Object.keys(payload).forEach(key => {
        const typedKey = key as keyof typeof payload;
        if (payload[typedKey] === undefined || payload[typedKey] === null && typedKey !== 'assignee_id' && typedKey !== 'description' && typedKey !== 'deadline') { // Allow null for assignee, desc, deadline
             if (!(typedKey === 'assignee_id' && payload[typedKey] === null) &&
                 !(typedKey === 'description' && payload[typedKey] === null) &&
                 !(typedKey === 'deadline' && payload[typedKey] === null) ) {
                delete payload[typedKey];
            }
        }
    });

    let operation: Observable<Issue>;
    if (this.isEditMode() && this.issueId) {
      operation = this.apiService.patch<Issue>(`/issues/${this.issueId}/`, payload);
    } else {
      operation = this.apiService.post<Issue>('/issues/', payload);
    }

    operation.subscribe({
      next: (issue) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/issues', issue.id]);
      },
      error: (err) => {
        let errorMessage = 'An error occurred while saving the issue. Please try again.';
        if (err.error && typeof err.error === 'object') {
            const fieldErrors = Object.entries(err.error).map(([key, value]) => `${key}: ${(Array.isArray(value) ? value.join(', ') : value)}`).join('; ');
            if (fieldErrors) errorMessage = fieldErrors;
        } else if (err.error?.detail) {
            errorMessage = err.error.detail;
        } else if (err.message) {
            errorMessage = err.message;
        }
        this.error.set(errorMessage);
        console.error(err);
        this.isSubmitting.set(false);
      }
    });
  }

  onCancel(): void {
    if (this.isEditMode() && this.issueId) {
      this.router.navigate(['/issues', this.issueId]);
    } else {
      this.router.navigate(['/issues']);
    }
  }
}
