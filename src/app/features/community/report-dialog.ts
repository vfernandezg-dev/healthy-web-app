import { Component, inject, input, output, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { Textarea } from 'primeng/textarea';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { CommunityApi, type ReportTarget } from './data/community-api';

/** Denunciar una publicación o un comentario. La página lo crea al abrirlo. */
@Component({
  selector: 'app-report-dialog',
  imports: [FormField, Textarea, LabeledField, FormDialog],
  template: `
    <app-form-dialog
      [(open)]="open"
      header="Denunciar"
      formId="report-form"
      submitLabel="Enviar la denuncia"
      [danger]="true"
      [submitting]="reportForm().submitting()"
      [failure]="failure()"
      failureSeverity="warn"
      width="sm"
      (closed)="closed.emit()"
    >
      <p class="mb-4 text-muted">
        Cuéntanos qué pasa. El equipo de moderación lo revisará y, si incumple las normas, lo
        ocultará.
      </p>
      <form id="report-form" novalidate (submit)="save($event)">
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
    </app-form-dialog>
  `,
})
export class ReportDialog {
  private readonly api = inject(CommunityApi);
  private readonly submitForm = formSubmitter();

  readonly target = input.required<ReportTarget>();
  readonly reported = output();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected readonly model = signal({ reason: '' });
  protected readonly reportForm = form(this.model, (path) => {
    required(path.reason, { message: 'Cuéntanos el motivo' });
    maxLength(path.reason, 500, { message: 'Máximo 500 caracteres' });
  });

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.reportForm, {
      failure: this.failure,
      save: () => this.api.report(this.target(), this.model().reason.trim()),
      onSuccess: () => {
        this.reported.emit();
        this.open.set(false);
      },
    });
  }
}
