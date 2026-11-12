import { Component, inject, signal } from '@angular/core';
import { FormField, email, form, required, submit } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { LucideMailCheck } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { toProblem } from '../../../core/api/problem';
import { AuthApi } from '../../../core/auth/auth-api';
import { LabeledField, fieldDescription } from '../../../shared/forms/labeled-field';
import { focusFirstInvalid } from '../../../shared/forms/server-errors';
import { MESSAGES } from '../../../shared/forms/validation';

/** Pide el enlace para restablecer la contraseña. La respuesta es la misma exista o no la cuenta. */
@Component({
  selector: 'app-forgot-password',
  imports: [
    RouterLink,
    FormField,
    InputText,
    ButtonDirective,
    ButtonLabel,
    Message,
    LucideMailCheck,
    LabeledField,
  ],
  template: `
    @if (sentTo(); as address) {
      <div class="text-center">
        <span
          class="mx-auto grid size-14 place-items-center rounded-full bg-brand-50 text-brand-700"
        >
          <svg lucideMailCheck class="size-7"></svg>
        </span>
        <h1 class="mt-6 text-3xl font-bold tracking-tight">Revisa tu correo</h1>
        <p class="mt-3 text-muted" role="status">
          Si hay una cuenta con <strong class="text-ink">{{ address }}</strong
          >, te hemos enviado un enlace para elegir una contraseña nueva. Caduca en 30 minutos.
        </p>
        <a
          routerLink="/auth/login"
          class="mt-8 inline-block font-semibold text-brand-700 hover:underline"
          >Volver a iniciar sesión</a
        >
      </div>
    } @else {
      <h1 class="text-3xl font-bold tracking-tight">Recupera tu contraseña</h1>
      <p class="mt-2 text-muted">
        Escribe el correo de tu cuenta y te enviaremos un enlace para elegir una contraseña nueva.
      </p>
      @if (failure(); as message) {
        <p-message severity="error" class="mt-6 block">{{ message }}</p-message>
      }
      <form class="mt-8 space-y-5" novalidate (submit)="onSubmit($event)">
        <app-field label="Correo electrónico" inputId="forgot-email" [field]="forgotForm.email">
          <input
            pInputText
            id="forgot-email"
            type="email"
            autocomplete="email"
            inputmode="email"
            class="w-full"
            [formField]="forgotForm.email"
            [attr.aria-describedby]="describe('forgot-email', forgotForm.email)"
          />
        </app-field>
        <button pButton type="submit" class="w-full" [loading]="forgotForm().submitting()">
          <span pButtonLabel>Enviar el enlace</span>
        </button>
        <p class="text-center">
          <a routerLink="/auth/login" class="text-sm font-semibold text-brand-700 hover:underline"
            >Volver a iniciar sesión</a
          >
        </p>
      </form>
    }
  `,
})
export class ForgotPassword {
  private readonly api = inject(AuthApi);

  protected readonly model = signal({ email: '' });
  protected readonly forgotForm = form(this.model, (path) => {
    required(path.email, { message: 'Escribe tu correo' });
    email(path.email, { message: MESSAGES.email });
  });
  protected readonly sentTo = signal<string | null>(null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.forgotForm, {
      action: async () => {
        const address = this.model().email.trim();
        try {
          await this.api.forgotPassword(address);
          this.sentTo.set(address);
        } catch (error) {
          this.failure.set(toProblem(error).detail);
        }
        return undefined;
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
