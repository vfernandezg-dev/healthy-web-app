import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '@core/api/problem';
import type { ReportResponse, ResolveRequest } from '@core/api/schema';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { AdminApi } from '../data/admin-api';

type Action = ResolveRequest['action'];

/** Qué denuncia se resuelve y cómo. */
export interface Resolution {
  readonly report: ReportResponse;
  readonly action: Action;
}

/** Cómo terminó: resuelta ahora, o ya la había cerrado otra persona (409 `report-closed`). */
export interface Resolved {
  readonly action: Action;
  readonly alreadyClosed: boolean;
}

/** Resolver una denuncia: ocultar lo denunciado o descartarla, con una nota para el registro. */
@Component({
  selector: 'app-resolve-dialog',
  imports: [FormField, Textarea, LabeledField, FormDialog],
  template: `
    <app-form-dialog
      [(open)]="open"
      [header]="hiding() ? 'Ocultar el contenido' : 'Descartar la denuncia'"
      formId="resolve-form"
      [submitLabel]="hiding() ? 'Ocultar' : 'Descartar'"
      [danger]="hiding()"
      [submitting]="resolveForm().submitting()"
      [failure]="failure()"
      (closed)="closed.emit()"
    >
      <p class="mb-5 text-muted">
        @if (hiding()) {
          {{ target() }} dejará de verse en el grupo y se cerrarán todas sus denuncias.
        } @else {
          La denuncia se cerrará y el contenido seguirá visible.
        }
      </p>
      <form id="resolve-form" novalidate (submit)="save($event)">
        <app-field
          label="Nota para el registro"
          inputId="resolve-note"
          hint="Se guarda con la resolución."
          [field]="resolveForm.note"
        >
          <textarea
            pTextarea
            id="resolve-note"
            rows="3"
            class="w-full"
            [formField]="resolveForm.note"
            [attr.aria-describedby]="describe('resolve-note', resolveForm.note, true)"
          ></textarea>
        </app-field>
      </form>
    </app-form-dialog>
  `,
})
export class ResolveDialog {
  private readonly api = inject(AdminApi);
  private readonly submitForm = formSubmitter();

  readonly resolution = input.required<Resolution>();
  /** La denuncia se ha resuelto (o ya lo estaba): hay que recargar la lista. */
  readonly resolved = output<Resolved>();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly failure = signal<string | null>(null);
  protected readonly hiding = computed(() => this.resolution().action === 'HIDE');
  protected readonly target = computed(() =>
    this.resolution().report.targetType === 'COMMENT' ? 'El comentario' : 'La publicación',
  );
  protected readonly describe = fieldDescription;

  protected readonly model = signal({ note: '' });
  protected readonly resolveForm = form(this.model, (path) => {
    required(path.note, { message: 'Escribe una nota breve' });
    maxLength(path.note, 200, { message: 'Máximo 200 caracteres' });
  });

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.resolveForm, {
      failure: this.failure,
      save: async (): Promise<Resolved> => {
        const { report, action } = this.resolution();
        try {
          await this.api.resolve(report.id, { action, note: this.model().note.trim() });
          return { action, alreadyClosed: false };
        } catch (error) {
          // Otra persona la cerró antes: no es un fallo, la lista se pone al día igual.
          if (toProblem(error).code === 'report-closed') {
            return { action, alreadyClosed: true };
          }
          throw error;
        }
      },
      onSuccess: (resolved) => {
        this.resolved.emit(resolved);
        this.open.set(false);
      },
    });
  }
}
