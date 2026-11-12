import { Component, inject, output, signal } from '@angular/core';
import { FormField, email, form, maxLength, required, submit } from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { toProblem } from '../../../core/api/problem';
import type { InvitationResponse } from '../../../core/api/schema';
import { LabeledField, fieldDescription } from '../../../shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '../../../shared/forms/server-errors';
import { AdminApi } from '../data/admin-api';

/** Invitar a un nutricionista: recibe por correo un enlace para crear su cuenta. Se abre con {@link InviteDialog.open}. */
@Component({
  selector: 'app-invite-dialog',
  imports: [FormField, Dialog, InputText, Message, ButtonDirective, ButtonLabel, LabeledField],
  template: `
    <p-dialog
      [(visible)]="visible"
      header="Invitar a un nutricionista"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(32rem,calc(100vw-2rem))]"
    >
      <p class="mb-5 text-muted">
        Le enviaremos un enlace para crear su cuenta. Si caduca antes de que lo use, puedes
        reenviarlo desde la lista.
      </p>
      @if (failure(); as message) {
        <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
      }
      <form id="invite-form" class="space-y-5" novalidate (submit)="onSubmit($event)">
        <div class="grid gap-5 sm:grid-cols-2">
          <app-field label="Nombre" inputId="invite-first-name" [field]="inviteForm.firstName">
            <input
              pInputText
              id="invite-first-name"
              class="w-full"
              autocomplete="off"
              [formField]="inviteForm.firstName"
              [attr.aria-describedby]="describe('invite-first-name', inviteForm.firstName)"
            />
          </app-field>
          <app-field label="Apellidos" inputId="invite-last-name" [field]="inviteForm.lastName">
            <input
              pInputText
              id="invite-last-name"
              class="w-full"
              autocomplete="off"
              [formField]="inviteForm.lastName"
              [attr.aria-describedby]="describe('invite-last-name', inviteForm.lastName)"
            />
          </app-field>
        </div>
        <app-field label="Correo electrónico" inputId="invite-email" [field]="inviteForm.email">
          <input
            pInputText
            id="invite-email"
            type="email"
            class="w-full"
            autocomplete="off"
            [formField]="inviteForm.email"
            [attr.aria-describedby]="describe('invite-email', inviteForm.email)"
          />
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
        <button pButton type="submit" form="invite-form" [loading]="inviteForm().submitting()">
          <span pButtonLabel>Enviar la invitación</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class InviteDialog {
  private readonly api = inject(AdminApi);

  readonly invited = output<InvitationResponse>();

  protected readonly visible = signal(false);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected readonly model = signal({ firstName: '', lastName: '', email: '' });
  protected readonly inviteForm = form(this.model, (path) => {
    required(path.firstName, { message: 'Escribe su nombre' });
    maxLength(path.firstName, 60, { message: 'Máximo 60 caracteres' });
    required(path.lastName, { message: 'Escribe sus apellidos' });
    maxLength(path.lastName, 60, { message: 'Máximo 60 caracteres' });
    required(path.email, { message: 'Escribe su correo' });
    email(path.email, { message: 'Escribe un correo válido' });
    maxLength(path.email, 254, { message: 'Máximo 254 caracteres' });
  });

  open(): void {
    this.failure.set(null);
    this.inviteForm().reset({ firstName: '', lastName: '', email: '' });
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.inviteForm, {
      action: async () => {
        const { firstName, lastName, email: address } = this.model();
        try {
          const invitation = await this.api.invite({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: address.trim(),
          });
          this.visible.set(false);
          this.invited.emit(invitation);
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.code === 'email-taken') {
            return { kind: 'server', message: problem.detail, fieldTree: this.inviteForm.email };
          }
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.inviteForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
