// src/app/issues/data-access/issue.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { map, tap, delay } from 'rxjs/operators';

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

const MOCK_DELAY = 300;
const mockUser1: UserLite = { id: 1, username: 'currentuser', first_name: 'Ana', last_name: 'Pérez', avatar_url: 'https://www.gravatar.com/avatar/ana?d=mp' };
const mockUser2: UserLite = { id: 2, username: 'anotheruser', first_name: 'Luis', last_name: 'Gómez', avatar_url: 'https://www.gravatar.com/avatar/luis?d=mp' };
const mockUser3: UserLite = { id: 3, username: 'teammate', first_name: 'Sara', last_name: 'Connor', avatar_url: '' };
const mockStatusOpen: StatusDetail = { id: 2, name: 'Open', color: 'bg-blue-500', order: 2, slug: 'open', is_closed: false };
const mockStatusInProgress: StatusDetail = { id: 3, name: 'In Progress', color: 'bg-yellow-500', order: 3, slug: 'in-progress', is_closed: false };
const mockTypeBug: IssueTypeDetail = { id: 1, name: 'Bug', color: 'bg-red-500', order: 1 };
const mockSeverityNormal: SeverityDetail = { id: 2, name: 'Normal', color: 'bg-blue-400', order: 2 };
const mockPriorityNormal: PriorityDetail = { id: 2, name: 'Normal', color: 'bg-yellow-400', order: 2 };
const mockProjectUsers: UserLite[] = [mockUser1, mockUser2, mockUser3];

let mockIssuesDb: Issue[] = [
  {
    id: 123, // ID por defecto que IssuesComponent intenta cargar
    title: 'Issue de prueba 123: Arreglar el login',
    description: 'La descripción inicial DEL MOCK para el issue 123 sobre el login.',
    status: mockStatusOpen, // Asegúrate que estas variables mock estén definidas arriba
    issue_type: mockTypeBug, // Asegúrate que estas variables mock estén definidas arriba
    severity: mockSeverityNormal, // Asegúrate que estas variables mock estén definidas arriba
    priority: mockPriorityNormal, // Asegúrate que estas variables mock estén definidas arriba
    creator: mockUser1,
    assignee: mockUser2,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    deadline: null,
    watchers: [mockUser1, mockUser3],
    comments: [
      {id: 1, author: mockUser2, text: "Estoy en ello.", created_at: new Date(Date.now() - 3600000 * 5).toISOString(), updated_at: new Date(Date.now() - 3600000 * 5).toISOString()},
      {id: 2, author: mockUser1, text: "¡Genial, gracias!", created_at: new Date(Date.now() - 3600000 * 4).toISOString(), updated_at: new Date(Date.now() - 3600000 * 4).toISOString()}
    ],
    // ----> ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ <----
    attachments: [{
      id: 1,
      issue: 123,
      file: "/uploads/dummy.pdf",
      file_name: "dummy.pdf",
      file_size: "1.2MB",
      file_url: "/uploads/dummy.pdf",
      uploaded_at: new Date().toISOString()
    }]
  },{ id: 456, title: 'Issue de prueba 456: Implementar nueva característica', description: 'Descripción para la nueva característica X.', status: mockStatusInProgress, issue_type: { id: 2, name: 'Feature', color: 'bg-blue-500', order: 2 }, severity: { id: 1, name: 'Low', color: 'bg-green-400', order: 1 }, priority: { id: 1, name: 'Low', color: 'bg-green-300', order: 1 }, creator: mockUser2, assignee: null, created_at: new Date(Date.now() - 86400000 * 3).toISOString(), updated_at: new Date().toISOString(), deadline: new Date(Date.now() + 86400000 * 7).toISOString(), watchers: [mockUser2], comments: [], attachments: [] }
];

@Injectable({
  providedIn: 'root'
})
export class IssueService {
  private apiUrl = '/api/issues';
  private projectApiUrl = '/api';

  constructor(private http: HttpClient) { }

  // Helper para obtener las opciones mockeadas consistentemente
  private getMockedIssueOptions(): IssueOptions {
    return {
      statusOptions: [ { id: 1, name: 'New', color: 'bg-gray-400', order: 1, slug: 'new', is_closed: false }, mockStatusOpen, mockStatusInProgress, { id: 4, name: 'Resolved', color: 'bg-green-500', order: 4, slug: 'resolved', is_closed: true }, { id: 5, name: 'Closed', color: 'bg-purple-500', order: 5, slug: 'closed', is_closed: true } ],
      typeOptions: [ mockTypeBug, { id: 2, name: 'Feature', color: 'bg-blue-500', order: 2 }, { id: 3, name: 'Task', color: 'bg-teal-500', order: 3 } ],
      severityOptions: [ { id: 1, name: 'Low', color: 'bg-green-400', order: 1 }, mockSeverityNormal, { id: 3, name: 'High', color: 'bg-orange-500', order: 3 }, { id: 4, name: 'Critical', color: 'bg-red-700', order: 4 } ],
      priorityOptions: [ { id: 1, name: 'Low', color: 'bg-green-300', order: 1 }, mockPriorityNormal, { id: 3, name: 'High', color: 'bg-orange-400', order: 3 }, { id: 4, name: 'Urgent', color: 'bg-red-600', order: 4 } ]
    };
  }

