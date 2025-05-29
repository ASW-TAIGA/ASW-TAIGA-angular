// src/app/issues/feature/issue-detail/issue-detail.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Issue } from '../../data-access/issue.service';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnChanges {
  @Input() issue: Issue | null = null;

  // Nuevos Inputs para la navegación
  @Input() canGoPrevious: boolean = false;
  @Input() canGoNext: boolean = false;

  // Nuevos Outputs para solicitar la navegación
  @Output() navigateToPrevious = new EventEmitter<void>();
  @Output() navigateToNext = new EventEmitter<void>();
  @Output() issuePropertyChange = new EventEmitter<{ field: 'description', value: string, currentIssue: Issue }>();

  isEditingDescription: boolean = false;
  editableDescription: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issue'] && this.issue) {
      if (!this.isEditingDescription) {
        this.editableDescription = this.issue.description;
      }
    }
  }

  startEditDescription(): void {
    if (this.issue) {
      this.editableDescription = this.issue.description;
      this.isEditingDescription = true;
    }
  }

  saveDescription(): void {
    if (this.issue) {
      this.issuePropertyChange.emit({
        field: 'description',
        value: this.editableDescription,
        currentIssue: this.issue
      });
      this.isEditingDescription = false;
    }
  }

  cancelEditDescription(): void {
    if (this.issue) {
      this.editableDescription = this.issue.description;
      this.isEditingDescription = false;
    }
  }

  // Métodos para emitir eventos de navegación
  onNavigateToPrevious(): void {
    if (this.canGoPrevious) {
      this.navigateToPrevious.emit();
    }
  }

  onNavigateToNext(): void {
    if (this.canGoNext) {
      this.navigateToNext.emit();
    }
  }
}
