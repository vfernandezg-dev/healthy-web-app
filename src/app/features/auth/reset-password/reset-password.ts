import { Component, inject, signal } from '@angular/core';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideLink2Off } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { AuthApi } from '@core/auth/auth-api';
import { AuthStore } from '@core/auth/auth-store';
import { Toaster } from '@core/ui/toaster';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { PasswordField, PasswordInput } from '@shared/forms/password-field';
import { MESSAGES, PASSWORD_MAX, PASSWORD_MIN } from '@shared/forms/validation';
import { takeFragmentToken } from '../fragment-token';
import { formSubmitter } from '@shared/forms/form-submitter';

/** Nueva contraseña desde el enlace del correo (/auth/reset-password#token=…). */
@Component({
  selector: 'app-reset-password',
  imports: [
    RouterLink,
    FormField,
    InputText,
    ButtonDirective,
    Message,
    LucideLink2Off,
    LabeledField,
    PasswordField,
    PasswordInput,
  ],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(AuthApi);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  protected readonly token = takeFragmentToken();
  protected readonly hint = `Entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
  protected readonly model = signal({ password: '' });
  protected readonly resetForm = form(this.model, (path) => {
    required(path.password, { message: 'Elige una contraseña' });
    minLength(path.password, PASSWORD_MIN, { message: MESSAGES.passwordLength });
    maxLength(path.password, PASSWORD_MAX, { message: MESSAGES.passwordLength });
  });
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected save(event: Event): Promise<void> {
    const token = this.token;
    if (!token) {
      event.preventDefault();
      return Promise.resolve();
    }
    return this.submitForm(event, this.resetForm, {
      failure: this.failure,
      save: () => this.api.resetPassword(token, this.model().password),
      onSuccess: async () => {
        // Cambiar la contraseña cierra todas las sesiones, también la de esta pestaña si la había.
        if (this.auth.isAuthenticated()) {
          await this.auth.logout();
        }
        this.toaster.success('Contraseña cambiada', 'Ya puedes iniciar sesión con la nueva.');
        await this.router.navigateByUrl('/auth/login');
      },
    });
  }
}
