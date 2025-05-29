import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Required for ngIf and ngFor
import { FormsModule } from '@angular/forms'; // Required for ngModel

// Define the comprehensive Issue interface as provided by the user
export interface Issue {
  id: number;
  number: number; // Changed to number as per your new interface
  description: string;
  subject: string;
  project: string;
  type: string;
  severity?: string;
  priority?: string;
  modified?: string; // This will be a string representation of a date/time
  status: string;
  assignee?: {
    id: string | number;
    name: string;
    avatar?: string | null;
    initials?: string;
    avatarColorClass?: string;
  };
  reporter?: { id: string | number; name: string; avatar?: string };
  createdDate: string;
  updatedDate: string;
  tags?: string[];
  userStory?: { id: number; subject: string };
  isBlocked?: boolean;
  progress?: number;
  dueDate?: Date | null;
  reference?: string;
}

// These interfaces are provided by the user but not directly used in this component's logic
// They are kept here for completeness if you decide to use them later for specific styling or filtering
export interface IssueType {
  id: number;
  value: string;
  icon?: string;
  colorClass?: string; // e.g., 'text-red-500 bg-red-100'
  dotColorClass?: string; // For the colored dot, e.g., 'bg-red-500'
}

export interface IssueSeverity {
  id: number;
  value: string;
  icon?: string;
  colorClass?: string;
  dotColorClass?: string;
}

export interface IssuePriority {
  id: number;
  value: string;
  icon?: string;
  colorClass?: string;
  dotColorClass?: string;
}

export interface IssueStatus {
  id: number;
  value: string;
  category?: 'ToDo' | 'InProgress' | 'Done';
  colorClass?: string; // For text or background of status badge
  textColorClass?: string; // Specific text color for status
}

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import CommonModule for directives and FormsModule for ngModel
  templateUrl: './issues-list.component.html',
  styleUrl: './issues-list.component.css',
})
export class IssuesListComponent implements OnInit {
  issues: Issue[];
  searchQuery: string = '';
  currentSortColumn: string = ''; // Tracks the currently sorted column
  sortDirection: 'asc' | 'desc' = 'asc'; // Tracks the sorting direction

  constructor() {
    this.issues = [
      {
        id: 1,
        number: 140,
        subject: 'a',
        description: 'Description of issue 1',
        status: 'Open',
        type: 'Feature',
        severity: 'High',
        priority: 'High',
        modified: '25 May 2025',
        project: 'Project Alpha',
        createdDate: '2025-05-15T09:00:00Z',
        updatedDate: '2025-05-20T10:30:00Z',
        assignee: {
          id: 'user1',
          name: 'Alice',
          avatar:
            '[https://placehold.co/24x24/FF5733/ffffff?text=A](https://placehold.co/24x24/FF5733/ffffff?text=A)',
          initials: 'A',
          avatarColorClass: 'bg-red-300',
        },
      },
      {
        id: 2,
        number: 139,
        subject: 'aksjbdkisad',
        description: 'Description of issue 2',
        status: 'In Progress',
        type: 'Bug',
        severity: 'Medium',
        priority: 'High',
        modified: '10 Apr 2025',
        project: 'Project Alpha',
        createdDate: '2025-05-24T10:00:00Z',
        updatedDate: '2025-05-25T14:15:00Z',
        assignee: {
          id: 'user2',
          name: 'Bob',
          avatar: null,
          initials: 'B',
          avatarColorClass: 'bg-blue-300',
        },
      },
      {
        id: 3,
        number: 132,
        subject: 'kajsbdkisad',
        description: 'Description',
        project: 'Project Beta',
        status: 'Open',
        severity: 'Low',
        priority: 'Medium',
        modified: '09 Apr 2025',
        createdDate: '2025-05-26T09:00:00Z',
        updatedDate: '2025-05-26T09:45:00Z',
        type: 'wow',
        // No assignee for this issue
      },
      {
        id: 4,
        number: 137,
        subject: 'askdbkjasbd',
        description: 'Description',
        project: 'Project Gamma',
        status: 'Closed',
        type: 'Task',
        severity: 'High',
        priority: 'Low',
        modified: '09 Apr 2025',
        createdDate: '2025-05-10T08:00:00Z',
        updatedDate: '2025-05-18T11:00:00Z',
        assignee: {
          id: 'user1',
          name: 'Alice',
          avatar:
            '[https://placehold.co/24x24/33FF57/ffffff?text=A](https://placehold.co/24x24/33FF57/ffffff?text=A)',
        },
      },
      {
        id: 5,
        number: 115,
        subject: 'Issue 2 , Description of issan 2,in progress , username',
        description: 'Description',
        project: 'Project Delta',
        status: 'In Progress',
        type: 'Feature',
        severity: 'Medium',
        priority: 'High',
        modified: '09 Apr 2025',
        createdDate: '2025-05-10T08:00:00Z',
        updatedDate: '2025-05-18T11:00:00Z',
        assignee: {
          id: 'user3',
          name: 'Charlie',
          avatar:
            '[https://placehold.co/24x24/5733FF/ffffff?text=C](https://placehold.co/24x24/5733FF/ffffff?text=C)',
        },
      },
      {
        id: 6,
        number: 134,
        subject: 'haue 1 , Description of issue 1 , New , username',
        description: 'Description',
        project: 'Project Delta',
        status: 'Open',
        type: 'Bug',
        severity: 'Low',
        priority: 'Medium',
        modified: '09 Apr 2026', // Changed year to make it stand out
        createdDate: '2025-05-10T08:00:00Z',
        updatedDate: '2025-05-18T11:00:00Z',
        assignee: {
          id: 'user4',
          name: 'Diana',
          avatar: null,
          initials: 'D',
          avatarColorClass: 'bg-yellow-300',
        },
      },
      {
        id: 7,
        number: 133,
        subject: 'Subject , Description , Status , Assigned to',
        description: 'Description',
        project: 'Project Echo',
        status: 'Open',
        type: 'Task',
        severity: 'High',
        priority: 'High',
        modified: '09 Apr 2025',
        createdDate: '2025-05-10T08:00:00Z',
        updatedDate: '2025-05-18T11:00:00Z',
        assignee: {
          id: 'user5',
          name: 'Eve',
          avatar:
            '[https://placehold.co/24x24/FF33A1/ffffff?text=E](https://placehold.co/24x24/FF33A1/ffffff?text=E)',
        },
      },
      {
        id: 8,
        number: 132,
        subject: 'asidsa',
        description: 'Description',
        project: 'Project Foxtrot',
        status: 'Closed',
        type: 'Bug',
        severity: 'Medium',
        priority: 'Low',
        modified: '09 Apr 2025',
        createdDate: '2025-05-10T08:00:00Z',
        updatedDate: '2025-05-18T11:00:00Z',
        // No assignee for this issue
      },
    ];
  }

