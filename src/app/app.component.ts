// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// Ya no se importa IssueComponent aquí si se maneja por rutas

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet], // Solo RouterOutlet
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'taiga-clone'; // O el título que tuvieras
}
