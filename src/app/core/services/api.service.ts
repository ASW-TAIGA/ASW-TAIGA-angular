import { Injectable, inject, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Import AuthService

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // Inject AuthService
  
  private API_BASE_URL = 'https://asw-taiga.onrender.com/api/v1'; 

  // API_KEY is now derived from AuthService
  private currentApiKey = computed(() => this.authService.currentApiKey());

  private getHeaders(isMultipart: boolean = false): HttpHeaders {
    let headers = new HttpHeaders();
    if (!isMultipart) {
      headers = headers.set('Content-Type', 'application/json');
    }
    
    const apiKey = this.currentApiKey(); // Get key from AuthService
    if (apiKey) {
      headers = headers.set('Authorization', `ApiKey ${apiKey}`);
    }
    return headers;
  }

  get<T>(endpoint: string, params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> }): Observable<T> {
    return this.http.get<T>(`${this.API_BASE_URL}${endpoint}`, { headers: this.getHeaders(), params });
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.API_BASE_URL}${endpoint}`, body, { headers: this.getHeaders() });
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.API_BASE_URL}${endpoint}`, body, { headers: this.getHeaders() });
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.API_BASE_URL}${endpoint}`, body, { headers: this.getHeaders() });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.API_BASE_URL}${endpoint}`, { headers: this.getHeaders() });
  }
  
  postMultipart<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.post<T>(`${this.API_BASE_URL}${endpoint}`, formData, { headers: this.getHeaders(true) });
  }

  patchMultipart<T>(endpoint: string, formData: FormData): Observable<T> {
    return this.http.patch<T>(`${this.API_BASE_URL}${endpoint}`, formData, { headers: this.getHeaders(true) });
  }

  // setApiKey method is removed as AuthService handles API key storage.
}
