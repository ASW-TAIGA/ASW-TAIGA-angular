import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewIssueFormData, IssueOptions } from '../../data-access/issue.service';

@Component({
  selector: 'app-bulk-add-issues-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-add-issues-modal.component.html',
})
export class BulkAddIssuesModalComponent {
  @Input() isVisible: boolean = false;
  @Input() issueOptions: IssueOptions | null = null; // For default status/priority

  @Output() closeModal = new EventEmitter<void>();
  @Output() bulkCreate = new EventEmitter<Partial<NewIssueFormData>[]>();

  issueTitles: string = '';
  defaultStatusId: number | null = null;
  defaultPriorityId: number | null = null;
  parsingError: string | null = null;

  onBulkCreate(): void {
    this.parsingError = null;
    if (!this.issueTitles.trim()) {
      this.parsingError = "Please enter at least one issue title.";
      return;
    }
    const titles = this.issueTitles.split('\n').map(title => title.trim()).filter(title => title.length > 0);
    if (titles.length === 0) {
      this.parsingError = "No valid issue titles found. Enter each title on a new line.";
      return;
    }

    const issuesToCreate: Partial<NewIssueFormData>[] = titles.map(title => ({
      title: title,
      status_id: this.defaultStatusId,
      priority_id: this.defaultPriorityId,
      // Add other defaults if needed, e.g., issue_type_id
    }));
    this.bulkCreate.emit(issuesToCreate);
    // closeModal will be handled by parent component on successful creation
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
