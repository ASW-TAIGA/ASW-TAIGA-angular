import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { AccountService } from '../../accounts/data-access/account.service';
import { UserProfileData } from '../../accounts/models/user.model';

// Interfaces based on API contract and existing structure
export interface UserLite {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

export interface StatusDetail {
  id: number;
  name: string;
  color: string; // Hex color or Tailwind class
  order: number;
  is_closed: boolean; // From existing frontend model, check if backend provides
}

export interface IssueTypeDetail {
  id: number;
  name: string;
  color: string; // Hex color or Tailwind class
  order: number;
}

export interface SeverityDetail {
  id: number;
  name: string;
  color: string; // Hex color or Tailwind class
  order: number;
}

export interface PriorityDetail {
  id: number;
  name: string;
  color: string; // Hex color or Tailwind class
  order: number;
}

export interface CommentDetail {
  id: number;
  author: UserLite;
  text: string;
  created_at: string;
  updated_at: string;
  issue: number; // Issue ID
}

export interface AttachmentDetail {
  id: number;
  issue: number; // Issue ID
  file: string; // URL to the file (read-only from contract)
  file_name: string;
  file_size: number; // Size in bytes
  file_url: string; // Full URL
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

export interface PaginatedIssuesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Issue[];
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
  watcher_ids?: number[]; // Used to set the complete list of watchers
}

export interface NewIssueFormData {
  title: string;
  description?: string;
  status_id?: number | null;
  issue_type_id?: number | null;
  severity_id?: number | null;
  priority_id?: number | null;
  assignee_id?: number | null;
  deadline?: string | null;
  watcher_ids?: number[];
}

export interface GetIssuesParams {
  status?: number; // Changed from status_id to match API contract for GET /issues
  priority?: number; // Changed from priority_id
  assignee_id?: number;
  creator_id?: number;
  q?: string;
  page?: number;
}

// Define and export AppliedFilters here
export interface AppliedFilters {
  status?: number | null; // Matching GetIssuesParams keys
  priority?: number | null;
  assignee_id?: number | null;
  creator_id?: number | null;
}


@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private http = inject(HttpClient);
  private accountService = inject(AccountService);

  private API_BASE_URL = 'http://localhost:8000/api/v1';

  private createAuthHeaders(): HttpHeaders {
    const apiKey = this.accountService.getCurrentApiKeySnapshot();
    if (!apiKey) {
      console.error('IssueService: API Key is not available. Requests will likely fail.');
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `ApiKey ${apiKey}`);
  }

  getIssues(params?: GetIssuesParams): Observable<PaginatedIssuesResponse> {
    const headers = this.createAuthHeaders();
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        // Ensure not to send empty strings for optional params if API expects them to be absent
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return this.http.get<PaginatedIssuesResponse>(`${this.API_BASE_URL}/issues/`, { headers, params: httpParams }).pipe(
      catchError(this.handleError)
    );
  }

  getIssueOptions(): Observable<IssueOptions> {
    const headers = this.createAuthHeaders();
    return forkJoin({
      priorityOptions: this.http.get<PriorityDetail[]>(`${this.API_BASE_URL}/settings/priorities/`, { headers }),
      severityOptions: this.http.get<SeverityDetail[]>(`${this.API_BASE_URL}/settings/severities/`, { headers }),
      statusOptions:   this.http.get<StatusDetail[]>(`${this.API_BASE_URL}/settings/statuses/`, { headers }),
      typeOptions:     this.http.get<IssueTypeDetail[]>(`${this.API_BASE_URL}/settings/types/`, { headers })
    }).pipe(
      map(results => results as IssueOptions),
      tap((results: any) => console.log(results)),
      catchError(this.handleError)
    );
  }

