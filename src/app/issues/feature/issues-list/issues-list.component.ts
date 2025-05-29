// src/app/issues/feature/issues-list/issues-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Issue, IssueService, UserLite } from '../../data-access/issue.service'; // Ajusta la ruta si es necesario
import { IssueComponent } from '../issue/issue.component'; // El que contiene detalle+sidebar

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, DatePipe, IssueComponent],
  templateUrl: './issues-list.component.html',
  styleUrls: ['./issues-list.component.css']
})
export class IssuesListComponent implements OnInit {
  private issueService = inject(IssueService);

  issues: Issue[] = [];
  selectedIssue: Issue | null = null;

  currentUser: UserLite | null = null;
  allProjectUsers: UserLite[] = [];
  allIssueIdsForNavigation: (string | number)[] = [];

  isLoading: boolean = true;
  // isLoadingDetails no es necesario si el objeto 'issue' de la lista ya está completo y no re-cargamos
  // isLoadingDetails: boolean = false;

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.selectedIssue = null;

    forkJoin({
      issues: this.issueService.getIssues(),
      currentUser: this.issueService.getCurrentUser(),
      projectUsers: this.issueService.getProjectUsers()
    }).pipe(
      tap(data => console.log('IssuesListComponent: Initial data fetched from service', data)),
      map(data => {
        this.issues = data.issues;
        this.currentUser = data.currentUser;
        this.allProjectUsers = data.projectUsers;
        this.allIssueIdsForNavigation = data.issues.map(issue => issue.id);
        return data;
      }),
      catchError(error => {
        console.error('IssuesListComponent: Error loading initial data', error);
        this.isLoading = false;
        return of(null);
      })
    ).subscribe({
      complete: () => {
        this.isLoading = false;
        console.log('IssuesListComponent: Initial data loading complete.');
      }
    });
  }

  selectIssue(issue: Issue): void {
    console.log('IssuesListComponent: selectIssue - Called with issue ID:', issue.id);
    this.selectedIssue = issue;
    // Forzamos un log para ver el estado inmediatamente después de la asignación
    console.log('IssuesListComponent: selectIssue - this.selectedIssue is now:', this.selectedIssue ? this.selectedIssue.id : 'null');
    // Si esto no funciona, puede ser un problema de detección de cambios. Intenta forzarlo (solo para depurar):
    // setTimeout(() => {
    //   console.log('IssuesListComponent: selectIssue - this.selectedIssue after timeout:', this.selectedIssue ? this.selectedIssue.id : 'null');
    // }, 0);
  }

  deselectIssue(): void {
    console.log('IssuesListComponent: deselectIssue called.');
    this.selectedIssue = null;
    console.log('IssuesListComponent: this.selectedIssue is now:', this.selectedIssue);
  }

  handleChangeIssueRequest(issueId: string | number): void {
    console.log('IssuesListComponent: Received changeIssueRequest for ID:', issueId);
    const issueToSelect = this.issues.find(iss => String(iss.id) === String(issueId));

    if (issueToSelect) {
      this.selectIssue(issueToSelect);
    } else {
      console.warn(`IssuesListComponent: Issue with ID ${issueId} not found in current list. Attempting to fetch...`);
      this.issueService.getIssue(issueId).subscribe({
        next: specificIssue => {
          if (specificIssue) {
            this.selectIssue(specificIssue);
          } else {
            console.warn(`IssuesListComponent: Issue with ID ${issueId} not found via getIssue on navigation.`);
            this.selectedIssue = null;
          }
        },
        error: (err) => {
          console.warn(`IssuesListComponent: Error fetching issue ${issueId} on navigation:`, err);
          this.selectedIssue = null;
        }
      });
    }
  }
}
