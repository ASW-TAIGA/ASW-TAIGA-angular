// src/app/issues/feature/issues/issue-sidebar.component.ts
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  Output, // Asegúrate de que Output está importado
  EventEmitter, // Asegúrate de que EventEmitter está importado
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Issue,
  IssueTypeDetail,
  SeverityDetail,
  PriorityDetail,
  StatusDetail,
  UserLite
} from '../../data-access/issue.service';
import { UserManagementComponent } from '../../ui/user-management/user-management.component';

type IssueFieldWithOptions = 'issue_type' | 'severity' | 'priority' | 'status';

@Component({
  selector: 'app-issue-sidebar',
  standalone: true,
  imports: [CommonModule, UserManagementComponent],
  templateUrl: './issue-sidebar.component.html',
  styleUrls: ['./issue-sidebar.component.css']
})
export class IssueSidebarComponent implements OnChanges {
  @Input() issue!: Issue;
  @Input() typeOptions: IssueTypeDetail[] = [];
  @Input() severityOptions: SeverityDetail[] = [];
  @Input() priorityOptions: PriorityDetail[] = [];
  @Input() statusOptions: StatusDetail[] = [];
  @Input() currentUser!: UserLite | null;
  @Input() allProjectUsers: UserLite[] = [];

  @Output() issuePropertyChange = new EventEmitter<{ field: keyof Issue, value: any, currentIssue: Issue }>();
  @Output() deleteIssueInitiated = new EventEmitter<number>(); // Nuevo Output para el ID del issue a borrar

  editableIssue!: Issue;
  showDatePicker = false;
  dropdown = {
    issue_type: false,
    severity: false,
    priority: false,
    status: false
  };
  activeDropdownButton: HTMLButtonElement | null = null;

  constructor(private eRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issue'] && changes['issue'].currentValue) {
      this.editableIssue = { ...changes['issue'].currentValue };
    }
  }

  // ... (otros métodos existentes como toggleDropdown, selectOption, etc.)

  onDeleteIssueClicked(): void {
    if (!this.editableIssue || typeof this.editableIssue.id === 'undefined') {
      console.error('IssueSidebarComponent: Issue data or ID is missing, cannot initiate delete.');
      return;
    }
    const confirmed = window.confirm('Are you sure you want to delete this issue? This action cannot be undone.');
    if (confirmed) {
      this.deleteIssueInitiated.emit(this.editableIssue.id);
    }
  }

  // ... (resto de los métodos)
  toggleDropdown(field: keyof typeof this.dropdown, event?: MouseEvent) { // Copiado de la anterior respuesta para completitud
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
  }

  selectOption( // Copiado de la anterior respuesta para completitud
    field: IssueFieldWithOptions,
    option: IssueTypeDetail | SeverityDetail | PriorityDetail | StatusDetail,
    clickEvent?: MouseEvent
  ) {
    if (!this.editableIssue) return;
    switch (field) {
      case 'issue_type':
        this.editableIssue.issue_type = option as IssueTypeDetail;
        break;
      case 'severity':
        this.editableIssue.severity = option as SeverityDetail;
        break;
      case 'priority':
        this.editableIssue.priority = option as PriorityDetail;
        break;
      case 'status':
        this.editableIssue.status = option as StatusDetail;
        break;
    }
    this.dropdown[field] = false;
    this.issuePropertyChange.emit({ field: field, value: option, currentIssue: this.issue });
    if (clickEvent && clickEvent.target instanceof HTMLElement) clickEvent.target.blur();
    if (this.activeDropdownButton) this.activeDropdownButton.blur();
  }

  closeAllDropdowns() { // Copiado de la anterior respuesta para completitud
    this.dropdown = { issue_type: false, severity: false, priority: false, status: false };
    this.activeDropdownButton = null;
  }

  handleDateInputChange(event: Event): void { // Copiado de la anterior respuesta para completitud
    const inputElement = event.target as HTMLInputElement | null;
    if (inputElement && this.editableIssue) this.setDeadline(inputElement.value);
  }

  setDeadline(dateString: string | null) { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue) return;
    this.editableIssue.deadline = dateString;
    this.showDatePicker = false;
    this.issuePropertyChange.emit({ field: 'deadline', value: dateString, currentIssue: this.issue });
  }

  removeDeadline() { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue) return;
    this.editableIssue.deadline = null;
    this.showDatePicker = false;
    this.issuePropertyChange.emit({ field: 'deadline', value: null, currentIssue: this.issue });
  }

  @HostListener('document:click', ['$event']) // Copiado de la anterior respuesta para completitud
  handleClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeAllDropdowns();
      if (this.showDatePicker) this.showDatePicker = false;
    }
  }

  handleAssigneeAdded(user: UserLite): void { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue) return;
    this.editableIssue.assignee = user;
    this.issuePropertyChange.emit({ field: 'assignee', value: user, currentIssue: this.issue });
  }

  handleAssigneeRemoved(userToRemove: UserLite): void { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue || !this.editableIssue.assignee || this.editableIssue.assignee.id !== userToRemove.id) return;
    this.editableIssue.assignee = null;
    this.issuePropertyChange.emit({ field: 'assignee', value: null, currentIssue: this.issue });
  }

  handleCurrentAssigneeToggled(isAdding: boolean): void { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue || !this.currentUser) return;
    if (isAdding) {
      this.editableIssue.assignee = this.currentUser;
      this.issuePropertyChange.emit({ field: 'assignee', value: this.currentUser, currentIssue: this.issue });
    } else {
      if (this.editableIssue.assignee && this.editableIssue.assignee.id === this.currentUser.id) {
        this.editableIssue.assignee = null;
        this.issuePropertyChange.emit({ field: 'assignee', value: null, currentIssue: this.issue });
      }
    }
  }

  handleWatcherAdded(user: UserLite): void { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue) return;
    if (!this.editableIssue.watchers.find((w: UserLite) => w.id === user.id)) {
      this.editableIssue.watchers = [...this.editableIssue.watchers, user];
      this.issuePropertyChange.emit({ field: 'watchers', value: { action: 'add', user: user }, currentIssue: this.issue });
    }
  }

  handleWatcherRemoved(user: UserLite): void { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue) return;
    this.editableIssue.watchers = this.editableIssue.watchers.filter((w: UserLite) => w.id !== user.id);
    this.issuePropertyChange.emit({ field: 'watchers', value: { action: 'remove', user: user }, currentIssue: this.issue });
  }

  handleCurrentWatcherToggled(isAdding: boolean): void { // Copiado de la anterior respuesta para completitud
    if (!this.editableIssue || !this.currentUser) return;
    const isWatching = this.editableIssue.watchers.some((w: UserLite) => w.id === this.currentUser!.id);
    if (isAdding && !isWatching) {
      this.editableIssue.watchers = [...this.editableIssue.watchers, this.currentUser!];
      this.issuePropertyChange.emit({ field: 'watchers', value: { action: 'add', user: this.currentUser! }, currentIssue: this.issue });
    } else if (!isAdding && isWatching) {
      this.editableIssue.watchers = this.editableIssue.watchers.filter((w: UserLite) => w.id !== this.currentUser!.id);
      this.issuePropertyChange.emit({ field: 'watchers', value: { action: 'remove', user: this.currentUser! }, currentIssue: this.issue });
    }
  }
}
