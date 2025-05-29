// src/app/issues/feature/issues/issue.component.ts
import { OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter, inject } from '@angular/core'; // MODIFICADO: Añadido Output y EventEmitter
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

import { Component, HostListener } from '@angular/core';
import { IssuesListComponent } from '../issues-list/issues-list.component';


@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [
    CommonModule,
    IssueSidebarComponent,
    IssueDetailComponent,
    IssuesListComponent
  ],
  templateUrl: './issue.component.html',
  styleUrl: './issue.component.css'
})
export class IssueComponent implements OnInit, OnChanges {
  @Input() issueToShow: Issue | null = null;

  private issueService = inject(IssueService);

  private _currentIssueSubject = new BehaviorSubject<Issue | null>(null);
  currentIssue$: Observable<Issue | null> = this._currentIssueSubject.asObservable();

  issueOptions$: Observable<IssueOptions | null> = of(null);
  currentUser$: Observable<UserLite | null> = of(null);
  allProjectUsers$: Observable<UserLite[]> = of([]);

  issueId: string | null = '123'; // Default issueId to load

  canGoPrevious: boolean = false;
  canGoNext: boolean = false;
  private previousIssueId: string | number | null = null;
  private nextIssueId: string | number | null = null;
  @Input() allIssueIds: (number | string)[] = [];
  @Output() changeIssueRequest = new EventEmitter<string | number>();
  private currentIssueSubscription: Subscription | undefined;


  constructor() {
    console.log('IssueComponent: Constructor - initial issueToShow:', this.issueToShow, 'initial issueId:', this.issueId);
  }

  ngOnInit(): void {
    console.log('IssueComponent: ngOnInit START - initial issueToShow:', this.issueToShow, 'INTERNAL issueId:', this.issueId);
    this.setupCurrentIssueStream();

    if (this.issueToShow) {
      this._currentIssueSubject.next(this.issueToShow);
      this.issueId = String(this.issueToShow.id);
      console.log('IssueComponent: ngOnInit - Using issueToShow from @Input:', this.issueToShow);
    } else if (this.issueId) {
      console.log(`IssuesComponent: ngOnInit - No issueToShow from @Input, attempting to load default issueId: ${this.issueId}`);
      this.loadIssueById(this.issueId);
    } else {
      console.log('IssueComponent: ngOnInit - No issueToShow from @Input and no default issueId set. CurrentIssue will be null.');
      this._currentIssueSubject.next(null);
    }

    this.loadDropdownOptions();
    this.loadUserContext();
    console.log('IssueComponent: ngOnInit END');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('IssueComponent: ngOnChanges - triggered. Changes:', changes);
    if (changes['issueToShow']) {
      const newIssue = changes['issueToShow'].currentValue as Issue | null;
      console.log('IssueComponent: ngOnChanges - issueToShow changed to:', newIssue);
      this._currentIssueSubject.next(newIssue);
      if (newIssue) {
        this.issueId = String(newIssue.id);
      } else {
        this.issueId = null;
        // Si issueToShow se vuelve null, y queremos cargar un default si no hay allIssueIds para elegir
        if (!this.allIssueIds || this.allIssueIds.length === 0) {
          const defaultFallbackId = '123'; // o cualquier ID que sepas que existe en tus mocks
          console.log(`IssuesComponent: ngOnChanges - issueToShow is null, allIssueIds empty, attempting to load fallback ID: ${defaultFallbackId}`);
          this.loadIssueById(defaultFallbackId);
        }
      }
    }
    if (changes['allIssueIds']) { // Si la lista de todos los IDs cambia
      console.log('IssueComponent: ngOnChanges - allIssueIds changed:', this.allIssueIds);
      this.updateNavigationState(this._currentIssueSubject.getValue());
    }
  }

  private setupCurrentIssueStream(): void {
    if (this.currentIssueSubscription) {
      this.currentIssueSubscription.unsubscribe();
    }
    this.currentIssueSubscription = this.currentIssue$.subscribe(currentIssue => {
      console.log('IssueComponent: currentIssue$ emitted:', currentIssue);
      this.updateNavigationState(currentIssue);
    });
  }

