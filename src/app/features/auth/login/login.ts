import { Component, inject, input, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { AuthStore } from '@core/auth/auth-store';
import { safeReturnUrl } from '@core/auth/roles';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { PasswordField, PasswordInput } from '@shared/forms/password-field';
import { MESSAGES } from '@shared/forms/validation';
import { formSubmitter } from '@shared/forms/form-submitter';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    FormField,
    InputText,
    ButtonDirective,
    Message,
    LabeledField,
    PasswordField,
    PasswordInput,
  ],
  templateUrl: './login.html',
})
export class Login {
  private readonly submitForm = formSubmitter();
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  /** Ruta a la que volver tras iniciar sesión (la pone el guard al pedir una página privada). */
  readonly returnUrl = input<string>();

  protected readonly model = signal({ email: '', password: '' });
  protected readonly loginForm = form(this.model, (path) => {
    required(path.email, { message: 'Escribe tu correo' });
    email(path.email, { message: MESSAGES.email });
    required(path.password, { message: 'Escribe tu contraseña' });
  });
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.loginForm, {
      failure: this.failure,
      save: () => {
        const { email: address, password } = this.model();
        return this.auth.login(address.trim(), password);
      },
      onSuccess: async (user) => {
        await this.router.navigateByUrl(safeReturnUrl(this.returnUrl(), user.role));
      },
    });
  }
}
