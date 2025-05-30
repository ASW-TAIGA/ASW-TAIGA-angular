import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssueOptions, UserLite, StatusDetail, PriorityDetail } from '../../data-access/issue.service';

export interface AppliedFilters {
  status_id?: number | null;
  priority_id?: number | null;
  assignee_id?: number | null;
  creator_id?: number | null;
}

@Component({
  selector: 'app-filter-issues-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-issues-modal.component.html',
})
export class FilterIssuesModalComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() issueOptions: IssueOptions | null = null;
  @Input() projectUsers: UserLite[] = [];
  @Input() currentFilters: AppliedFilters = {};

  @Output() closeModal = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<AppliedFilters>();

  editableFilters: AppliedFilters = {};

  ngOnInit(): void {
    this.editableFilters = { ...this.currentFilters };
  }

  onApply(): void {
    this.applyFilters.emit(this.editableFilters);
    this.closeModal.emit();
  }

  onClear(): void {
    this.editableFilters = {};
    // Optionally emit empty filters immediately or require apply
    // this.applyFilters.emit({});
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
