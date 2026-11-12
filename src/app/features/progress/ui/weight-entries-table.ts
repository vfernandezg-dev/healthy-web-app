import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { LucidePencil, LucideTrash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import type { WeightEntryResponse } from '@core/api/schema';

/** Los pesajes de la meta, del más reciente al más antiguo, con editar y borrar. */
@Component({
  selector: 'app-weight-entries-table',
  imports: [DatePipe, DecimalPipe, ButtonDirective, LucidePencil, LucideTrash],
  host: { class: 'block overflow-x-auto' },
  templateUrl: './weight-entries-table.html',
})
export class WeightEntriesTable {
  readonly entries = input.required<readonly WeightEntryResponse[]>();
  readonly edit = output<WeightEntryResponse>();
  readonly remove = output<WeightEntryResponse>();
}
