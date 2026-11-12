import { Component, input, output } from '@angular/core';
import { LucideArchive, LucideSend, LucideTrash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import type { PublicationStatus } from '../i18n/labels';

/**
 * Acciones del ciclo de publicación de un plan o un contenido: un borrador se publica o se elimina; uno publicado se
 * archiva; uno archivado no tiene acciones. Presentacional: quien lo usa hace la escritura (ver `mutation`).
 */
@Component({
  selector: 'app-publication-actions',
  imports: [ButtonDirective, LucideTrash, LucideSend, LucideArchive],
  host: { class: 'flex flex-wrap gap-2' },
  template: `
    @switch (status()) {
      @case ('DRAFT') {
        <button
          pButton
          type="button"
          severity="danger"
          variant="text"
          [disabled]="pending()"
          (click)="remove.emit()"
        >
          <svg lucideTrash></svg>
          Eliminar
        </button>
        <button pButton type="button" [loading]="pending()" (click)="publish.emit()">
          <svg lucideSend></svg>
          Publicar
        </button>
      }
      @case ('PUBLISHED') {
        <button
          pButton
          type="button"
          severity="secondary"
          variant="outlined"
          [loading]="pending()"
          (click)="archive.emit()"
        >
          <svg lucideArchive></svg>
          Archivar
        </button>
      }
    }
  `,
})
export class PublicationActions {
  readonly status = input.required<PublicationStatus>();
  /** Hay una acción en marcha: los botones esperan. */
  readonly pending = input(false);
  readonly publish = output();
  readonly archive = output();
  readonly remove = output();
}
