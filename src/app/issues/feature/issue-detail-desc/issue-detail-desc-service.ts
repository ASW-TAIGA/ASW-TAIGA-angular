import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

// --- Interfaces for our data models ---

export interface User {
  id: string;
  username: string;
  avatarUrl?: string; // Optional avatar URL
}

export interface Status {
  id: string;
  name: string;
  color?: string; // Optional color for status display
}

export interface IssueType {
  id: string;
  name: string;
}

export interface Severity {
  id: string;
  name: string;
}

export interface Priority {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  size?: number; // Optional file size
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  creator: User;
  createdAt: Date;
  updatedAt: Date;
  status: Status;
  issueType: IssueType;
  severity: Severity;
  priority: Priority;
  assignee: User | null;
  deadline: Date | null;
  watchers: User[];
  comments: Comment[];
  attachments: Attachment[];
  tags: string[]; // Added tags based on the image
}

// --- Service Implementation ---

@Injectable({
  providedIn: 'root',
})
export class IssueDetailService {
  // Dummy data to simulate API responses
  private dummyIssues: Issue[] = [
    {
      id: 139,
      title: 'aksjbdkjsad',
      description: 'Empty space is so boring ... go on , be descriptive .....',
      creator: {
        id: 'user1',
        username: 'Jashanpreet Singh',
        avatarUrl: 'https://placehold.co/30x30/aabbcc/ffffff?text=JS',
      },
      createdAt: new Date('2025-04-09T18:30:00Z'),
      updatedAt: new Date('2025-04-10T00:31:00Z'),
      status: { id: 'status1', name: 'New', color: '#4CAF50' },
      issueType: { id: 'type1', name: 'Bug' },
      severity: { id: 'severity1', name: 'Major' },
      priority: { id: 'priority1', name: 'High' },
      assignee: {
        id: 'user2',
        username: 'Assigned User',
        avatarUrl: 'https://placehold.co/30x30/ccbbaa/ffffff?text=AU',
      },
      deadline: null,
      watchers: [],
      comments: [
        {
          id: 'comment1',
          author: {
            id: 'user1',
            username: 'Jashanpreet Singh',
            avatarUrl: 'https://placehold.co/30x30/aabbcc/ffffff?text=JS',
          },
          text: 'asdas',
          createdAt: new Date('2025-04-10T00:31:00Z'),
        },
      ],
      attachments: [],
      tags: ['bug', 'frontend'],
    },
    {
      id: 140,
      title: 'Another Test Issue',
      description:
        'This is a test issue with more details and multiple comments and attachments.',
      creator: {
        id: 'user3',
        username: 'Alice Smith',
        avatarUrl: 'https://placehold.co/30x30/ddeeff/ffffff?text=AS',
      },
      createdAt: new Date('2025-05-01T10:00:00Z'),
      updatedAt: new Date('2025-05-01T10:00:00Z'),
      status: { id: 'status2', name: 'In Progress', color: '#FFC107' },
      issueType: { id: 'type2', name: 'Feature' },
      severity: { id: 'severity2', name: 'Minor' },
      priority: { id: 'priority2', name: 'Medium' },
      assignee: null,
      deadline: new Date('2025-05-31T23:59:59Z'),
      watchers: [
        {
          id: 'user4',
          username: 'Bob Johnson',
          avatarUrl: 'https://placehold.co/30x30/eeccdd/ffffff?text=BJ',
        },
      ],
      comments: [
        {
          id: 'comment2',
          author: {
            id: 'user3',
            username: 'Alice Smith',
            avatarUrl: 'https://placehold.co/30x30/ddeeff/ffffff?text=AS',
          },
          text: 'Initial thoughts on implementation.',
          createdAt: new Date('2025-05-01T10:15:00Z'),
        },
        {
          id: 'comment3',
          author: {
            id: 'user5',
            username: 'Charlie Brown',
            avatarUrl: 'https://placehold.co/30x30/ccffdd/ffffff?text=CB',
          },
          text: "Agreed, let's break it down into smaller tasks.",
          createdAt: new Date('2025-05-01T11:00:00Z'),
        },
      ],
      attachments: [
        {
          id: 'att1',
          fileName: 'design-mockup.png',
          fileUrl: 'https://placehold.co/100x100/000000/ffffff?text=Mockup',
          uploadedAt: new Date('2025-05-01T10:30:00Z'),
          size: 102400,
        },
      ],
      tags: ['design', 'backend'],
    },
  ];

  // Mock user for adding comments/attachments
  private mockCurrentUser: User = {
    id: 'currentuser123',
    username: 'Current User',
    avatarUrl: 'https://placehold.co/30x30/ffccaa/ffffff?text=CU',
  };

  constructor() {}

  /**
   * Fetches issue details by ID.
   * Simulates an async API call with a delay.
   * @param id The ID of the issue to fetch.
   * @returns An Observable of the Issue.
   */
  getIssueDetails(id: number): Observable<Issue> {
    const issue = this.dummyIssues.find((i) => i.id === id);
    if (issue) {
      // Simulate network delay
      return of(issue).pipe(delay(500));
    } else {
      // Simulate API error if issue not found
      return throwError(() => new Error(`Issue with ID ${id} not found`));
    }
  }

  /**
   * Adds a new comment to an issue.
   * Simulates an async API call and updates the dummy data.
   * @param issueId The ID of the issue to add the comment to.
   * @param commentText The text of the new comment.
   * @returns An Observable of the newly added Comment.
   */
  addComment(issueId: number, commentText: string): Observable<Comment> {
    const issue = this.dummyIssues.find((i) => i.id === issueId);
    if (issue) {
      const newComment: Comment = {
        id: `comment${issue.comments.length + 1}`, // Simple unique ID
        author: this.mockCurrentUser,
        text: commentText,
        createdAt: new Date(),
      };
      issue.comments.push(newComment);
      issue.updatedAt = new Date(); // Update issue's last updated time
      // Simulate network delay and return the new comment
      return of(newComment).pipe(delay(300));
    } else {
      return throwError(
        () => new Error(`Issue with ID ${issueId} not found for commenting`)
      );
    }
  }

  /**
   * Uploads an attachment to an issue.
   * Simulates an async API call and updates the dummy data.
   * @param issueId The ID of the issue to add the attachment to.
   * @param file The File object to upload.
   * @returns An Observable of the newly added Attachment.
   */
  uploadAttachment(issueId: number, file: File): Observable<Attachment> {
    const issue = this.dummyIssues.find((i) => i.id === issueId);
    if (issue) {
      const newAttachment: Attachment = {
        id: `attachment${issue.attachments.length + 1}`, // Simple unique ID
        fileName: file.name,
        fileUrl: `https://placehold.co/100x100/000000/ffffff?text=${encodeURIComponent(
          file.name
        )}`, // Mock URL
        uploadedAt: new Date(),
        size: file.size,
      };
      issue.attachments.push(newAttachment);
      issue.updatedAt = new Date(); // Update issue's last updated time
      // Simulate network delay and return the new attachment
      return of(newAttachment).pipe(delay(500));
    } else {
      return throwError(
        () =>
          new Error(`Issue with ID ${issueId} not found for attachment upload`)
      );
    }
  }

  /**
   * Gets the current mock user.
   * @returns The mock User object.
   */
  getCurrentUser(): User {
    return this.mockCurrentUser;
  }
}
