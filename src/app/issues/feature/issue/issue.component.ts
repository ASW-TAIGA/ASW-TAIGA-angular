// src/app/issues/feature/issue/issue.component.ts
import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, inject, OnDestroy } from '@angular/core';
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
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
// Eliminar la importación de IssuesListComponent si no se usa en la plantilla de este componente
// import { IssuesListComponent } from '../issues-list/issues-list.component';

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [
    CommonModule,
    IssueSidebarComponent,
    IssueDetailComponent
    // IssuesListComponent, // Eliminar de aquí también
  ],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.css'
})
export class IssueComponent implements OnInit, OnChanges, OnDestroy {
  @Input() issueToShow: Issue | null = null;
  @Input() allIssueIds: (number | string)[] = [];
  @Input() currentUserInput: UserLite | null = null;
  @Input() allProjectUsersInput: UserLite[] = [];

  @Output() changeIssueRequest = new EventEmitter<string | number>();

  private issueService = inject(IssueService);

  private _currentIssueSubject = new BehaviorSubject<Issue | null>(null);
  currentIssue$: Observable<Issue | null> = this._currentIssueSubject.asObservable();

  issueOptions$: Observable<IssueOptions | null> = of(null);
  // Las siguientes propiedades ya no son necesarias como Observables cargados aquí:
  // currentUser$: Observable<UserLite | null> = of(null);
  // allProjectUsers$: Observable<UserLite[]> = of([]);

  issueId: string | null = '123';

  canGoPrevious: boolean = false;
  canGoNext: boolean = false;
  private previousIssueId: string | number | null = null;
  private nextIssueId: string | number | null = null;
  private currentIssueSubscription: Subscription | undefined;

  constructor() {
    console.log('IssueComponent: Constructor - initial issueToShow:', this.issueToShow, 'initial issueId:', this.issueId);
  }

  ngOnInit(): void {
    console.log('IssueComponent: ngOnInit START - issueToShow:', this.issueToShow, 'INTERNAL issueId:', this.issueId, 'ALL ISSUE IDs:', this.allIssueIds);
    this.setupCurrentIssueStream();

    if (this.issueToShow) {
      this._currentIssueSubject.next(this.issueToShow);
      if (this.issueToShow.id !== undefined) this.issueId = String(this.issueToShow.id);
      console.log('IssueComponent: ngOnInit - Using issueToShow from @Input:', this.issueToShow);
    } else if (this.issueId && this.allIssueIds.map(String).includes(String(this.issueId))) {
      console.log(`IssueComponent: ngOnInit - No issueToShow from @Input, attempting to load default issueId: ${this.issueId}`);
      this.loadIssueById(this.issueId);
    } else if (this.allIssueIds.length > 0) {
      console.log(`IssueComponent: ngOnInit - No issueToShow or invalid issueId, loading first from allIssueIds: ${this.allIssueIds[0]}`);
      this.loadIssueById(String(this.allIssueIds[0]));
    } else {
      console.log('IssueComponent: ngOnInit - No issueToShow from @Input and no default issueId/allIssueIds. CurrentIssue will be null.');
      this._currentIssueSubject.next(null);
    }

    this.loadDropdownOptions();
    // loadUserContext() ya no es necesario, los datos vienen por input
    console.log('IssueComponent: ngOnInit END');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('IssueComponent: ngOnChanges - triggered. Changes:', changes);
    if (changes['issueToShow']) {
      const newIssue = changes['issueToShow'].currentValue as Issue | null;
      console.log('IssueComponent: ngOnChanges - issueToShow changed to:', newIssue);
      this._currentIssueSubject.next(newIssue);
      if (newIssue && newIssue.id !== undefined) {
        this.issueId = String(newIssue.id);
      } else {
        this.issueId = null;
        if ((!this.allIssueIds || this.allIssueIds.length === 0) && !this._currentIssueSubject.getValue()) {
          const defaultFallbackId = '123';
          console.log(`IssueComponent: ngOnChanges - issueToShow is null, allIssueIds empty, attempting to load fallback ID: ${defaultFallbackId}`);
          this.loadIssueById(defaultFallbackId);
        }
      }
    }
    if (changes['allIssueIds']) {
      console.log('IssueComponent: ngOnChanges - allIssueIds changed:', this.allIssueIds);
      if (!this.issueToShow && this.allIssueIds && this.allIssueIds.length > 0 && !this._currentIssueSubject.getValue()) {
        console.log('IssueComponent: ngOnChanges - allIssueIds updated, loading first issue from new list.');
        this.loadIssueById(String(this.allIssueIds[0]));
      } else {
        this.updateNavigationState(this._currentIssueSubject.getValue());
      }
    }
    if (changes['currentUserInput']) {
      console.log('IssueComponent: ngOnChanges - currentUserInput updated:', this.currentUserInput);
    }
    if (changes['allProjectUsersInput']) {
      console.log('IssueComponent: ngOnChanges - allProjectUsersInput updated, count:', this.allProjectUsersInput?.length);
    }
  }

