import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-issue-sidebar',
  standalone: true,
  templateUrl: './issue-sidebar.component.html',
  styleUrls: ['./issue-sidebar.component.css'],
  imports: [CommonModule]
})
export class IssueSidebarComponent {
  // ... (your existing properties: typeOptions, severityOptions, etc.)
  typeOptions = [
    { id: 1, value: 'Bug', color: 'bg-red-500' },
    { id: 2, value: 'Feature', color: 'bg-blue-500' },
    { id: 3, value: 'Task', color: 'bg-gray-500' }
  ];
  severityOptions = [
    { id: 1, value: 'Low', color: 'bg-green-400' },
    { id: 2, value: 'Normal', color: 'bg-blue-400' },
    { id: 3, value: 'High', color: 'bg-orange-400' },
    { id: 4, value: 'Critical', color: 'bg-red-600' }
  ];
  priorityOptions = [
    { id: 1, value: 'Low', color: 'bg-green-300' },
    { id: 2, value: 'Normal', color: 'bg-yellow-400' },
    { id: 3, value: 'High', color: 'bg-orange-400' },
    { id: 4, value: 'Urgent', color: 'bg-red-500' }
  ];
  statusOptions = [
    { id: 1, value: 'New' },
    { id: 2, value: 'Open' },
    { id: 3, value: 'In Progress' },
    { id: 4, value: 'Resolved' },
    { id: 5, value: 'Closed' }
  ];

  issue = {
    type: 1,
    severity: 2,
    priority: 2,
    status: 1,
    date: null as string | null // This is fine
  };

  showDatePicker = false;

  dropdown = {
    type: false,
    severity: false,
    priority: false,
    status: false
  };

  private activeDropdownButton: HTMLButtonElement | null = null;

  constructor(private eRef: ElementRef) {}

  toggleDropdown(field: 'type' | 'severity' | 'priority' | 'status', event?: MouseEvent) {
    const buttonElement = event ? event.currentTarget as HTMLButtonElement : null;
    const wasOpen = this.dropdown[field];

    Object.keys(this.dropdown).forEach(key => {
      this.dropdown[key as keyof typeof this.dropdown] = false;
    });

    if (!wasOpen && buttonElement) {
      this.dropdown[field] = true;
      this.activeDropdownButton = buttonElement;
    } else {
      this.activeDropdownButton = null;
    }
  }

  selectOption(field: 'type' | 'severity' | 'priority' | 'status', option: { id: number, value: string }, clickEvent?: MouseEvent) {
    this.issue[field] = option.id;
    this.dropdown[field] = false;
    this.refreshIssue();

    if (clickEvent && clickEvent.target instanceof HTMLElement) {
      clickEvent.target.blur();
    }

    if (this.activeDropdownButton) {
      this.activeDropdownButton.blur();
    }
  }

  getOptionValue(field: 'type' | 'severity' | 'priority' | 'status', id: number): string {
    let options;
    switch (field) {
      case 'type': options = this.typeOptions; break;
      case 'severity': options = this.severityOptions; break;
      case 'priority': options = this.priorityOptions; break;
      case 'status': options = this.statusOptions; break;
      default: return ''; // Should not happen with defined types
    }
    const found = options.find((opt) => opt.id === id);
    return found ? found.value : '';
  }

  getOptionColor(field: 'type' | 'severity' | 'priority', id: number): string {
    let options;
    switch (field) {
      case 'type': options = this.typeOptions; break;
      case 'severity': options = this.severityOptions; break;
      case 'priority': options = this.priorityOptions; break;
      default: return '';
    }
    const found = options.find((opt) => opt.id === id);
    return found && 'color' in found ? (found as any).color : '';
  }

  closeAllDropdowns() {
    this.dropdown = {
      type: false,
      severity: false,
      priority: false,
      status: false
    };
    this.activeDropdownButton = null;
  }

  refreshIssue() {
    // Lógica para actualizar el issue
    console.log("Issue refreshed:", this.issue);
  }

  // NEW METHOD TO HANDLE DATE INPUT CHANGE
  handleDateInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement | null;
    if (inputElement) {
      this.setDate(inputElement.value);
    } else {
      // Handle case where target is null if necessary, though unlikely for input change
      this.setDate(''); // or some default or error handling
    }
  }

  setDate(date: string) { // This method is fine as is
    this.issue.date = date;
    this.showDatePicker = false;
    this.refreshIssue(); // Good to call refresh here too if needed
  }

  removeDate() {
    this.issue.date = null;
    this.showDatePicker = false;
    this.refreshIssue(); // Good to call refresh here too if needed
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const isInside = this.eRef.nativeElement.contains(event.target);
    if (!isInside) {
      this.closeAllDropdowns();
      if (this.showDatePicker) { // Also close date picker if open
        this.showDatePicker = false;
      }
    }
  }

  @HostListener('document:mousedown', ['$event'])
  removeFocus(event: MouseEvent) {
    const active = document.activeElement as HTMLElement;
    if (active && !['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)) {
      active.blur();
    }
  }
}
