import { Component, OnInit, inject, HostListener, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy, OnDestroy, signal, WritableSignal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, forkJoin, Subject, Subscription } from 'rxjs';
import { map, tap, catchError, debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import {
  Issue,
  IssueService,
  UserLite,
  IssueOptions,
  IssueUpdatePayload,
  NewIssueFormData,
  GetIssuesParams,
  PaginatedIssuesResponse,
  AppliedFilters
} from '../../data-access/issue.service';
import { IssueFormComponent } from '../issue-form/issue-form.component';
import { SortIconComponent } from '../../ui/sort-icon/sort-icon.component';
import { FilterIssuesModalComponent } from '../../ui/filter-issues-modal/filter-issues-modal.component';
import { BulkAddIssuesModalComponent } from '../../ui/bulk-add-issues-modal/bulk-add-issues-modal.component';
import { ToastrService } from 'ngx-toastr';

type SortableColumnKey = 'issue_type' | 'severity' | 'priority' | 'status' | 'title' | 'id' | 'updated_at';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, IssueFormComponent, SortIconComponent, FilterIssuesModalComponent, BulkAddIssuesModalComponent],
  templateUrl: './issues-list.component.html',
  styleUrls: ['./issues-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // Remains OnPush, Signals work well with it
})
export class IssuesListComponent implements OnInit, OnDestroy {
  private issueService = inject(IssueService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef); // May still be needed for explicit triggers after async non-signal ops
  private toastr = inject(ToastrService);
  Math = Math;

  // State managed with Signals
  issues: WritableSignal<Issue[]> = signal([]);
  isLoading: WritableSignal<boolean> = signal(true);
  errorMessage: WritableSignal<string | null> = signal(null);
  
  currentSortColumn: WritableSignal<SortableColumnKey | null> = signal('updated_at');
  sortDirection: WritableSignal<'asc' | 'desc'> = signal('desc');

  showNewIssueForm: WritableSignal<boolean> = signal(false);
  issueOptionsForForm: WritableSignal<IssueOptions | null> = signal(null);
  currentUser: WritableSignal<UserLite | null> = signal(null);
  allProjectUsers: WritableSignal<UserLite[]> = signal([]);

  activeAssigneeDropdownForIssueId: WritableSignal<number | string | null> = signal(null);

  searchTerm: WritableSignal<string> = signal('');
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | undefined;

  currentPage: WritableSignal<number> = signal(1);
  itemsPerPage: WritableSignal<number> = signal(15);
  totalIssues: WritableSignal<number> = signal(0);

  showFiltersModal: WritableSignal<boolean> = signal(false);
  currentAppliedFilters: WritableSignal<AppliedFilters> = signal({});
  showBulkAddModal: WritableSignal<boolean> = signal(false);

