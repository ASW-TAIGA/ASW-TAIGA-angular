import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IssuesComponent } from './issues/feature/issues/issues.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IssuesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'taiga-clone';
}
