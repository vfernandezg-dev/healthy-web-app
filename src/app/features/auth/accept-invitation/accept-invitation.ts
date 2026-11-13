import { Component, inject, resource, signal } from '@angular/core';
import { FormField, form, maxLength, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideLink2Off } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Skeleton } from 'primeng/skeleton';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '@core/api/problem';
import { AuthApi } from '@core/auth/auth-api';
import { AuthStore } from '@core/auth/auth-store';
import { Toaster } from '@core/ui/toaster';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { PasswordField, PasswordInput } from '@shared/forms/password-field';
import { MESSAGES, PASSWORD_MAX, PASSWORD_MIN } from '@shared/forms/validation';
import { takeFragmentToken } from '../fragment-token';
import { formSubmitter } from '@shared/forms/form-submitter';
import { StatusPanel } from '@shared/ui/status-panel';

/** Alta de un nutricionista desde su invitación (/auth/accept-invitation#token=…). */
@Component({
  selector: 'app-accept-invitation',
  imports: [
    RouterLink,
    FormField,
    InputText,
    Textarea,
    ButtonDirective,
    Message,
    Skeleton,
    StatusPanel,
    LabeledField,
    PasswordField,
    PasswordInput,
  ],
  templateUrl: './accept-invitation.html',
})
export class AcceptInvitation {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(AuthApi);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  protected readonly token = takeFragmentToken();
  /** A quién va dirigida la invitación (y si sigue siendo válida). */
  protected readonly invitation = resource({
    params: () => this.token ?? undefined,
    loader: ({ params: token }) => this.api.previewInvitation(token),
  });

  protected readonly hint = `Entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
  protected readonly model = signal({ password: '', bio: '' });
  protected readonly acceptForm = form(this.model, (path) => {
    required(path.password, { message: 'Elige una contraseña' });
    minLength(path.password, PASSWORD_MIN, { message: MESSAGES.passwordLength });
    maxLength(path.password, PASSWORD_MAX, { message: MESSAGES.passwordLength });
    maxLength(path.bio, 2000, { message: 'Máximo 2000 caracteres' });
  });
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;
  protected readonly brokenLinkIcon = LucideLink2Off;

  protected invitationError(): string {
    return toProblem(this.invitation.error()).detail;
  }

  protected save(event: Event): Promise<void> {
    const token = this.token;
    if (!token) {
      event.preventDefault();
      return Promise.resolve();
    }
    return this.submitForm(event, this.acceptForm, {
      failure: this.failure,
      save: () => {
        const { password, bio } = this.model();
        return this.auth.acceptInvitation(token, password, bio.trim() || null);
      },
      onSuccess: async (user) => {
        this.toaster.success(`Te damos la bienvenida, ${user.firstName}`, 'Tu cuenta está lista.');
        await this.router.navigateByUrl(this.auth.homeUrl());
      },
    });
  }
}
