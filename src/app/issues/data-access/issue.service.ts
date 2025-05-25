// src/app/issues/data-access/issue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// --- DETAILED INTERFACES ---
export interface UserLite {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface StatusDetail {
  id: number;
  name: string;
  color: string;
  order: number;
  slug: string;
  is_closed: boolean;
}

export interface IssueTypeDetail {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface SeverityDetail {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface PriorityDetail {
  id: number;
  name: string;
  color: string;
  order: number;
}

export interface CommentDetail {
  id: number;
  author: UserLite;
  text: string;
  created_at: string;
  updated_at: string;
}

export interface AttachmentDetail {
  id: number;
  issue: number;
  file: string;
  file_name: string;
  file_size: string;
  file_url: string;
  uploaded_at: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  status: StatusDetail;
  issue_type: IssueTypeDetail;
  severity: SeverityDetail;
  priority: PriorityDetail;
  creator: UserLite;
  assignee: UserLite | null;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  watchers: UserLite[];
  comments: CommentDetail[];
  attachments: AttachmentDetail[];
}

export interface IssueOptions {
  statusOptions: StatusDetail[];
  typeOptions: IssueTypeDetail[];
  severityOptions: SeverityDetail[];
  priorityOptions: PriorityDetail[];
}

export interface IssueUpdatePayload {
  title?: string;
  description?: string;
  status_id?: number;
  issue_type_id?: number;
  severity_id?: number;
  priority_id?: number;
  assignee_id?: number | null;
  deadline?: string | null;
  watchers_to_add?: number[];    // Ensure these are defined if used
  watchers_to_remove?: number[]; // Ensure these are defined if used
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = '/api/issues'; // Replace with your actual API base URL

  constructor(private http: HttpClient) { }

  getIssueOptions(): Observable<IssueOptions> {
    console.log('IssueService: Fetching issue options');
    return of({ // Mock data
      statusOptions: [
        { id: 1, name: 'New', color: 'bg-blue-200', order: 1, slug: 'new', is_closed: false },
        { id: 2, name: 'Open', color: 'bg-blue-500', order: 2, slug: 'open', is_closed: false },
      ],
      typeOptions: [
        { id: 1, name: 'Bug', color: 'bg-red-500', order: 1 },
        { id: 2, name: 'Feature', color: 'bg-blue-500', order: 2 },
      ],
      severityOptions: [
        { id: 1, name: 'Low', color: 'bg-green-400', order: 1 },
        { id: 2, name: 'Normal', color: 'bg-blue-400', order: 2 },
      ],
      priorityOptions: [
        { id: 1, name: 'Low', color: 'bg-green-300', order: 1 },
        { id: 2, name: 'Normal', color: 'bg-yellow-400', order: 2 },
      ]
    });
  }

  getIssue(issueId: string | number): Observable<Issue> {
    console.log(`IssueService: Fetching issue ${issueId}`);
    const mockUser: UserLite = { id: 1, username: 'testuser', first_name: 'Test', last_name: 'User', avatar_url: '' };
    return of({ // Mock data
      id: Number(issueId),
      title: 'Sample API Issue Title',
      description: 'This is a sample description from the new API structure.',
      status: { id: 2, name: 'Open', color: 'bg-blue-500', order: 2, slug: 'open', is_closed: false },
      issue_type: { id: 1, name: 'Bug', color: 'bg-red-500', order: 1 },
      severity: { id: 2, name: 'Normal', color: 'bg-blue-400', order: 2 },
      priority: { id: 2, name: 'Normal', color: 'bg-yellow-400', order: 2 },
      creator: mockUser,
      assignee: mockUser,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deadline: null,
      watchers: [mockUser],
      comments: [],
      attachments: []
    });
    // Actual call:
    // return this.http.get<Issue>(`${this.apiUrl}/${issueId}`).pipe(catchError(this.handleError));
  }

  updateIssue(issueId: string | number, changes: IssueUpdatePayload): Observable<Issue> {
    console.log(`IssueService: Updating issue ${issueId} with payload`, changes);
    return this.http.patch<Issue>(`${this.apiUrl}/${issueId}`, changes).pipe(
      tap(updatedIssue => console.log('Issue updated successfully via API', updatedIssue)),
      catchError(this.handleError)
    );
  }

  getProjectUsers(): Observable<UserLite[]> {
    console.log('IssueService: Fetching project users');
    return of([ // Mock data
      { id: 1, username: 'currentuser', first_name: 'Current', last_name: 'User', avatar_url: '' },
      { id: 2, username: 'anotheruser', first_name: 'Another', last_name: 'Person', avatar_url: '' },
    ]);
    // Actual call:
    // return this.http.get<UserLite[]>(`/api/project-users`).pipe(catchError(this.handleError));
  }
  deleteIssue(issueId: string | number): Observable<void> {
    console.log(`IssueService: Deleting issue ${issueId}`);
    return this.http.delete<void>(`${this.apiUrl}/${issueId}`).pipe(
      tap(() => console.log(`Issue ${issueId} deleted successfully via API`)),
      catchError(this.handleError)
    );
  }
  getCurrentUser(): Observable<UserLite> {
    console.log('IssueService: Fetching current user');
    return of({ id: 1, username: 'currentuser', first_name: 'Current', last_name: 'User', avatar_url: '' }); // Mock
    // Actual call:
    // return this.http.get<UserLite>(`/api/current-user`).pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error('Something bad happened with the API; please try again later.'));
  }
}
