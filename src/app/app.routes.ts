// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { IssuesListComponent } from './issues/feature/issues-list/issues-list.component'; // Ajusta la ruta si es necesario
import { IssueComponent } from './issues/feature/issue/issue.component';       // Ajusta la ruta si es necesario

export const routes: Routes = [
  {
    path: 'issues',
    component: IssuesListComponent
  },
  {
    path: 'issues/:id', // Ruta para un issue específico
    component: IssueComponent
  },
  {
    path: '',
    redirectTo: '/issues', // Redirige la ruta raíz a /issues
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/issues' // Ruta comodín, redirige cualquier otra cosa a /issues (opcional)
  }
];
