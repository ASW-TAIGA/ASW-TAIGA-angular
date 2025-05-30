import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Issue, IssueStatus, Priority, Severity } from '../../models'; // Added Severity
import { HttpParams } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { forkJoin, of, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface FilterParams {
  status?: number;
  priority?: number;
  assignee_id?: number;
  creator_id?: number;
  q?: string;
}

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './issue-list.component.html',
  styleUrls: ['./issue-list.component.css']
})
export class IssueListComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  Math = Math;

  issues: WritableSignal<Issue[]> = signal([]);
  isLoading = signal(true);
  isLoadingFilters = signal(true);
  error = signal<string | null>(null);

  statuses: WritableSignal<IssueStatus[]> = signal([]);
  priorities: WritableSignal<Priority[]> = signal([]);
  severities: WritableSignal<Severity[]> = signal([]); // Added for consistency if needed by filters or future color logic
  
  currentFilters = signal<FilterParams>({});
  searchTerm = signal('');

  totalCount = computed(() => this.issues().length);
  currentPage = signal(1);
  totalPages = signal(1);


  ngOnInit(): void {
    this.loadFilterOptions().subscribe(() => {
        this.isLoadingFilters.set(false);
        this.loadIssues(); 
    }, () => {
        this.isLoadingFilters.set(false); 
        this.loadIssues(); 
    });
  }

  loadFilterOptions(): Observable<void> {
    this.isLoadingFilters.set(true);
    const statuses$ = this.apiService.get<IssueStatus[]>('/settings/statuses/').pipe(
        catchError(err => {
            console.error('Failed to load statuses for filters', err);
            this.error.update(current => (current ? current + '; ' : '') + 'Failed to load status filters.');
            return of([]);
        })
    );
    const priorities$ = this.apiService.get<Priority[]>('/settings/priorities/').pipe(
        catchError(err => {
            console.error('Failed to load priorities for filters', err);
            this.error.update(current => (current ? current + '; ' : '') + 'Failed to load priority filters.');
            return of([]);
        })
    );
    // Fetch severities if they are to be used in filters or complex color logic
    const severities$ = this.apiService.get<Severity[]>('/settings/severities/').pipe(
        catchError(err => {
            console.error('Failed to load severities for filters', err);
            // this.error.update(current => (current ? current + '; ' : '') + 'Failed to load severity filters.');
            return of([]); // Optional: don't show error if severities are not critical for filters
        })
    );

    return forkJoin([statuses$, priorities$, severities$]).pipe(
      map(([statuses, priorities, severities]) => {
        this.statuses.set(statuses);
        this.priorities.set(priorities);
        this.severities.set(severities);
      })
    );
  }

  loadIssues(filters: FilterParams = this.currentFilters()): void {
    this.isLoading.set(true);
    this.currentFilters.set(filters);

    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status.toString());
    if (filters.priority) params = params.set('priority', filters.priority.toString());
    if (filters.assignee_id) params = params.set('assignee_id', filters.assignee_id.toString());
    if (filters.creator_id) params = params.set('creator_id', filters.creator_id.toString());
    if (filters.q) params = params.set('q', filters.q);

    this.apiService.get<Issue[]>('/issues/', params) 
      .subscribe({
        next: (responseArray) => {
          this.issues.set(responseArray);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.error.update(current => (current ? current + '; ' : '') + 'Failed to load issues. Please try again.');
          console.error(err);
          this.isLoading.set(false);
        }
      });
  }

  onFilterChange(type: 'status' | 'priority', event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    const newFilters = { ...this.currentFilters() };

    if (value) {
      (newFilters as any)[type] = Number(value);
    } else {
      delete (newFilters as any)[type];
    }
    this.loadIssues(newFilters);
  }

  onSearch(): void {
    const newFilters = { ...this.currentFilters(), q: this.searchTerm() || undefined };
    this.loadIssues(newFilters);
  }
  
  clearSearch(): void {
    this.searchTerm.set('');
    const newFilters = { ...this.currentFilters(), q: undefined };
    this.loadIssues(newFilters);
  }

  viewIssue(id: number): void {
    this.router.navigate(['/issues', id]);
  }

  // Utility to determine text color based on background hex
  // This is a very simple heuristic. More sophisticated methods exist.
  getTextColor(backgroundColor: string | undefined | null): string {
    if (!backgroundColor) {
      return '#000000'; // Default to black for undefined/null background
    }
    try {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      // Formula for perceived brightness (Luma)
      const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      return luma > 128 ? '#000000' : '#FFFFFF'; // Dark text for light bg, light text for dark bg
    } catch (e) {
      console.warn('Could not parse background color for text contrast:', backgroundColor, e);
      return '#000000'; // Default to black on error
    }
  }
}