  ngOnInit(): void {
    // In a real application, you would typically fetch data here, e.g.:
    // this.issueService.getIssues().subscribe(data => this.issues = data);
  }

  trackByIssueId(index: number, issue: Issue): number {
    return issue.id;
  }

  createIssue(): void {
    console.log('Create new issue clicked!');
  }

  doBulkIssues(): void {
    console.log('Bulk issues action clicked!');
  }
  getDotColorClass(value: string | undefined): string {
    if (!value) return 'bg-gray-400'; // Default for undefined/null

    switch (value.toLowerCase()) {
      case 'high':
      case 'bug':
      case 'red':
        return 'bg-red-500';
      case 'medium':
      case 'feature':
      case 'green':
        return 'bg-green-500';
      case 'low':
      case 'task':
      case 'yellow':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-purple-500';
      case 'enhancement':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  }

  /**
   * Sorts the issues array based on the provided sorting condition.
   * Toggles between ascending and descending order if the same column is clicked again.
   * @param sortingCondition The property of the Issue object to sort by (e.g., 'type', 'severity', 'number', 'assignee.name').
   */
  sortIssuesBy(sortingCondition: string): void {
    if (this.currentSortColumn === sortingCondition) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSortColumn = sortingCondition;
      this.sortDirection = 'asc';
    }

    this.issues.sort((a: Issue, b: Issue) => {
      let valueA: any;
      let valueB: any;

      if (sortingCondition.includes('.')) {
        const [prop1, prop2] = sortingCondition.split('.');
        valueA = (a as any)[prop1]?.[prop2];
        valueB = (b as any)[prop1]?.[prop2];
      } else {
        valueA = (a as any)[sortingCondition];
        valueB = (b as any)[sortingCondition];
      }

      if (valueA === undefined || valueA === null) valueA = '';
      if (valueB === undefined || valueB === null) valueB = '';

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Filters the issues based on the searchQuery.
   * The search is performed across subject, description, issue number, assignee name, status, type, severity, priority, project, and modified date.
   */
  get filteredIssues(): Issue[] {
    if (!this.searchQuery) {
      return this.issues; // Return all issues if search query is empty
    }

    const lowerCaseQuery = this.searchQuery.toLowerCase();

    return this.issues.filter((issue) => {
      // Check subject
      if (issue.subject.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      // Check description
      if (issue.description.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      // Check issue number (convert to string for comparison)
      if (issue.number.toString().includes(lowerCaseQuery)) {
        return true;
      }
      // Check assignee name
      if (
        issue.assignee &&
        issue.assignee.name.toLowerCase().includes(lowerCaseQuery)
      ) {
        return true;
      }
      // Check status
      if (issue.status.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      // Check type
      if (issue.type.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      // Check severity
      if (
        issue.severity &&
        issue.severity.toLowerCase().includes(lowerCaseQuery)
      ) {
        return true;
      }
      // Check priority
      if (
        issue.priority &&
        issue.priority.toLowerCase().includes(lowerCaseQuery)
      ) {
        return true;
      }
      // Check project
      if (issue.project.toLowerCase().includes(lowerCaseQuery)) {
        return true;
      }
      // Check modified date (if you want to search by date string)
      if (
        issue.modified &&
        issue.modified.toLowerCase().includes(lowerCaseQuery)
      ) {
        return true;
      }

      return false; // If no match found
    });
  }
}
