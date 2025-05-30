import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, inject, HostListener } from '@angular/core'; // AÑADIDO HostListener
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IssueService, UserLite, StatusDetail, IssueTypeDetail, SeverityDetail, PriorityDetail, IssueOptions, NewIssueFormData } from '../../data-access/issue.service'; // Asegúrate que la ruta es correcta

// Interfaz para los datos del formulario del nuevo issue
// Si esta interfaz se usa en varios sitios, considera moverla a un archivo de tipos o al servicio y exportarla.

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './issue-form.component.html',
  styleUrls: ['./issue-form.component.css']
})
export class IssueFormComponent implements OnInit {
  @Input() statusOptions: StatusDetail[] = [];
  @Input() typeOptions: IssueTypeDetail[] = [];
  @Input() severityOptions: SeverityDetail[] = [];
  @Input() priorityOptions: PriorityDetail[] = [];
  @Input() projectUsers: UserLite[] = [];
  @Input() currentUser: UserLite | null = null;

  @Output() closeForm = new EventEmitter<void>();
  // Modificamos el evento para incluir los archivos
  @Output() issueCreated = new EventEmitter<{ issueData: NewIssueFormData, files: File[] }>();

  newIssue: NewIssueFormData = {
    title: '',
    description: '',
    status_id: null,
    assignee_id: null,
    issue_type_id: null, // Usar issue_type_id
    severity_id: null,
    priority_id: null,
    deadline: null,
    watcher_ids: [] // Inicializar watcher_ids
  };

  // Para la subida de adjuntos
  @ViewChild('attachmentFileInputInForm') attachmentFileInput!: ElementRef<HTMLInputElement>; // Renombrado para evitar colisión si tienes otro fileInput
  selectedFiles: File[] = [];

  // Para el date picker del deadline
  showDeadlinePickerInForm: boolean = false;

  private issueService = inject(IssueService); // No se usa directamente aquí, pero podría ser para validaciones futuras

  ngOnInit(): void {
    if (this.statusOptions.length > 0) {
      this.newIssue.status_id = this.statusOptions[0].id;
    }
    if (this.typeOptions.length > 0 && !this.newIssue.issue_type_id) { // Nuevo
      this.newIssue.issue_type_id = this.typeOptions[0].id;
    }
    if (this.severityOptions.length > 0) {
      this.newIssue.severity_id = this.severityOptions[0].id;
    }
    if (this.priorityOptions.length > 0) {
      this.newIssue.priority_id = this.priorityOptions[0].id;
    }

    // Opcional: Pre-asignar al currentUser
    // if (this.currentUser) {
    //   this.newIssue.assignee_id = this.currentUser.id;
    // }
  }

  onSubmit(): void {
    if (!this.newIssue.title.trim() ||
      !this.newIssue.status_id ||
      !this.newIssue.issue_type_id || // Usar issue_type_id
      !this.newIssue.priority_id ||
      !this.newIssue.severity_id) {
      alert('Please fill in all required fields (Subject, Status, Type, Severity, Priority).');
      return;
    }
    console.log('IssueFormComponent: Submitting New Issue Data:', this.newIssue);
    console.log('IssueFormComponent: Submitting Selected Files:', this.selectedFiles);
    this.issueCreated.emit({ issueData: this.newIssue, files: this.selectedFiles });
    // Considera resetear el formulario aquí o después de una creación exitosa en el padre
    // this.resetForm();
  }

  resetForm(): void { // Método para resetear el formulario si se necesita
    this.newIssue = {
      title: '', description: '', status_id: null, assignee_id: null,
      issue_type_id: null, severity_id: null, priority_id: null, deadline: null
    };
    this.selectedFiles = [];
    this.showDeadlinePickerInForm = false;
    // Preseleccionar valores por defecto de nuevo si es necesario
    if (this.statusOptions.length > 0) this.newIssue.status_id = this.statusOptions[0].id;
    // ... etc. para otros selects
  }

  // --- Lógica de Adjuntos ---
  triggerAttachmentUploadInForm(): void {
    this.attachmentFileInput.nativeElement.click();
  }

  onAttachmentsSelectedInForm(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        this.selectedFiles.push(input.files[i]);
      }
      console.log('IssueFormComponent: Files selected:', this.selectedFiles.map(f => f.name));
    }
    input.value = ''; // Permite seleccionar el mismo archivo de nuevo
  }

  removeSelectedFileInForm(index: number): void {
    this.selectedFiles.splice(index, 1);
    console.log('IssueFormComponent: File removed. Remaining files:', this.selectedFiles.map(f => f.name));
  }

  // --- Lógica de Deadline ---
  onDeadlineDateChangeInForm(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newIssue.deadline = input.value ? input.value : undefined; // Usar undefined si está vacío para que no se envíe
    // this.showDeadlinePickerInForm = false; // Opcional: cerrar después de seleccionar
    console.log('IssueFormComponent: Deadline changed to:', this.newIssue.deadline);
  }

  removeDeadlineInForm(): void {
    this.newIssue.deadline = undefined; // O null, según prefieras para el payload
    this.showDeadlinePickerInForm = false;
    console.log('IssueFormComponent: Deadline removed.');
  }

  // Cierra el dropdown del deadline si se hace clic fuera (simplificado)
  // Se podría necesitar una directiva más robusta para múltiples dropdowns/popups en la página.
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showDeadlinePickerInForm) {
      const targetElement = event.target as HTMLElement;
      // Comprueba si el clic fue fuera del botón del reloj o del propio datepicker
      if (!targetElement.closest('.deadline-button-container, .deadline-picker-popup')) {
        this.showDeadlinePickerInForm = false;
      }
    }
  }
}
