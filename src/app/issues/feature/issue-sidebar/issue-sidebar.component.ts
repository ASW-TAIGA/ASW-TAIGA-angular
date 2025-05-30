import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Issue,
  IssueTypeDetail,
  SeverityDetail,
  PriorityDetail,
  StatusDetail,
  UserLite,
  IssueUpdatePayload // Import IssueUpdatePayload
} from '../../data-access/issue.service';
import { UserManagementComponent } from '../../ui/user-management/user-management.component';

type IssueFieldWithOptions = 'issue_type' | 'severity' | 'priority' | 'status';

// Define the event payload structure expected by IssueComponent
export type IssuePropertyUpdateEvent = {
  field: keyof IssueUpdatePayload | 'watchers_action'; // 'watchers_action' is a special case
  value: any;
  currentIssueId: number;
};

@Component({
  selector: 'app-issue-sidebar',
  standalone: true,
  imports: [CommonModule, UserManagementComponent],
  templateUrl: './issue-sidebar.component.html',
  styleUrls: ['./issue-sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueSidebarComponent implements OnChanges {
  @Input() issue!: Issue;
  @Input() typeOptions: IssueTypeDetail[] = [];
  @Input() severityOptions: SeverityDetail[] = [];
  @Input() priorityOptions: PriorityDetail[] = [];
  @Input() statusOptions: StatusDetail[] = [];
  @Input() currentUser!: UserLite | null;
  @Input() allProjectUsers: UserLite[] = [];

  @Output() issuePropertyChange = new EventEmitter<IssuePropertyUpdateEvent>();
  @Output() deleteIssueInitiated = new EventEmitter<number>();

  // editableIssue is used for local display before confirming changes,
  // but actual changes are sent via event with IDs.
  // For simplicity, we can directly use @Input issue for display if not editing locally first.
  // Let's assume 'issue' is the source of truth for display.

  showDatePicker = false;
  dropdown = {
    issue_type: false,
    severity: false,
    priority: false,
    status: false
  };
  activeDropdownButton: HTMLButtonElement | null = null;

  constructor(private eRef: ElementRef, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issue'] && changes['issue'].currentValue) {
      // No need for editableIssue if we emit changes directly
      this.cdr.markForCheck();
    }
  }

  onDeleteIssueClicked(): void {
    if (!this.issue || typeof this.issue.id === 'undefined') {
      return;
    }
    // Confirmation can be handled by parent or here.
    // For now, assume parent handles confirmation if needed after event.
    this.deleteIssueInitiated.emit(this.issue.id);
  }

  toggleDropdown(field: keyof typeof this.dropdown, event?: MouseEvent) {
    const buttonElement = event ? event.currentTarget as HTMLButtonElement : null;
    const wasOpen = this.dropdown[field];
    Object.keys(this.dropdown).forEach(key => {
      (this.dropdown as any)[key] = false;
    });
    if (!wasOpen && buttonElement) {
      this.dropdown[field] = true;
      this.activeDropdownButton = buttonElement;
    } else {
      this.activeDropdownButton = null;
    }
    this.cdr.markForCheck();
  }

  selectOption(
    field: IssueFieldWithOptions,
    option: IssueTypeDetail | SeverityDetail | PriorityDetail | StatusDetail,
    clickEvent?: MouseEvent
  ) {
    if (!this.issue || !this.issue.id) return;

    let fieldToUpdate: keyof IssueUpdatePayload;
    switch (field) {
      case 'status': fieldToUpdate = 'status_id'; break;
      case 'issue_type': fieldToUpdate = 'issue_type_id'; break;
      case 'severity': fieldToUpdate = 'severity_id'; break;
      case 'priority': fieldToUpdate = 'priority_id'; break;
      default: return; // Should not happen
    }

    this.issuePropertyChange.emit({
        field: fieldToUpdate,
        value: option.id,
        currentIssueId: this.issue.id
    });

    this.dropdown[field] = false;
    if (clickEvent && clickEvent.target instanceof HTMLElement) clickEvent.target.blur();
    if (this.activeDropdownButton) this.activeDropdownButton.blur();
    this.cdr.markForCheck();
  }

  closeAllDropdowns() {
    this.dropdown = { issue_type: false, severity: false, priority: false, status: false };
    this.activeDropdownButton = null;
    this.cdr.markForCheck();
  }

  handleDateInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    if (inputElement && this.issue && this.issue.id) {
        this.setDeadline(inputElement.value);
    }
  }

  setDeadline(dateString: string | null) {
    if (!this.issue || !this.issue.id) return;
    this.issuePropertyChange.emit({
        field: 'deadline',
        value: dateString,
        currentIssueId: this.issue.id
    });
    this.showDatePicker = false;
    this.cdr.markForCheck();
  }

  removeDeadline() {
    if (!this.issue || !this.issue.id) return;
    this.issuePropertyChange.emit({
        field: 'deadline',
        value: null,
        currentIssueId: this.issue.id
    });
    this.showDatePicker = false;
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
      if (this.showDatePicker) this.showDatePicker = false;
      this.cdr.markForCheck();
    }
  }

  handleAssigneeAdded(user: UserLite): void {
    if (!this.issue || !this.issue.id) return;
    this.issuePropertyChange.emit({
        field: 'assignee_id',
        value: user.id,
        currentIssueId: this.issue.id
    });
  }

  handleAssigneeRemoved(userToRemove: UserLite): void {
    if (!this.issue || !this.issue.id || !this.issue.assignee || this.issue.assignee.id !== userToRemove.id) return;
    this.issuePropertyChange.emit({
        field: 'assignee_id',
        value: null,
        currentIssueId: this.issue.id
    });
  }

  handleCurrentAssigneeToggled(isAdding: boolean): void {
    if (!this.issue || !this.issue.id || !this.currentUser) return;
    if (isAdding) {
      this.issuePropertyChange.emit({
          field: 'assignee_id',
          value: this.currentUser.id,
          currentIssueId: this.issue.id
      });
    } else {
      if (this.issue.assignee && this.issue.assignee.id === this.currentUser.id) {
        this.issuePropertyChange.emit({
            field: 'assignee_id',
            value: null,
            currentIssueId: this.issue.id
        });
      }
    }
  }

  handleWatcherAdded(user: UserLite): void {
    if (!this.issue || !this.issue.id) return;
    this.issuePropertyChange.emit({
        field: 'watchers_action',
        value: { action: 'add', user: user },
        currentIssueId: this.issue.id
    });
  }

  handleWatcherRemoved(user: UserLite): void {
    if (!this.issue || !this.issue.id) return;
    this.issuePropertyChange.emit({
        field: 'watchers_action',
        value: { action: 'remove', user: user },
        currentIssueId: this.issue.id
    });
  }

  handleCurrentWatcherToggled(isAdding: boolean): void {
    if (!this.issue || !this.issue.id || !this.currentUser) return;
    this.issuePropertyChange.emit({
        field: 'watchers_action',
        value: { action: (isAdding ? 'add' : 'remove'), user: this.currentUser },
        currentIssueId: this.issue.id
    });
  }
}
