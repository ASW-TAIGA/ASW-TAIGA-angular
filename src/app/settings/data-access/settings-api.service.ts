import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EpicStatus,
  UserStoryStatus,
  IssueStatus,
  TaskStatus,
  Priority,
  Severity,
  IssueType,
  CreateEpicStatusDTO,
  UpdateEpicStatusDTO,
  CreateUserStoryStatusDTO,
  UpdateUserStoryStatusDTO,
  CreateIssueStatusDTO,
  UpdateIssueStatusDTO,
  CreateTaskStatusDTO,
  UpdateTaskStatusDTO,
  CreatePriorityDTO,
  UpdatePriorityDTO,
  CreateSeverityDTO,
  UpdateSeverityDTO,
  CreateIssueTypeDTO,
  UpdateIssueTypeDTO,
} from '../models/settings.interfaces';

@Injectable({
  providedIn: 'root',
})
export class SettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/settings'; // Assuming a base URL for your settings API

  getEpicStatuses(): Observable<EpicStatus[]> {
    return this.http.get<EpicStatus[]>(`${this.baseUrl}/epic-statuses/`);
  }

  addEpicStatus(data: CreateEpicStatusDTO): Observable<EpicStatus> {
    return this.http.post<EpicStatus>(`${this.baseUrl}/epic-statuses/`, data);
  }

  updateEpicStatus(
    id: number,
    data: UpdateEpicStatusDTO
  ): Observable<EpicStatus> {
    return this.http.put<EpicStatus>(
      `${this.baseUrl}/epic-statuses/${id}/`,
      data
    );
  }

  deleteEpicStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/epic-statuses/${id}/`);
  }

  getUserStoryStatuses(): Observable<UserStoryStatus[]> {
    return this.http.get<UserStoryStatus[]>(
      `${this.baseUrl}/user-story-statuses/`
    );
  }

  addUserStoryStatus(
    data: CreateUserStoryStatusDTO
  ): Observable<UserStoryStatus> {
    return this.http.post<UserStoryStatus>(
      `${this.baseUrl}/user-story-statuses/`,
      data
    );
  }

  updateUserStoryStatus(
    id: number,
    data: UpdateUserStoryStatusDTO
  ): Observable<UserStoryStatus> {
    return this.http.put<UserStoryStatus>(
      `${this.baseUrl}/user-story-statuses/${id}/`,
      data
    );
  }

  deleteUserStoryStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user-story-statuses/${id}/`);
  }

  getIssueStatuses(): Observable<IssueStatus[]> {
    return this.http.get<IssueStatus[]>(`${this.baseUrl}/issue-statuses/`);
  }

  addIssueStatus(data: CreateIssueStatusDTO): Observable<IssueStatus> {
    return this.http.post<IssueStatus>(`${this.baseUrl}/issue-statuses/`, data);
  }

  updateIssueStatus(
    id: number,
    data: UpdateIssueStatusDTO
  ): Observable<IssueStatus> {
    return this.http.put<IssueStatus>(
      `${this.baseUrl}/issue-statuses/${id}/`,
      data
    );
  }

  deleteIssueStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/issue-statuses/${id}/`);
  }

  getTaskStatuses(): Observable<TaskStatus[]> {
    return this.http.get<TaskStatus[]>(`${this.baseUrl}/task-statuses/`);
  }

  addTaskStatus(data: CreateTaskStatusDTO): Observable<TaskStatus> {
    return this.http.post<TaskStatus>(`${this.baseUrl}/task-statuses/`, data);
  }

  updateTaskStatus(
    id: number,
    data: UpdateTaskStatusDTO
  ): Observable<TaskStatus> {
    return this.http.put<TaskStatus>(
      `${this.baseUrl}/task-statuses/${id}/`,
      data
    );
  }

  deleteTaskStatus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/task-statuses/${id}/`);
  }

  getPriorities(): Observable<Priority[]> {
    return this.http.get<Priority[]>(`${this.baseUrl}/priorities/`);
  }

  addPriority(data: CreatePriorityDTO): Observable<Priority> {
    return this.http.post<Priority>(`${this.baseUrl}/priorities/`, data);
  }

  updatePriority(id: number, data: UpdatePriorityDTO): Observable<Priority> {
    return this.http.put<Priority>(`${this.baseUrl}/priorities/${id}/`, data);
  }

  deletePriority(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/priorities/${id}/`);
  }

  getSeverities(): Observable<Severity[]> {
    return this.http.get<Severity[]>(`${this.baseUrl}/severities/`);
  }

  addSeverity(data: CreateSeverityDTO): Observable<Severity> {
    return this.http.post<Severity>(`${this.baseUrl}/severities/`, data);
  }

  updateSeverity(id: number, data: UpdateSeverityDTO): Observable<Severity> {
    return this.http.put<Severity>(`${this.baseUrl}/severities/${id}/`, data);
  }

  deleteSeverity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/severities/${id}/`);
  }

  getIssueTypes(): Observable<IssueType[]> {
    return this.http.get<IssueType[]>(`${this.baseUrl}/issue-types/`);
  }

  addIssueType(data: CreateIssueTypeDTO): Observable<IssueType> {
    return this.http.post<IssueType>(`${this.baseUrl}/issue-types/`, data);
  }

  updateIssueType(id: number, data: UpdateIssueTypeDTO): Observable<IssueType> {
    return this.http.put<IssueType>(`${this.baseUrl}/issue-types/${id}/`, data);
  }

  deleteIssueType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/issue-types/${id}/`);
  }
}
