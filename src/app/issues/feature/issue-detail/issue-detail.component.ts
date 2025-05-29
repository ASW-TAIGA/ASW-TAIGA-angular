// src/app/issues/feature/issue-detail/issue-detail.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ViewChild, ElementRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Issue, AttachmentDetail, IssueService, CommentDetail, UserLite } from '../../data-access/issue.service';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnChanges {
  @Input() issue: Issue | null = null;
  @Input() canGoPrevious: boolean = false;
  @Input() canGoNext: boolean = false;
  @Input() currentUser: UserLite | null = null; // Input para el usuario actual

  @Output() navigateToPrevious = new EventEmitter<void>();
  @Output() navigateToNext = new EventEmitter<void>();
  @Output() issuePropertyChange = new EventEmitter<{ field: 'description' | 'comments', value: any, currentIssue: Issue }>();

  isEditingDescription: boolean = false;
  editableDescription: string = '';
  newCommentText: string = '';

  editingCommentId: number | null = null;
  editableCommentText: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private issueService = inject(IssueService);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['issue'] && this.issue) {
      if (!this.isEditingDescription) {
        this.editableDescription = this.issue.description;
      }
      if (this.editingCommentId !== null && changes['issue'].previousValue?.id !== changes['issue'].currentValue?.id) {
        this.cancelEditComment();
      }
    }
  }

  get sortedComments(): CommentDetail[] {
    if (!this.issue || !this.issue.comments) {
      return [];
    }
    return [...this.issue.comments].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // MODIFICADO: Lógica para determinar si se pueden mostrar los botones de editar/borrar
  canManageComment(comment: CommentDetail): boolean {
    // El usuario actual debe existir y su ID debe coincidir con el ID del autor del comentario
    if (!this.currentUser || !comment.author) {
      return false;
    }
    return this.currentUser.id === comment.author.id;
    // TODO: Añadir lógica para roles (ej. admin puede borrar/editar cualquier comentario)
    // if (this.currentUser.isAdmin) { return true; }
  }

  startEditComment(comment: CommentDetail): void {
    // Solo permitir editar si el usuario puede gestionar el comentario
    if (this.canManageComment(comment)) {
      this.editingCommentId = comment.id;
      this.editableCommentText = comment.text;
      this.isEditingDescription = false;
      console.log(`Start editing comment ID: ${comment.id}`);
    } else {
      console.warn("User does not have permission to edit this comment.");
      alert("You can only edit your own comments.");
    }
  }

  saveEditComment(commentToSave: CommentDetail): void {
    if (!this.issue || this.editingCommentId === null || !this.canManageComment(commentToSave)) {
      if(!this.canManageComment(commentToSave)) {
        alert("You do not have permission to save this comment.");
      }
      return;
    }

    console.log(`Attempting to save comment ID: ${commentToSave.id}, New text: "${this.editableCommentText}"`);

    // TODO: Implementar la llamada al servicio this.issueService.updateComment(...)
    // Simulación de guardado local
    this.issue!.comments = this.issue!.comments.map(c =>
      c.id === commentToSave.id ? { ...c, text: this.editableCommentText, updated_at: new Date().toISOString() } : c
    );
    alert('Comment "saved" (mock local update). Backend integration needed.');
    this.cancelEditComment();
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editableCommentText = '';
  }

  confirmDeleteComment(commentToDelete: CommentDetail): void {
    if (!this.issue || !this.canManageComment(commentToDelete)) {
      if(!this.canManageComment(commentToDelete)) {
        alert("You do not have permission to delete this comment.");
      }
      return;
    }
    const confirmed = window.confirm(`Are you sure you want to delete this comment by ${commentToDelete.author.username}?\n\n"${commentToDelete.text.substring(0, 100)}${commentToDelete.text.length > 100 ? '...' : ''}"`);
    if (confirmed) {
      console.log(`Attempting to delete comment ID: ${commentToDelete.id} from issue ID: ${this.issue.id}`);
      // TODO: Llamar a this.issueService.deleteComment(this.issue.id, commentToDelete.id)
      // Simulación de borrado local
      this.issue.comments = this.issue.comments.filter(c => c.id !== commentToDelete.id);
      alert(`Comment by ${commentToDelete.author.username} "deleted" (mock local update).`);
    }
  }

  postNewComment(): void {
    if (!this.issue || !this.newCommentText.trim() || !this.currentUser) {
      if (!this.currentUser) alert("You must be logged in to comment.");
      return;
    }
    const textToPost = this.newCommentText.trim();
    console.log(`Attempting to post new comment for issue ID: ${this.issue.id}. Text: "${textToPost}" by user: ${this.currentUser.username}`);
    // TODO: Llamar a this.issueService.addComment(this.issue.id, textToPost)
    // Simulación de añadir comentario localmente
    const tempNewComment: CommentDetail = {
      id: Math.floor(Math.random() * 100000) + 1000,
      author: this.currentUser,
      text: textToPost,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.issue.comments = [tempNewComment, ...this.issue.comments];
    this.newCommentText = '';
    alert(`New comment "posted" (mock local update).`);
  }

  // --- Métodos existentes ---
  startEditDescription(): void {
    if (this.issue) {
      this.editableDescription = this.issue.description;
      this.isEditingDescription = true;
      this.cancelEditComment();
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
      this.isEditingDescription = false;
    }
  }

  onNavigateToPreviousClick(): void { if (this.canGoPrevious) this.navigateToPrevious.emit(); }
  onNavigateToNextClick(): void { if (this.canGoNext) this.navigateToNext.emit(); }
  triggerFileUpload(): void { this.fileInput.nativeElement.click(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.issue && this.issue.id !== null && this.issue.id !== undefined) {
        const currentIssueId = this.issue.id;
        this.issueService.addAttachment(currentIssueId, file).subscribe({
          next: (newAttachment: AttachmentDetail) => {
            if (this.issue && this.issue.id === currentIssueId) {
              this.issue.attachments = [...this.issue.attachments, newAttachment];
            }
          },
          error: (err) => { /* ... */ },
          complete: () => {
            if (this.fileInput && this.fileInput.nativeElement) {
              this.fileInput.nativeElement.value = '';
            }
          }
        });
      } else {
        if (this.fileInput && this.fileInput.nativeElement) {
          this.fileInput.nativeElement.value = '';
        }
      }
    }
  }

  confirmDeleteAttachment(attachmentToDelete: AttachmentDetail): void {
    if (!this.issue) { return; }
    if (typeof attachmentToDelete.id === 'undefined') { return; }
    const confirmed = window.confirm(`Are you sure you want to delete the attachment "${attachmentToDelete.file_name}"?`);
    if (confirmed) {
      const currentIssueId = this.issue.id;
      this.issueService.deleteAttachment(currentIssueId, attachmentToDelete.id).subscribe({
        next: () => {
          if (this.issue && this.issue.id === currentIssueId) {
            this.issue.attachments = this.issue.attachments.filter(att => att.id !== attachmentToDelete.id);
          }
        },
        error: (err) => { /* ... */ }
      });
    }
  }
}