  private setupCurrentIssueStream(): void {
    if (this.currentIssueSubscription) {
      this.currentIssueSubscription.unsubscribe();
    }
    this.currentIssueSubscription = this.currentIssue$.subscribe(currentIssue => {
      console.log('IssueComponent: currentIssue$ emitted:', currentIssue ? `ID: ${currentIssue.id}` : 'null');
      this.updateNavigationState(currentIssue);
    });
  }

  private updateNavigationState(currentIssue: Issue | null): void {
    // ... (lógica sin cambios)
    if (currentIssue && currentIssue.id !== undefined && this.allIssueIds && this.allIssueIds.length > 0) {
      const currentIdStr = String(currentIssue.id);
      const currentIndex = this.allIssueIds.findIndex(id => String(id) === currentIdStr);
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
  }

  loadIssueById(id: string | number): void {
    // ... (lógica sin cambios)
    const idStr = String(id);
    this.issueService.getIssue(idStr).subscribe({
      next: (issue) => {
        this._currentIssueSubject.next(issue);
      },
      error: (err) => {
        this._currentIssueSubject.next(null);
      }
    });
  }

  loadDropdownOptions(): void {
    this.issueOptions$ = this.issueService.getIssueOptions().pipe(
      tap(options => console.log('IssueComponent: Loaded issue options', options))
    );
  }

  handleIssueUpdate(event: { field: keyof Issue, value: any, currentIssue: Issue }): void {
    // ... (lógica sin cambios)
    if (!event.currentIssue || !event.currentIssue.id) { return; }
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
    if (Object.keys(payload).length === 0) { return; }
    this.issueService.updateIssue(event.currentIssue.id, payload).subscribe({
      next: (updatedIssue: Issue) => {
        this._currentIssueSubject.next(updatedIssue);
      },
      error: (err: any) => {
        const currentIssueVal = this._currentIssueSubject.getValue();
        if (currentIssueVal && currentIssueVal.id === event.currentIssue.id) {
          this._currentIssueSubject.next(event.currentIssue);
        }
      }
    });
  }

  handleDeleteIssue(issueIdToDelete: number): void {
    // ... (lógica sin cambios)
    this.issueService.deleteIssue(issueIdToDelete).subscribe({
      next: () => {
        alert(`Issue ${issueIdToDelete} deleted successfully!`);
        const currentIssueInStream = this._currentIssueSubject.getValue();
        if (currentIssueInStream && currentIssueInStream.id === issueIdToDelete) {
          this._currentIssueSubject.next(null);
          this.issueId = null;
        }
      },
      error: (err: any) => {
        alert(`Failed to delete issue ${issueIdToDelete}. Please try again.`);
      }
    });
  }

  onNavigateToPreviousRequestedFromDetail(): void {
    // ... (lógica sin cambios)
    if (this.canGoPrevious && this.previousIssueId !== null) {
      this.loadIssueById(String(this.previousIssueId));
    }
  }

  onNavigateToNextRequestedFromDetail(): void {
    // ... (lógica sin cambios)
    if (this.canGoNext && this.nextIssueId !== null) {
      this.loadIssueById(String(this.nextIssueId));
    }
  }

  ngOnDestroy(): void {
    if (this.currentIssueSubscription) {
      this.currentIssueSubscription.unsubscribe();
    }
  }
}
