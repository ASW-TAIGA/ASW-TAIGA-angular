import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-sort-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sort-icon.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SortIconComponent {
  @Input() columnKey: string = '';
  @Input() currentSortColumn: string | null = null;
  @Input() sortDirection: SortDirection = 'asc';
}
