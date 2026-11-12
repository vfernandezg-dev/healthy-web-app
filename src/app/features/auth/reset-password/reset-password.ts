import { Component, inject, signal } from '@angular/core';
import { FormField, form, maxLength, minLength, required, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideLink2Off } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { toProblem } from '../../../core/api/problem';
import { AuthApi } from '../../../core/auth/auth-api';
import { AuthStore } from '../../../core/auth/auth-store';
import { Toaster } from '../../../core/ui/toaster';
import { LabeledField, fieldDescription } from '../../../shared/forms/labeled-field';
import { PasswordField, PasswordInput } from '../../../shared/forms/password-field';
import { focusFirstInvalid, serverFieldErrors } from '../../../shared/forms/server-errors';
import { MESSAGES, PASSWORD_MAX, PASSWORD_MIN } from '../../../shared/forms/validation';
import { takeFragmentToken } from '../fragment-token';

/** Nueva contraseña desde el enlace del correo (/auth/reset-password#token=…). */
@Component({
  selector: 'app-reset-password',
  imports: [
    RouterLink,
    FormField,
    InputText,
    ButtonDirective,
    ButtonLabel,
    Message,
    LucideLink2Off,
    LabeledField,
    PasswordField,
    PasswordInput,
  ],
  template: `
    @if (token) {
      <h1 class="text-3xl font-bold tracking-tight">Elige una contraseña nueva</h1>
      <p class="mt-2 text-muted">
        Al guardarla se cerrarán tus sesiones abiertas en todos los dispositivos.
      </p>
      @if (failure(); as message) {
        <p-message severity="error" styleClass="mt-6">
          {{ message }}
          <a routerLink="/auth/forgot-password" class="font-semibold underline">Pide otro enlace</a
          >.
        </p-message>
      }
      <form class="mt-8 space-y-5" novalidate (submit)="onSubmit($event)">
        <app-field
          label="Contraseña nueva"
          inputId="reset-password"
          [field]="resetForm.password"
          [hint]="hint"
        >
          <app-password-field>
            <input
              pInputText
              appPassword
              id="reset-password"
              autocomplete="new-password"
              class="w-full"
              [formField]="resetForm.password"
              [attr.aria-describedby]="describe('reset-password', resetForm.password, true)"
            />
          </app-password-field>
        </app-field>
        <button pButton type="submit" class="w-full" [loading]="resetForm().submitting()">
          <span pButtonLabel>Guardar la contraseña</span>
        </button>
      </form>
    } @else {
      <div class="text-center">
        <span class="mx-auto grid size-14 place-items-center rounded-full bg-red-50 text-red-700">
          <svg lucideLink2Off class="size-7"></svg>
        </span>
        <h1 class="mt-6 text-3xl font-bold tracking-tight">El enlace no es válido</h1>
        <p class="mt-3 text-muted">
          Abre el enlace completo del correo o pide uno nuevo: caducan a los 30 minutos y solo
          sirven una vez.
        </p>
        <a
          routerLink="/auth/forgot-password"
          class="mt-8 inline-block font-semibold text-brand-700 hover:underline"
          >Pedir otro enlace</a
        >
      </div>
    }
  `,
})
export class ResetPassword {
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

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const token = this.token;
    if (!token) {
      return;
    }
    this.failure.set(null);
    await submit(this.resetForm, {
      action: async () => {
        try {
          await this.api.resetPassword(token, this.model().password);
          // Cambiar la contraseña cierra todas las sesiones, también la de esta pestaña si la había.
          if (this.auth.isAuthenticated()) {
            await this.auth.logout();
          }
          this.toaster.success('Contraseña cambiada', 'Ya puedes iniciar sesión con la nueva.');
          await this.router.navigateByUrl('/auth/login');
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.resetForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