  private avatarColorCache = new Map<string, string>();
  private tailwindColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#0D9488', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E'
  ];

  constructor() {
    // Example effect for logging or reacting to signal changes (optional)
    // effect(() => {
    //   console.log('Current search term signal:', this.searchTerm());
    // });
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((term) => { // Pass term explicitly
        this.currentPage.set(1);
        return this.fetchIssuesData(this.buildRequestParams(term)); // Pass term to build params
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
  
  private buildRequestParams(currentSearchTerm?: string): GetIssuesParams {
    const params: GetIssuesParams = {
      page: this.currentPage(),
    };
    const filters = this.currentAppliedFilters();
    if (filters.status !== null && filters.status !== undefined) params.status = filters.status;
    if (filters.priority !== null && filters.priority !== undefined) params.priority = filters.priority;
    if (filters.assignee_id !== null && filters.assignee_id !== undefined) params.assignee_id = filters.assignee_id;
    if (filters.creator_id !== null && filters.creator_id !== undefined) params.creator_id = filters.creator_id;

    const termToUse = currentSearchTerm !== undefined ? currentSearchTerm : this.searchTerm();
    if (termToUse.trim()) {
      params.q = termToUse.trim();
    }
    Object.keys(params).forEach(key => (params as any)[key] === undefined && delete (params as any)[key]);
    return params;
  }

  loadInitialData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      currentUser: this.issueService.getCurrentUserFromAccountService(),
      issueOptions: this.issueService.getIssueOptions()
    }).pipe(
      tap((staticData: any) => {
        this.currentUser.set(staticData.currentUser);
        this.issueOptionsForForm.set(staticData.issueOptions);
        console.log(staticData);
      }),
      switchMap(() => this.fetchIssuesData(this.buildRequestParams())),
      catchError((error: any) => {
        this.errorMessage.set(`Failed to load essential data: ${error.message || 'Unknown error'}`);
        this.isLoading.set(false);
        return of(null);
      })
    ).subscribe();
  }

  fetchIssuesData(params: GetIssuesParams): Observable<PaginatedIssuesResponse | null> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    // Not calling cdr.detectChanges() here as signal updates should trigger template refresh

    return this.issueService.getIssues(params).pipe(
      tap(response => {
        if (response) {
          console.log(response);
          this.issues.set(response.results);
          this.totalIssues.set(response.count);
          if (this.currentSortColumn()) { 
            this.applyClientSideSort(); // This will internally update this.issues signal
          }
        } else {
          this.issues.set([]);
          this.totalIssues.set(0);
        }
      }),
      catchError((error: any) => {
        this.errorMessage.set(`Failed to load issues: ${error.message || 'Unknown error'}`);
        this.issues.set([]);
        this.totalIssues.set(0);
        return of(null); 
      }),
      finalize(() => {
        this.isLoading.set(false);
        // Not calling cdr.detectChanges() here as signal updates should trigger template refresh
      })
    );
  }
  
  onSearchSubmit(): void { 
    this.searchSubject.next(this.searchTerm().trim());
  }

  // Make sure the template calls this with the new value for searchTerm
  onSearchTermChanged(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.searchSubject.next(term.trim());
}
  
  goToPage(page: number): void {
    if (page < 1 || (page -1) * this.itemsPerPage() >= this.totalIssues() && this.totalIssues() > 0) {
        return;
    }
    this.currentPage.set(page);
    this.fetchIssuesData(this.buildRequestParams()).subscribe();
  }

  selectIssueAndNavigate(issue: Issue): void {
    this.router.navigate(['/issues', issue.id]);
  }

  toggleNewIssueForm(): void {
    this.showNewIssueForm.update(v => !v);
  }

  handleIssueCreated(eventPayload: { issueData: NewIssueFormData, files: File[] }): void {
    if (!this.currentUser()) {
      this.toastr.error("Cannot create issue: current user not available.", "Error");
      return;
    }
    this.isLoading.set(true);

    this.issueService.createIssue(eventPayload.issueData).pipe(
      switchMap(createdIssue => {
        if (eventPayload.files && eventPayload.files.length > 0) {
          const attachmentObservables = eventPayload.files.map(file =>
            this.issueService.addAttachment(createdIssue.id, file).pipe(
              catchError(attachError => {
                this.toastr.error(`Failed to upload attachment ${file.name}: ${attachError.message}`, "Attachment Error");
                return of(null); 
              })
            )
          );
          return forkJoin(attachmentObservables).pipe(map(() => createdIssue));
        }
        return of(createdIssue);
      }),
      catchError(err => {
        this.toastr.error(`Failed to create issue: ${err.message || 'Unknown error'}`, "Creation Error");
        return of(null);
      }),
      finalize(() => {
        this.isLoading.set(false);
      })
    ).subscribe(finalIssue => {
      if (finalIssue) {
        this.toastr.success(`Issue #${finalIssue.id} created!`, "Success");
        this.showNewIssueForm.set(false);
        this.currentPage.set(1); 
        this.fetchIssuesData(this.buildRequestParams()).subscribe(() => {
             this.selectIssueAndNavigate(finalIssue); 
        });
      }
    });
  }

  sortBy(column: SortableColumnKey): void {
    if (this.currentSortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.currentSortColumn.set(column);
      this.sortDirection.set('asc');
    }
    this.applyClientSideSort();
  }

  private applyClientSideSort(): void {
    const currentSortCol = this.currentSortColumn();
    if (!currentSortCol || this.issues().length === 0) return;
    
    const sortedIssues = [...this.issues()].sort((a, b) => {
      let valA: any;
      let valB: any;
      switch (currentSortCol) {
        case 'issue_type': valA = a.issue_type?.order ?? a.issue_type?.name; valB = b.issue_type?.order ?? b.issue_type?.name; break;
        case 'severity':   valA = a.severity?.order ?? a.severity?.name;   valB = b.severity?.order ?? b.severity?.name;   break;
        case 'priority':   valA = a.priority?.order ?? a.priority?.name;   valB = b.priority?.order ?? b.priority?.name;   break;
        case 'status':     valA = a.status?.order ?? a.status?.name;     valB = b.status?.order ?? b.status?.name;     break;
        case 'title':      valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); break;
        case 'id':         valA = a.id; valB = b.id; break;
        case 'updated_at': valA = new Date(a.updated_at).getTime(); valB = new Date(b.updated_at).getTime(); break;
        default: return 0;
      }
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      return this.sortDirection() === 'asc' ? comparison : comparison * -1;
    });
    this.issues.set(sortedIssues);
  }

  toggleAssigneeDropdown(issueId: number | string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeAssigneeDropdownForIssueId.update(current => current === issueId ? null : issueId);
  }

  changeAssignee(targetIssue: Issue, newAssignee: UserLite | null, event: MouseEvent): void {
    event.stopPropagation();
    const payload: IssueUpdatePayload = { assignee_id: newAssignee ? newAssignee.id : null };
    this.issueService.updateIssue(targetIssue.id, payload).subscribe({
      next: (updatedIssue) => {
        this.issues.update(currentIssues => 
            currentIssues.map(iss => iss.id === updatedIssue.id ? updatedIssue : iss)
        );
        this.activeAssigneeDropdownForIssueId.set(null);
        this.toastr.success(`Assignee updated for Issue #${targetIssue.id}`, "Success");
      },
      error: (err) => {
        this.toastr.error(`Error updating assignee: ${err.message || 'Unknown error'}`, "Error");
        this.activeAssigneeDropdownForIssueId.set(null);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.activeAssigneeDropdownForIssueId() !== null) {
      const targetElement = event.target as HTMLElement;
      const clickedInsideTriggerOrMenu = targetElement.closest('.assignee-dropdown-trigger, .assignee-dropdown-menu');
      if (!clickedInsideTriggerOrMenu) {
        this.activeAssigneeDropdownForIssueId.set(null);
      }
    }
  }

  getDynamicAvatarColor(username?: string): string {
    if (!username) return this.tailwindColors[0];
    if (this.avatarColorCache.has(username)) return this.avatarColorCache.get(username)!;
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % this.tailwindColors.length;
    const color = this.tailwindColors[index];
    this.avatarColorCache.set(username, color);
    return color;
  }

  getUserInitials(firstName?: string, lastName?: string): string {
    let initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase();
    return initials || '?';
  }

  getBadgeBackgroundColor(color?: string): string {
    return color ? `${color}33` : '#E5E7EB'; 
  }
  getBadgeTextColor(color?: string): string {
    return color || '#374151'; 
  }

  openFiltersModal(): void {
    this.showFiltersModal.set(true);
  }

  handleApplyFilters(filters: AppliedFilters): void {
    this.currentAppliedFilters.set({
        status: filters.status === null ? undefined : filters.status,
        priority: filters.priority === null ? undefined : filters.priority,
        assignee_id: filters.assignee_id === null ? undefined : filters.assignee_id,
        creator_id: filters.creator_id === null ? undefined : filters.creator_id
    });
    this.showFiltersModal.set(false);
    this.currentPage.set(1);
    this.fetchIssuesData(this.buildRequestParams()).subscribe();
  }

  openBulkAddModal(): void {
    this.showBulkAddModal.set(true);
  }

  handleBulkCreateIssues(issuesToCreate: Partial<NewIssueFormData>[]): void {
     if (issuesToCreate.length === 0) {
        this.showBulkAddModal.set(false);
        return;
    }
    this.isLoading.set(true);
    this.issueService.bulkCreateIssues(issuesToCreate).subscribe({
        next: (createdIssues) => {
            this.toastr.success(`${createdIssues.length} issue(s) created successfully!`, "Bulk Add Success");
            this.showBulkAddModal.set(false);
            this.currentPage.set(1); 
            this.fetchIssuesData(this.buildRequestParams()).subscribe();
        },
        error: (err) => {
            this.toastr.error(`Error during bulk creation: ${err.message || 'Unknown error'}`, "Bulk Add Error");
            this.isLoading.set(false); 
        }
    });
  }
}