  private updateNavigationState(currentIssue: Issue | null): void {
    // ... (lógica de updateNavigationState sin cambios)
    if (currentIssue && this.allIssueIds && this.allIssueIds.length > 0) {
      const currentIndex = this.allIssueIds.findIndex(id => String(id) === String(currentIssue.id));
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
    console.log(`IssuesComponent: Nav state updated - Prev: ${this.canGoPrevious} (ID: ${this.previousIssueId}), Next: ${this.canGoNext} (ID: ${this.nextIssueId})`);
  }


  loadIssueById(id: string): void {
    console.log(`IssuesComponent: loadIssueById - Calling issueService.getIssue for ID: ${id}`);
    this.issueService.getIssue(id).pipe(
      tap(returnedIssue => console.log('IssueComponent (loadIssueById pipe): Fetched issue data via service', returnedIssue))
    ).subscribe({
      next: (issue) => {
        console.log('IssueComponent (loadIssueById subscribe): SUCCESS - Received issue:', issue);
        this._currentIssueSubject.next(issue);
      },
      error: (err) => {
        console.error(`IssuesComponent (loadIssueById subscribe): ERROR - Loading issue with ID ${id}`, err);
        this._currentIssueSubject.next(null);
      }
    });
  }

  loadDropdownOptions(): void {
    this.issueOptions$ = this.issueService.getIssueOptions().pipe(
      tap(options => console.log('IssueComponent: Loaded issue options', options))
    );
  }

  loadUserContext(): void {
    this.currentUser$ = this.issueService.getCurrentUser();
    this.allProjectUsers$ = this.issueService.getProjectUsers();
  }

  handleIssueUpdate(event: { field: keyof Issue, value: any, currentIssue: Issue }): void {
    // ... (tu método handleIssueUpdate sin cambios, ya tiene buenos logs) ...
    if (!event.currentIssue || !event.currentIssue.id) {
      console.error('IssueComponent: Cannot update issue, current issue or ID is missing.');
      return;
    }
    console.log(`IssuesComponent (LOG A): Received update for field '${String(event.field)}' with value:`, event.value);
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
      console.log('IssueComponent: No valid changes mapped to update payload. Field was:', fieldKey);
      return;
    }
    console.log('IssueComponent (LOG B): About to call issueService.updateIssue() with ID:', event.currentIssue.id, 'and payload:', payload);
    const updateObservable = this.issueService.updateIssue(event.currentIssue.id, payload);
    console.log('IssueComponent (LOG C): Value returned by issueService.updateIssue():', updateObservable);
    if (!updateObservable || typeof updateObservable.subscribe !== 'function') {
      console.error('IssueComponent (LOG D): CRITICAL - issueService.updateIssue() did NOT return a valid Observable!');
      return;
    }
    updateObservable.subscribe({
      next: (updatedIssue: Issue) => {
        console.log('IssueComponent (LOG E) (subscribe): Service returned updatedIssue:', updatedIssue);
        if (updatedIssue && updatedIssue.description !== undefined) {
          console.log('IssueComponent (LOG E) (subscribe): Description in updatedIssue from service:', updatedIssue.description);
        }
        this._currentIssueSubject.next(updatedIssue);
      },
      error: (err: any) => {
        console.error('IssueComponent (LOG F) (subscribe): Error updating issue:', err);
        const currentIssueVal = this._currentIssueSubject.getValue();
        if (currentIssueVal && currentIssueVal.id === event.currentIssue.id) {
          this._currentIssueSubject.next(event.currentIssue);
        }
      }
    });
  }

  handleDeleteIssue(issueIdToDelete: number): void {
    // ... (tu método handleDeleteIssue sin cambios) ...
    console.log(`IssuesComponent: Attempting to delete issue with ID: ${issueIdToDelete}`);
    this.issueService.deleteIssue(issueIdToDelete).subscribe({
      next: () => {
        console.log(`IssuesComponent: Issue ${issueIdToDelete} successfully deleted.`);
        alert(`Issue ${issueIdToDelete} deleted successfully!`);
        const currentIssueInStream = this._currentIssueSubject.getValue();
        if (currentIssueInStream && currentIssueInStream.id === issueIdToDelete) {
          this._currentIssueSubject.next(null);
          this.issueId = null;
          console.log('Current issue view cleared as it was deleted.');
        }
      },
      error: (err: any) => {
        console.error(`IssuesComponent: Error deleting issue ${issueIdToDelete}`, err);
        alert(`Failed to delete issue ${issueIdToDelete}. Please try again.`);
      }
    });
  }

  onNavigateToPreviousRequested(): void {
    if (this.canGoPrevious && this.previousIssueId !== null) {
      console.log('IssueComponent: Navigating to previous issue ID:', this.previousIssueId);
      // this.changeIssueRequest.emit(this.previousIssueId); // Para el padre
      this.issueService.getIssue(this.previousIssueId).subscribe(prevIssue => {
        if(prevIssue) this._currentIssueSubject.next(prevIssue);
      });
    }
  }

  onNavigateToNextRequested(): void {
    if (this.canGoNext && this.nextIssueId !== null) {
      console.log('IssueComponent: Navigating to next issue ID:', this.nextIssueId);
      // this.changeIssueRequest.emit(this.nextIssueId); // Para el padre
      this.issueService.getIssue(this.nextIssueId).subscribe(nextIssue => {
        if(nextIssue) this._currentIssueSubject.next(nextIssue);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.currentIssueSubscription) {
      this.currentIssueSubscription.unsubscribe();
    }
  }
}
