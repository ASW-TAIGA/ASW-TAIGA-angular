// src/app/issues/data-access/issue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of } from 'rxjs'; // Asegúrate de importar forkJoin y of
import { catchError, map, tap } from 'rxjs/operators';

// --- INTERFACES (sin cambios) ---
export interface UserLite { id: number; username: string; first_name: string; last_name: string; avatar_url: string; }
export interface StatusDetail { id: number; name: string; color: string; order: number; slug: string; is_closed: boolean; }
export interface IssueTypeDetail { id: number; name: string; color: string; order: number; }
export interface SeverityDetail { id: number; name: string; color: string; order: number; }
export interface PriorityDetail { id: number; name: string; color: string; order: number; }
export interface CommentDetail { id: number; author: UserLite; text: string; created_at: string; updated_at: string; }
export interface AttachmentDetail { id: number; issue: number; file: string; file_name: string; file_size: string; file_url: string; uploaded_at: string; }
export interface Issue { id: number; title: string; description: string; status: StatusDetail; issue_type: IssueTypeDetail; severity: SeverityDetail; priority: PriorityDetail; creator: UserLite; assignee: UserLite | null; created_at: string; updated_at: string; deadline: string | null; watchers: UserLite[]; comments: CommentDetail[]; attachments: AttachmentDetail[]; }
export interface IssueOptions { statusOptions: StatusDetail[]; typeOptions: IssueTypeDetail[]; severityOptions: SeverityDetail[]; priorityOptions: PriorityDetail[]; }
export interface IssueUpdatePayload { title?: string; description?: string; status_id?: number; issue_type_id?: number; severity_id?: number; priority_id?: number; assignee_id?: number | null; deadline?: string | null; watchers_to_add?: number[]; watchers_to_remove?: number[]; }
export interface NewIssueFormData {
  title: string;
  description: string;
  status_id: number | null;
  issue_type_id: number | null; // CAMBIADO de type_id
  severity_id: number | null;
  priority_id: number | null;
  assignee_id: number | null;
  deadline?: string | null;
  watcher_ids?: number[]; // AÑADIDO: para los watchers
}

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  // URL base para los issues (sin la barra final aquí)
  private issuesApiBaseUrl = 'https://asw-taiga-1.onrender.com/api/v1/issues';

  // URL base para settings (si es diferente y se usa en getIssueOptions)
  private settingsApiBaseUrl = 'https://asw-taiga-1.onrender.com/api/v1/settings';

  // URL base general (si es diferente para usuarios, etc.)
  private generalApiBaseUrl = 'https://asw-taiga-1.onrender.com/api/v1';

  constructor(private http: HttpClient) { }

  getIssues(): Observable<Issue[]> {
    console.log('IssueService: Fetching all issues from API:', `${this.issuesApiBaseUrl}/`);
    // Añadimos la barra si el endpoint de lista la requiere
    return this.http.get<Issue[]>(`${this.issuesApiBaseUrl}/`).pipe(
      tap(issues => console.log(`IssueService: Fetched ${issues.length} issues via API`)),
      catchError(this.handleError)
    );
  }

  getIssueOptions(): Observable<IssueOptions> {
    console.log('IssueService: Fetching issue options from API using forkJoin');
    return forkJoin({
      priorityOptions: this.http.get<PriorityDetail[]>(`${this.settingsApiBaseUrl}/priorities/`),
      severityOptions: this.http.get<SeverityDetail[]>(`${this.settingsApiBaseUrl}/severities/`),
      statusOptions:   this.http.get<StatusDetail[]>(`${this.settingsApiBaseUrl}/statuses/`),
      typeOptions:     this.http.get<IssueTypeDetail[]>(`${this.settingsApiBaseUrl}/types/`)
    }).pipe(
      map(results => {
        console.log('IssueService: Combined issue options from API:', results);
        return results as IssueOptions;
      }),
      catchError(this.handleError)
    );
  }

  // --- MÉTODO getIssue ACTUALIZADO ---
  getIssue(issueId: string | number): Observable<Issue> {
    const url = `${this.issuesApiBaseUrl}/${issueId}/`; // Añadida la barra inclinada al final
    console.log(`IssueService: Fetching issue ${issueId} from API: ${url}`);
    return this.http.get<Issue>(url).pipe(
      tap(issue => console.log(`IssueService: Fetched issue ${issueId} via API`, issue)),
      catchError(this.handleError)
    );
  }

  createIssue(issueData: NewIssueFormData, creator: UserLite): Observable<Issue> {
    console.log('IssueService: Creating new issue via API with data:', issueData);

    // Preparamos el payload según lo que espera la API.
    // La API espera IDs numéricos para status, type, severity, priority.
    // NewIssueFormData ya los tiene como number | null.
    // La API espera assignee_id como number (el ejemplo usa 0, que podría ser un ID válido o un placeholder para "no asignado").
    // Si tu API trata `null` para assignee_id como "no asignado", está bien. Si espera que el campo se omita,
    // necesitarías construir el payload condicionalmente.
    // El ejemplo de API no incluye creator_id en el payload, asumiendo que el backend lo infiere.

    const payloadToSend: any = {
      title: issueData.title,
      description: issueData.description || "", // Asegurar que no sea null
      status_id: issueData.status_id,
      issue_type_id: issueData.issue_type_id,
      severity_id: issueData.severity_id,
      priority_id: issueData.priority_id,
      assignee_id: issueData.assignee_id, // Si null es aceptado por el backend para "no asignado"
      deadline: issueData.deadline || null, // Enviar null si no hay fecha
      watcher_ids: issueData.watcher_ids && issueData.watcher_ids.length > 0 ? issueData.watcher_ids : [] // Enviar array vacío si no hay watchers
    };

    // Limpiar propiedades nulas si el backend no las quiere (excepto deadline y assignee_id que podrían ser null explícitamente)
    // Por ejemplo, si status_id es obligatorio y no puede ser null:
    if (payloadToSend.status_id === null) {
      // Manejar error o no enviar, dependiendo de los requisitos de tu API.
      // Por ahora, lo dejamos tal cual asumiendo que el form lo valida.
      console.warn("status_id is null, backend might require it.");
    }
    // Similar para type, severity, priority.

    // Si assignee_id: 0 significa "no asignado" y tu API no acepta null:
    // if (payloadToSend.assignee_id === null) {
    //   payloadToSend.assignee_id = 0; // O elimina la propiedad si es el caso
    // }


    console.log('IssueService: Payload for POST request:', payloadToSend);
    return this.http.post<Issue>(`${this.issuesApiBaseUrl}/`, payloadToSend).pipe(
      tap(createdIssue => console.log('IssueService: Issue created successfully via API. Response:', createdIssue)),
      catchError(this.handleError)
    );
  }

  updateIssue(issueId: string | number, payload: IssueUpdatePayload): Observable<Issue> {
    const url = `${this.issuesApiBaseUrl}/${issueId}/`; // Consistencia con la barra final si el backend la espera
    console.log(`IssueService: Updating issue ${issueId} with payload to API: ${url}`, payload);
    return this.http.patch<Issue>(url, payload).pipe(
      tap(updatedIssue => console.log('IssueService: Issue updated successfully via API', updatedIssue)),
      catchError(this.handleError)
    );
  }

  addAttachment(issueId: number, file: File): Observable<AttachmentDetail> {
    console.log(`IssueService: Adding attachment "${file.name}" for issue ID ${issueId} via API`);
    const formData = new FormData();
    formData.append('file', file, file.name);
    // El endpoint para adjuntos podría ser /api/v1/issues/{issueId}/attachments/
    return this.http.post<AttachmentDetail>(`${this.issuesApiBaseUrl}/${issueId}/attachments/`, formData).pipe(
      tap(attachment => console.log('IssueService: Attachment added via API', attachment)),
      catchError(this.handleError)
    );
  }

  deleteAttachment(issueId: number, attachmentId: number): Observable<void> {
    console.log(`IssueService: Deleting attachment ID ${attachmentId} from issue ID ${issueId} via API`);
    return this.http.delete<void>(`${this.issuesApiBaseUrl}/${issueId}/attachments/${attachmentId}/`).pipe(
      tap(() => console.log(`IssueService: Attachment ${attachmentId} deleted via API`)),
      catchError(this.handleError)
    );
  }

  getProjectUsers(): Observable<UserLite[]> {
    console.log('IssueService: Fetching project users from API');
    return this.http.get<UserLite[]>(`${this.generalApiBaseUrl}/users/`).pipe(
      tap(users => console.log('IssueService: Fetched project users via API', users)),
      catchError(this.handleError)
    );
  }

  getCurrentUser(): Observable<UserLite> {
    console.log('IssueService: Fetching current user from API');
    return this.http.get<UserLite>(`${this.generalApiBaseUrl}/me/`).pipe(
      tap(user => console.log('IssueService: Fetched current user via API', user)),
      catchError(this.handleError)
    );
  }

  deleteIssue(issueId: string | number): Observable<void> {
    console.log(`IssueService: Deleting issue ${issueId} via API`);
    return this.http.delete<void>(`${this.issuesApiBaseUrl}/${issueId}/`).pipe(
      tap(() => console.log(`IssueService: Issue ${issueId} deleted successfully via API`)),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message || 'Server error'}`;
      if (error.error && typeof error.error === 'object') {
        errorMessage += `\nDetails: ${JSON.stringify(error.error)}`;
      } else if (typeof error.error === 'string') {
        errorMessage += `\nDetails: ${error.error}`;
      }
    }
    console.error('API Error in IssueService:', errorMessage, '\nFull Error:', error);
    return throwError(() => new Error('Something bad happened with the API; please try again later. Reported: ' + errorMessage ));
  }
}
