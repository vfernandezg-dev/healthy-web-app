import { Component, inject, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, submit } from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '../../core/api/problem';
import { LabeledField, fieldDescription } from '../../shared/forms/labeled-field';
import { focusFirstInvalid } from '../../shared/forms/server-errors';
import { CommunityApi } from './data/community-api';

/** Denunciar una publicación o un comentario (lo revisa un ADMIN). Se abre con {@link ReportDialog.open}. */
@Component({
  selector: 'app-report-dialog',
  imports: [FormField, Dialog, Textarea, Message, ButtonDirective, ButtonLabel, LabeledField],
  template: `
    <p-dialog
      [(visible)]="visible"
      header="Denunciar"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(30rem,calc(100vw-2rem))]"
    >
      <p class="mb-4 text-muted">
        Cuéntanos qué pasa. El equipo de moderación lo revisará y, si incumple las normas, lo
        ocultará.
      </p>
      @if (failure(); as message) {
        <p-message severity="warn" class="mb-4 block">{{ message }}</p-message>
      }
      <form id="report-form" novalidate (submit)="onSubmit($event)">
        <app-field label="Motivo" inputId="report-reason" [field]="reportForm.reason">
          <textarea
            pTextarea
            id="report-reason"
            rows="3"
            class="w-full"
            [formField]="reportForm.reason"
            [attr.aria-describedby]="describe('report-reason', reportForm.reason)"
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
          <span pButtonLabel>Cancelar</span>
        </button>
        <button
          pButton
          type="submit"
          form="report-form"
          severity="danger"
          [loading]="reportForm().submitting()"
        >
          <span pButtonLabel>Enviar la denuncia</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class ReportDialog {
  private readonly api = inject(CommunityApi);

  readonly reported = output();

  protected readonly visible = signal(false);
  private readonly target = signal<{ kind: 'posts' | 'comments'; id: string } | null>(null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected readonly model = signal({ reason: '' });
  protected readonly reportForm = form(this.model, (path) => {
    required(path.reason, { message: 'Cuéntanos el motivo' });
    maxLength(path.reason, 500, { message: 'Máximo 500 caracteres' });
  });

  open(kind: 'posts' | 'comments', id: string): void {
    this.target.set({ kind, id });
    this.failure.set(null);
    this.reportForm().reset({ reason: '' });
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const target = this.target();
    if (!target) {
      return;
    }
    await submit(this.reportForm, {
      action: async () => {
        try {
          await this.api.report(target.kind, target.id, this.model().reason.trim());
          this.visible.set(false);
          this.reported.emit();
        } catch (error) {
          this.failure.set(toProblem(error).detail);
        }
        return undefined;
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
