// src/app/issues/feature/issues/issues.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IssueSidebarComponent } from './issue-sidebar.component';
import {
  IssueService,
  Issue,
  IssueOptions,
  IssueUpdatePayload,
  UserLite
} from '../../data-access/issue.service';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
// import { Router } from '@angular/router'; // Descomenta si vas a navegar

@Component({
  selector: 'app-issues',
  standalone: true,
  imports: [CommonModule, IssueSidebarComponent],
  templateUrl: './issues.component.html',
  styleUrl: './issues.component.css'
})
export class IssuesComponent implements OnInit {
  private issueService = inject(IssueService);
  // private router = inject(Router); // Descomenta si vas a navegar

  currentIssue$: Observable<Issue | null> = of(null);
  issueOptions$: Observable<IssueOptions | null> = of(null);
  currentUser$: Observable<UserLite | null> = of(null);
  allProjectUsers$: Observable<UserLite[]> = of([]);

  private issueId = '123'; // ID del issue actual, asegúrate que se obtiene dinámicamente si es necesario

  ngOnInit(): void {
    this.loadIssueData(); // Renombrado para claridad
    this.loadDropdownOptions();
    this.loadUserContext();
  }

  loadIssueData(): void {
    this.currentIssue$ = this.issueService.getIssue(this.issueId).pipe(
      tap(issue => console.log('IssuesComponent: Loaded issue data', issue))
    );
  }

  loadDropdownOptions(): void { // Renombrado para claridad
    this.issueOptions$ = this.issueService.getIssueOptions().pipe(
      tap(options => console.log('IssuesComponent: Loaded issue options', options))
    );
  }

  loadUserContext(): void { // Nuevo método
    this.currentUser$ = this.issueService.getCurrentUser();
    this.allProjectUsers$ = this.issueService.getProjectUsers();
  }


  handleIssueUpdate(event: { field: keyof Issue, value: any, currentIssue: Issue }): void {
    // ... (tu lógica de handleIssueUpdate existente)
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
    console.log(`IssuesComponent: Attempting to delete issue with ID: ${issueIdToDelete}`);
    this.issueService.deleteIssue(issueIdToDelete).subscribe({
      next: () => {
        console.log(`IssuesComponent: Issue ${issueIdToDelete} successfully deleted.`);
        alert(`Issue ${issueIdToDelete} deleted successfully!`); // Simple feedback

        // Lógica post-borrado:
        // Si el issue borrado es el que se está mostrando actualmente, límpialo.
        if (String(this.issueId) === String(issueIdToDelete)) { // Comparar como strings por si acaso
          this.currentIssue$ = of(null); // Limpia la vista actual
          // Aquí podrías navegar a otra página, por ejemplo, la lista de issues:
          // this.router.navigate(['/issues']); // Si tienes un router configurado
          console.log('Current issue view cleared as it was deleted.');
        } else {
          // Si se borró otro issue (ej. desde una lista, no aplicable aquí aún),
          // podrías refrescar la lista.
        }
      },
      error: (err: any) => {
        console.error(`IssuesComponent: Error deleting issue ${issueIdToDelete}`, err);
        alert(`Failed to delete issue ${issueIdToDelete}. Please try again.`); // Simple feedback
      }
    });
  }
}
