// src/app/shared/ui/tailwind-modal/tailwind-modal.component.ts
import {
  Component,
  ElementRef,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tailwind-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div
        class="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto"
        [ngClass]="panelClass"
        (click)="$event.stopPropagation()"
      >
        <div
          class="flex items-center justify-between p-4 border-b border-gray-200"
        >
          <h3 class="text-lg font-semibold text-gray-900">{{ modalTitle }}</h3>
          <button
            (click)="closeModal.emit()"
            class="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div #modalContent class="p-6"></div>
      </div>
    </div>
  `,
  styles: [
    `
      /* No specific Angular styles needed, all styling via Tailwind classes in template */
    `,
  ],
})
export class TailwindModalComponent {
  @Input() modalTitle: string = 'Modal';
  @Input() panelClass: string | string[] = 'w-full max-w-md'; // Default width for dialog
  @Output() closeModal = new EventEmitter<void>();

  @ViewChild('modalContent', { static: true }) modalContent!: ElementRef;

  onBackdropClick(event: MouseEvent): void {
    // Only close if the click is directly on the backdrop, not on the modal content itself
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }
}
