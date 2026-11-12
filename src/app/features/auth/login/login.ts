import { Component, inject, input, signal } from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { toProblem } from '../../../core/api/problem';
import { AuthStore } from '../../../core/auth/auth-store';
import { safeReturnUrl } from '../../../core/auth/roles';
import { LabeledField, fieldDescription } from '../../../shared/forms/labeled-field';
import { PasswordField, PasswordInput } from '../../../shared/forms/password-field';
import { focusFirstInvalid, serverFieldErrors } from '../../../shared/forms/server-errors';
import { MESSAGES } from '../../../shared/forms/validation';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    FormField,
    InputText,
    ButtonDirective,
    ButtonLabel,
    Message,
    LabeledField,
    PasswordField,
    PasswordInput,
  ],
  templateUrl: './login.html',
})
export class Login {
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

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.loginForm, {
      action: async () => {
        const { email: address, password } = this.model();
        try {
          const user = await this.auth.login(address.trim(), password);
          await this.router.navigateByUrl(safeReturnUrl(this.returnUrl(), user.role));
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.loginForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
