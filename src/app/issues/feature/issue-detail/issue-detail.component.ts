import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core'; // Añadir OnChanges, SimpleChanges, Output, EventEmitter
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para ngModel
import { Issue } from '../../data-access/issue.service';
import { RouterLink } from '@angular/router'; // Importa RouterLink


@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule,RouterLink ], // Añadir FormsModule
  templateUrl: './issue-detail.component.html',
  styleUrls: ['./issue-detail.component.css']
})
export class IssueDetailComponent implements OnChanges { // Implementar OnChanges
  @Input() issue: Issue | null = null;
  // Usaremos el mismo patrón de evento que IssueSidebarComponent para simplificar el manejo en IssuesComponent
  @Output() issuePropertyChange = new EventEmitter<{ field: 'description', value: string, currentIssue: Issue }>();

  isEditingDescription: boolean = false;
  editableDescription: string = '';

  ngOnChanges(changes: SimpleChanges): void {
    // Si el issue cambia desde el input, y no estamos editando, reseteamos la descripción editable.
    if (changes['issue'] && this.issue) {
      if (!this.isEditingDescription) {
        this.editableDescription = this.issue.description;
      }
    }
  }

  startEditDescription(): void {
    if (this.issue) {
      this.editableDescription = this.issue.description; // Cargar el valor actual al empezar a editar
      this.isEditingDescription = true;
    }
  }

  saveDescription(): void {
    if (this.issue) {
      // Actualizar el issue localmente (opcional, el padre lo hará al recibir el evento)
      // this.issue.description = this.editableDescription;

      // Emitir el evento para que el padre (IssuesComponent) maneje la actualización real
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
      this.editableDescription = this.issue.description; // Revertir a la descripción original
      this.isEditingDescription = false;
    }
  }
}
