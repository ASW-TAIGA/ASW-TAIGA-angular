import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IssueDetailDescComponent } from './issues/feature/issue-detail-desc/issue-detail-desc.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IssueDetailDescComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'taiga-clone';
}
