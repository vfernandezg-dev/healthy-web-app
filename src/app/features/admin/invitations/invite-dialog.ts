import { Component, inject, output, signal } from '@angular/core';
import { FormField, email, form, maxLength, required, schema } from '@angular/forms/signals';
import { InputText } from 'primeng/inputtext';
import type { InvitationResponse } from '@core/api/schema';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { AdminApi } from '../data/admin-api';

interface InviteModel {
  firstName: string;
  lastName: string;
  email: string;
}

export const inviteSchema = schema<InviteModel>((path) => {
  required(path.firstName, { message: 'Escribe su nombre' });
  maxLength(path.firstName, 60, { message: 'Máximo 60 caracteres' });
  required(path.lastName, { message: 'Escribe sus apellidos' });
  maxLength(path.lastName, 60, { message: 'Máximo 60 caracteres' });
  required(path.email, { message: 'Escribe su correo' });
  email(path.email, { message: 'Escribe un correo válido' });
  maxLength(path.email, 254, { message: 'Máximo 254 caracteres' });
});

/** Invitar a un nutricionista: recibe por correo un enlace para crear su cuenta. La página lo crea al abrirlo. */
@Component({
  selector: 'app-invite-dialog',
  imports: [FormField, InputText, LabeledField, FormDialog],
  templateUrl: './invite-dialog.html',
})
export class InviteDialog {
  private readonly api = inject(AdminApi);
  private readonly submitForm = formSubmitter();

  readonly invited = output<InvitationResponse>();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected readonly model = signal<InviteModel>({ firstName: '', lastName: '', email: '' });
  protected readonly inviteForm = form(this.model, inviteSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.inviteForm, {
      failure: this.failure,
      // Ya hay una cuenta con ese correo: el error va en el campo.
      codeFields: { 'email-taken': this.inviteForm.email },
      save: () => {
        const { firstName, lastName, email: address } = this.model();
        return this.api.invite({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: address.trim(),
        });
      },
      onSuccess: (invitation) => {
        this.invited.emit(invitation);
        this.open.set(false);
      },
    });
  }
}
