import { Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, submit } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '@core/api/problem';
import type { ReportResponse, ResolveRequest } from '@core/api/schema';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
import { AdminApi } from '../data/admin-api';

type Action = ResolveRequest['action'];

/** Resolver una denuncia: ocultar lo denunciado o descartarla, con una nota para el registro. */
@Component({
  selector: 'app-resolve-dialog',
  imports: [FormField, Dialog, Textarea, Message, ButtonDirective, LabeledField],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="hiding() ? 'Ocultar el contenido' : 'Descartar la denuncia'"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(32rem,calc(100vw-2rem))]"
    >
      <p class="mb-5 text-muted">
        @if (hiding()) {
          {{ target() }} dejará de verse en el grupo y se cerrarán todas sus denuncias.
        } @else {
          La denuncia se cerrará y el contenido seguirá visible.
        }
      </p>
      @if (failure(); as message) {
        <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
      }
      <form id="resolve-form" novalidate (submit)="onSubmit($event)">
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
      <ng-template #footer>
        <button
          pButton
          type="button"
          severity="secondary"
          variant="text"
          (click)="visible.set(false)"
        >
          Cancelar
        </button>
        <button
          pButton
          type="submit"
          form="resolve-form"
          [severity]="hiding() ? 'danger' : 'primary'"
          [loading]="resolveForm().submitting()"
        >
          {{ hiding() ? 'Ocultar' : 'Descartar' }}
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class ResolveDialog {
  private readonly api = inject(AdminApi);

  /** La denuncia se ha resuelto (o ya lo estaba): hay que recargar la lista. */
  readonly resolved = output<{ readonly action: Action; readonly alreadyClosed: boolean }>();

  protected readonly visible = signal(false);
  private readonly report = signal<ReportResponse | null>(null);
  private readonly action = signal<Action>('HIDE');
  protected readonly hiding = computed(() => this.action() === 'HIDE');
  protected readonly target = computed(() =>
    this.report()?.targetType === 'COMMENT' ? 'El comentario' : 'La publicación',
  );
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected readonly model = signal({ note: '' });
  protected readonly resolveForm = form(this.model, (path) => {
    required(path.note, { message: 'Escribe una nota breve' });
    maxLength(path.note, 200, { message: 'Máximo 200 caracteres' });
  });

  open(report: ReportResponse, action: Action): void {
    this.report.set(report);
    this.action.set(action);
    this.failure.set(null);
    this.resolveForm().reset({ note: '' });
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const report = this.report();
    if (!report) {
      return;
    }
    this.failure.set(null);
    await submit(this.resolveForm, {
      action: async () => {
        const action = this.action();
        try {
          await this.api.resolve(report.id, { action, note: this.model().note.trim() });
          this.visible.set(false);
          this.resolved.emit({ action, alreadyClosed: false });
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.code === 'report-closed') {
            this.visible.set(false);
            this.resolved.emit({ action, alreadyClosed: true });
            return undefined;
          }
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.resolveForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
