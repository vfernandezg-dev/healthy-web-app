import { Component, computed, inject, signal } from '@angular/core';
import {
  FormField,
  email,
  form,
  maxLength,
  minLength,
  required,
  submit,
} from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideCheck, LucideCircle } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { toProblem } from '@core/api/problem';
import { AuthStore } from '@core/auth/auth-store';
import { Toaster } from '@core/ui/toaster';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { PasswordField, PasswordInput } from '@shared/forms/password-field';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
import { MESSAGES, PASSWORD_MAX, PASSWORD_MIN } from '@shared/forms/validation';

/** Registro público, solo para clientes (los nutricionistas entran por invitación). */
@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    FormField,
    InputText,
    ButtonDirective,
    ButtonLabel,
    Message,
    LucideCheck,
    LucideCircle,
    LabeledField,
    PasswordField,
    PasswordInput,
  ],
  templateUrl: './register.html',
})
export class Register {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  protected readonly model = signal({ firstName: '', lastName: '', email: '', password: '' });
  protected readonly registerForm = form(this.model, (path) => {
    required(path.firstName, { message: 'Escribe tu nombre' });
    maxLength(path.firstName, 60, { message: 'Máximo 60 caracteres' });
    required(path.lastName, { message: 'Escribe tu apellido' });
    maxLength(path.lastName, 60, { message: 'Máximo 60 caracteres' });
    required(path.email, { message: 'Escribe tu correo' });
    email(path.email, { message: MESSAGES.email });
    maxLength(path.email, 254, { message: 'Máximo 254 caracteres' });
    required(path.password, { message: 'Elige una contraseña' });
    minLength(path.password, PASSWORD_MIN, { message: MESSAGES.passwordLength });
    maxLength(path.password, PASSWORD_MAX, { message: MESSAGES.passwordLength });
  });
  /** Requisito de la contraseña, que se marca en vivo mientras se escribe. */
  protected readonly passwordLongEnough = computed(
    () => this.model().password.length >= PASSWORD_MIN,
  );
  protected readonly passwordMin = PASSWORD_MIN;
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.registerForm, {
      action: async () => {
        const { firstName, lastName, email: address, password } = this.model();
        try {
          const user = await this.auth.register({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: address.trim(),
            password,
          });
          this.toaster.success(
            `Te damos la bienvenida, ${user.firstName}`,
            'Tu cuenta está lista.',
          );
          await this.router.navigateByUrl(this.auth.homeUrl());
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.registerForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