  getIssueOptions(): Observable<IssueOptions> {
    console.log('IssueService: Fetching issue options (MOCK)');
    const options = this.getMockedIssueOptions();
    return of(options).pipe(delay(MOCK_DELAY));
  }
  getIssues(): Observable<Issue[]> {
    console.log('IssueService: Fetching all issues (MOCK)');
    // Devolvemos una copia de la base de datos mock para simular inmutabilidad
    // y que cada llamada obtenga el estado actual de mockIssuesDb.
    return of(mockIssuesDb.map(issue => ({...issue, attachments: [...issue.attachments], comments: [...issue.comments], watchers: [...issue.watchers]})))
      .pipe(
        delay(MOCK_DELAY), // Simular un pequeño retraso
        tap(issues => console.log(`IssueService: Emitting ${issues.length} issues (MOCK)`))
      );
  }
  getIssue(issueId: string | number): Observable<Issue> {
    console.log(`IssueService: Fetching issue ${issueId} (MOCK)`);
    const numericId = Number(issueId);
    const foundIssue = mockIssuesDb.find(issue => issue.id === numericId);
    if (foundIssue) {
      return of({...foundIssue}).pipe(delay(MOCK_DELAY));
    }
    return throwError(() => new Error(`Mock Issue with ID ${issueId} not found`)).pipe(delay(MOCK_DELAY));
  }

  // Sobrecargas para findOptionById_typed
  private findOptionById_typed(id: number, optionType: 'statusOptions'): StatusDetail | undefined;
  private findOptionById_typed(id: number, optionType: 'typeOptions'): IssueTypeDetail | undefined;
  private findOptionById_typed(id: number, optionType: 'severityOptions'): SeverityDetail | undefined;
  private findOptionById_typed(id: number, optionType: 'priorityOptions'): PriorityDetail | undefined;
  // Implementación
  private findOptionById_typed(
    id: number,
    optionType: keyof IssueOptions
  ): StatusDetail | IssueTypeDetail | SeverityDetail | PriorityDetail | undefined {
    const options = this.getMockedIssueOptions();
    switch (optionType) {
      case 'statusOptions':
        return options.statusOptions.find(opt => opt.id === id);
      case 'typeOptions':
        return options.typeOptions.find(opt => opt.id === id);
      case 'severityOptions':
        return options.severityOptions.find(opt => opt.id === id);
      case 'priorityOptions':
        return options.priorityOptions.find(opt => opt.id === id);
      default:
        return undefined;
    }
  }

