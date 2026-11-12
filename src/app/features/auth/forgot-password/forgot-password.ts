import { Component, inject, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { LucideMailCheck } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { AuthApi } from '@core/auth/auth-api';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { MESSAGES } from '@shared/forms/validation';
import { formSubmitter } from '@shared/forms/form-submitter';

/** Pide el enlace para restablecer la contraseña. La respuesta es la misma exista o no la cuenta. */
@Component({
  selector: 'app-forgot-password',
  imports: [
    RouterLink,
    FormField,
    InputText,
    ButtonDirective,
    Message,
    LucideMailCheck,
    LabeledField,
  ],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(AuthApi);

  protected readonly model = signal({ email: '' });
  protected readonly forgotForm = form(this.model, (path) => {
    required(path.email, { message: 'Escribe tu correo' });
    email(path.email, { message: MESSAGES.email });
  });
  protected readonly sentTo = signal<string | null>(null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected save(event: Event): Promise<void> {
    const address = this.model().email.trim();
    return this.submitForm(event, this.forgotForm, {
      failure: this.failure,
      save: () => this.api.forgotPassword(address),
      onSuccess: () => this.sentTo.set(address),
    });
  }
}
