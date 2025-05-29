import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Elimina la siguiente línea si IssueComponent ya no se usa directamente aquí:
// import { IssueComponent } from './issues/feature/issue/issue.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // Elimina IssueComponent de este array si solo usas RouterOutlet:
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ASW-TAIGA-angular';
}