  updateIssue(issueId: string | number, payload: IssueUpdatePayload): Observable<Issue> {
    console.log(`IssueService: MOCK - Updating issue ${issueId} with payload`, payload);
    const numericId = Number(issueId);
    const issueIndex = mockIssuesDb.findIndex(issue => issue.id === numericId);

    if (issueIndex > -1) {
      const originalIssue = mockIssuesDb[issueIndex];
      const updatedIssue: Issue = {
        ...originalIssue,
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.deadline !== undefined && { deadline: payload.deadline }),
        updated_at: new Date().toISOString(),
      };

      if (payload.status_id !== undefined) {
        const newStatus = this.findOptionById_typed(payload.status_id, 'statusOptions');
        if (newStatus) updatedIssue.status = newStatus; // Esto ahora debería funcionar sin error de tipo
      }
      if (payload.issue_type_id !== undefined) {
        const newType = this.findOptionById_typed(payload.issue_type_id, 'typeOptions');
        if (newType) updatedIssue.issue_type = newType;
      }
      if (payload.severity_id !== undefined) {
        const newSeverity = this.findOptionById_typed(payload.severity_id, 'severityOptions');
        if (newSeverity) updatedIssue.severity = newSeverity;
      }
      if (payload.priority_id !== undefined) {
        const newPriority = this.findOptionById_typed(payload.priority_id, 'priorityOptions');
        if (newPriority) updatedIssue.priority = newPriority;
      }
      if (payload.assignee_id !== undefined) {
        updatedIssue.assignee = payload.assignee_id ? mockProjectUsers.find(u => u.id === payload.assignee_id) || null : null;
      }
      if (payload.watchers_to_add) {
        payload.watchers_to_add.forEach(userId => {
          const userToAdd = mockProjectUsers.find(u => u.id === userId);
          if (userToAdd && !updatedIssue.watchers.some(w => w.id === userId)) {
            updatedIssue.watchers = [...updatedIssue.watchers, userToAdd];
          }
        });
      }
      if (payload.watchers_to_remove) {
        payload.watchers_to_remove.forEach(userId => {
          updatedIssue.watchers = updatedIssue.watchers.filter(w => w.id !== userId);
        });
      }

      mockIssuesDb[issueIndex] = updatedIssue;
      console.log('IssueService: MOCK - Returning updated issue:', {...updatedIssue});
      return of({...updatedIssue}).pipe(delay(MOCK_DELAY));
    }
    return throwError(() => new Error(`Mock Issue ${issueId} not found for update`)).pipe(delay(MOCK_DELAY));
  }
  addAttachment(issueId: number, file: File): Observable<AttachmentDetail> {
    console.log(`IssueService: MOCK - Adding attachment "${file.name}" for issue ID ${issueId}`);

    // Simular la subida del archivo y la respuesta del backend.
    // En una implementación real, aquí harías una petición POST con FormData.
    // El backend guardaría el archivo y devolvería los detalles del adjunto.

    const newAttachmentId = Math.floor(Math.random() * 10000) + 1000; // ID aleatorio para el mock
    const mockFileUrl = `/uploads/mock/${file.name.replace(/\s+/g, '_')}`; // URL simulada

    const newAttachment: AttachmentDetail = {
      id: newAttachmentId,
      issue: issueId,
      file: mockFileUrl, // En un backend real, esto podría ser una ruta interna o un identificador del archivo
      file_name: file.name,
      file_size: `${(file.size / 1024).toFixed(2)} KB`, // Formatear tamaño
      file_url: mockFileUrl, // URL pública para descarga
      uploaded_at: new Date().toISOString()
    };

    // Simular la adición a la "base de datos" mock
    const issueIndex = mockIssuesDb.findIndex(issue => issue.id === issueId);
    if (issueIndex > -1) {
      mockIssuesDb[issueIndex].attachments.push(newAttachment);
      console.log('IssueService: MOCK - Attachment added to mockIssuesDb:', newAttachment);
      console.log('IssueService: MOCK - Current attachments for issue', issueId, mockIssuesDb[issueIndex].attachments);
    } else {
      console.warn(`IssueService: MOCK - Issue with ID ${issueId} not found in mockIssuesDb for adding attachment.`);
    }

    return of(newAttachment).pipe(
      delay(MOCK_DELAY + 200), // Simular un poco más de retraso para la subida
      tap(attachment => console.log('IssueService: MOCK - Emitting new attachment:', attachment))
    );
  }
  getProjectUsers(): Observable<UserLite[]> {
    console.log('IssueService: Fetching project users (MOCK)');
    return of([...mockProjectUsers]).pipe(delay(MOCK_DELAY));
  }

  getCurrentUser(): Observable<UserLite> {
    console.log('IssueService: Fetching current user (MOCK)');
    return of({...mockUser1}).pipe(delay(MOCK_DELAY));
  }
  deleteAttachment(issueId: number, attachmentId: number): Observable<void> {
    console.log(`IssueService: MOCK - Deleting attachment ID ${attachmentId} from issue ID ${issueId}`);
    const issueIndex = mockIssuesDb.findIndex(issue => issue.id === issueId);

    if (issueIndex > -1) {
      const originalAttachmentCount = mockIssuesDb[issueIndex].attachments.length;
      mockIssuesDb[issueIndex].attachments = mockIssuesDb[issueIndex].attachments.filter(
        att => att.id !== attachmentId
      );

      if (mockIssuesDb[issueIndex].attachments.length < originalAttachmentCount) {
        console.log(`IssueService: MOCK - Attachment ${attachmentId} deleted from mockIssuesDb for issue ${issueId}. New count: ${mockIssuesDb[issueIndex].attachments.length}`);
        return of(undefined).pipe(delay(MOCK_DELAY)); // Simula éxito sin contenido
      } else {
        console.warn(`IssueService: MOCK - Attachment ${attachmentId} not found in issue ${issueId} for deletion.`);
        return throwError(() => new Error(`Mock Attachment ${attachmentId} not found in issue ${issueId}`)).pipe(delay(MOCK_DELAY));
      }
    } else {
      console.warn(`IssueService: MOCK - Issue ${issueId} not found for deleting attachment.`);
      return throwError(() => new Error(`Mock Issue ${issueId} not found`)).pipe(delay(MOCK_DELAY));
    }
  }
  deleteIssue(issueId: string | number): Observable<void> {
    console.log(`IssueService: Deleting issue ${issueId} (MOCK)`);
    const numericId = Number(issueId);
    const issueIndex = mockIssuesDb.findIndex(issue => issue.id === numericId);
    if (issueIndex > -1) {
      mockIssuesDb.splice(issueIndex, 1);
      console.log(`Mock: Issue ${numericId} deleted successfully.`);
      return of(undefined).pipe(delay(MOCK_DELAY));
    }
    return throwError(() => new Error(`Mock Issue ${numericId} not found for deletion`)).pipe(delay(MOCK_DELAY));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred (this should not happen with full mocks)!';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Backend error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error('API Error (handleError called):', errorMessage, error);
    return throwError(() => new Error('Something bad happened; please try again later. Error: ' + errorMessage ));
  }
}