  getIssue(issueId: string | number): Observable<Issue> {
    const headers = this.createAuthHeaders();
    const url = `${this.API_BASE_URL}/issues/${issueId}/`;
    return this.http.get<Issue>(url, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  createIssue(issueData: NewIssueFormData): Observable<Issue> {
    const headers = this.createAuthHeaders();
    const payload: any = {};
    for (const key in issueData) {
      if (Object.prototype.hasOwnProperty.call(issueData, key)) {
        const typedKey = key as keyof NewIssueFormData;
        // Ensure that null values for optional fields are handled correctly by the backend
        // or omit them if the backend prefers them absent.
        if (issueData[typedKey] !== undefined) { // Send if not undefined
            payload[typedKey] = issueData[typedKey];
        }
      }
    }
    if (!payload.watcher_ids) { // Ensure watcher_ids is an array if not provided or undefined
        payload.watcher_ids = [];
    }

    return this.http.post<Issue>(`${this.API_BASE_URL}/issues/`, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  updateIssue(issueId: string | number, payload: IssueUpdatePayload): Observable<Issue> {
    const headers = this.createAuthHeaders();
    const url = `${this.API_BASE_URL}/issues/${issueId}/`;
    // Filter out undefined properties from payload before sending PATCH
    const filteredPayload = Object.entries(payload).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            (acc as any)[key] = value;
        }
        return acc;
    }, {} as IssueUpdatePayload);

    return this.http.patch<Issue>(url, filteredPayload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addAttachment(issueId: number, file: File): Observable<AttachmentDetail> {
    const headers = this.createAuthHeaders();
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('issue', String(issueId));
    return this.http.post<AttachmentDetail>(`${this.API_BASE_URL}/attachments/`, formData, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  deleteAttachment(attachmentId: number): Observable<void> { // Corrected: only one argument
    const headers = this.createAuthHeaders();
    return this.http.delete<void>(`${this.API_BASE_URL}/attachments/${attachmentId}/`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  addComment(issueId: number, text: string): Observable<CommentDetail> {
    const headers = this.createAuthHeaders();
    const payload = { issue: issueId, text: text };
    return this.http.post<CommentDetail>(`${this.API_BASE_URL}/comments/`, payload, { headers }).pipe(
      catchError(this.handleError)
    );
  }
  
  deleteIssue(issueId: string | number): Observable<void> {
    const headers = this.createAuthHeaders();
    return this.http.delete<void>(`${this.API_BASE_URL}/issues/${issueId}/`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  getProjectUsers(): Observable<UserLite[]> {
     const headers = this.createAuthHeaders();
    return this.http.get<UserLite[]>(`${this.API_BASE_URL}/users/`, { headers }).pipe(
       catchError(this.handleError)
    );
  }
  
  getCurrentUserFromAccountService(): Observable<UserLite | null> {
    return this.accountService.currentUserProfile$.pipe(
      map((userProfileData: UserProfileData | null) => {
        if (!userProfileData) return null;
        return {
          id: userProfileData.id,
          username: userProfileData.username,
          first_name: userProfileData.first_name,
          last_name: userProfileData.last_name,
          avatar_url: userProfileData.profile?.avatar_url || null
        };
      })
    );
  }

  bulkCreateIssues(issuesPayload: Partial<NewIssueFormData>[]): Observable<Issue[]> {
    const headers = this.createAuthHeaders();
    return this.http.post<Issue[]>(`${this.API_BASE_URL}/issues/bulk_create/`, issuesPayload, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An API error occurred!';
    if (error.error) {
        if (typeof error.error === 'string') {
            errorMessage = error.error;
        } else if (typeof error.error === 'object') {
            if ((error.error as any).detail) {
                errorMessage = (error.error as any).detail;
            } else if (Array.isArray(error.error) && error.error.length > 0 && typeof error.error[0] === 'string') {
                errorMessage = error.error[0];
            } else {
                try {
                    const messages = Object.values(error.error).flat().join(' ');
                    if (messages) errorMessage = messages;
                } catch (e) {
                    // If error.error is not an object that can be processed this way
                    errorMessage = 'Complex error object received.';
                }
            }
        }
    } else if (error.message) {
        errorMessage = error.message;
    }

    console.error(`IssueService API Error (Status ${error.status}): ${errorMessage}`, error);
    return throwError(() => new Error(errorMessage || 'An unknown API error occurred.'));
  }
}
