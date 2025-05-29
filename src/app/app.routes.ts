// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { IssuesListComponent } from './issues/feature/issues-list/issues-list.component'; // Ajusta la ruta si es diferente

export const routes: Routes = [
  { path: 'issues', component: IssuesListComponent },
  // Si quieres poder navegar directamente a un issue por URL más adelante,
  // podrías tener una ruta como:
  // { path: 'issues/:id', component: IssueComponent }, // Y IssueComponent tomaría el ID de la ruta
  { path: '', redirectTo: '/issues', pathMatch: 'full' }, // Ruta por defecto
  { path: '**', redirectTo: '/issues' } // Ruta comodín, opcional
];
