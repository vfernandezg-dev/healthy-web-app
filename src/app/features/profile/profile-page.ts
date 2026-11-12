import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import {
  FormField,
  form,
  max,
  maxLength,
  min,
  minLength,
  required,
  submit,
  validate,
} from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '@core/api/problem';
import type { ClientData, MeResponse } from '@core/api/schema';
import { AuthStore } from '@core/auth/auth-store';
import { Toaster } from '@core/ui/toaster';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { PasswordField, PasswordInput } from '@shared/forms/password-field';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
import { MESSAGES, PASSWORD_MAX, PASSWORD_MIN } from '@shared/forms/validation';
import { SEX_LABELS, optionsOf } from '@shared/i18n/labels';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { ageOn, todayIso } from '@shared/utils/date';
import { ProfileApi } from './data/profile-api';

type Sex = NonNullable<ClientData['sex']>;

interface ProfileModel {
  firstName: string;
  lastName: string;
  bio: string;
  sex: Sex | null;
  /** `YYYY-MM-DD` o vacío (input type="date"). */
  birthDate: string;
  heightCm: number | null;
  weightKg: number | null;
}

function toModel(me: MeResponse | undefined): ProfileModel {
  return {
    firstName: me?.firstName ?? '',
    lastName: me?.lastName ?? '',
    bio: me?.nutritionist?.bio ?? '',
    sex: me?.client?.sex ?? null,
    birthDate: me?.client?.birthDate ?? '',
    heightCm: me?.client?.heightCm ?? null,
    weightKg: me?.client?.weightKg ?? null,
  };
}

/** Datos personales y contraseña. Los clientes completan aquí lo que usa la recomendación de peso. */
@Component({
  selector: 'app-profile-page',
  imports: [
    FormField,
    InputText,
    InputNumber,
    SelectButton,
    Textarea,
    Skeleton,
    ButtonDirective,
    ButtonLabel,
    LabeledField,
    PasswordField,
    PasswordInput,
    LoadError,
    PageHeader,
  ],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  private readonly api = inject(ProfileApi);
  private readonly auth = inject(AuthStore);
  private readonly toaster = inject(Toaster);

  protected readonly me = this.api.me();
  /** Los datos cargados (value() lanzaría si la petición falló). */
  private readonly account = computed(() => (this.me.hasValue() ? this.me.value() : undefined));
  protected readonly isClient = computed(() => this.account()?.role === 'CLIENT');
  protected readonly isNutritionist = computed(() => this.account()?.role === 'NUTRITIONIST');
  protected readonly sexOptions = optionsOf(SEX_LABELS);
  protected readonly today = todayIso();
  protected readonly describe = fieldDescription;

  // ---------------------------------------------------------------- datos personales

  /** Se rellena (y se vuelve a rellenar tras guardar) con los datos de la API. */
  protected readonly model = linkedSignal(() => toModel(this.account()));
  protected readonly profileForm = form(this.model, (path) => {
    required(path.firstName, { message: 'Escribe tu nombre' });
    maxLength(path.firstName, 60, { message: 'Máximo 60 caracteres' });
    required(path.lastName, { message: 'Escribe tu apellido' });
    maxLength(path.lastName, 60, { message: 'Máximo 60 caracteres' });
    maxLength(path.bio, 2000, { message: 'Máximo 2000 caracteres' });
    validate(path.birthDate, ({ value }) =>
      value() && value() >= todayIso()
        ? { kind: 'past', message: 'La fecha de nacimiento debe ser anterior a hoy' }
        : undefined,
    );
    min(path.heightCm, 50, { message: 'La altura mínima es 50 cm' });
    max(path.heightCm, 260, { message: 'La altura máxima es 260 cm' });
    min(path.weightKg, 20, { message: 'El peso mínimo es 20 kg' });
    max(path.weightKg, 400, { message: 'El peso máximo es 400 kg' });
  });
  protected readonly age = computed(() => {
    const birthDate = this.model().birthDate;
    return birthDate && birthDate < this.today ? ageOn(birthDate) : null;
  });

  protected async saveProfile(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.profileForm, {
      action: async () => {
        const value = this.model();
        try {
          const updated = await this.api.update({
            firstName: value.firstName.trim(),
            lastName: value.lastName.trim(),
            bio: this.isNutritionist() ? value.bio.trim() || null : null,
            client: this.isClient()
              ? {
                  sex: value.sex,
                  birthDate: value.birthDate || null,
                  heightCm: value.heightCm,
                  weightKg: value.weightKg,
                }
              : null,
          });
          this.me.value.set(updated);
          this.profileForm().reset();
          this.auth.updateUser({ firstName: updated.firstName, lastName: updated.lastName });
          this.toaster.success('Perfil guardado');
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.profileForm, problem);
          }
          this.toaster.problem(problem);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }

  // ---------------------------------------------------------------- contraseña

  protected readonly passwordHint = `Entre ${PASSWORD_MIN} y ${PASSWORD_MAX} caracteres.`;
  protected readonly passwordModel = signal({ currentPassword: '', newPassword: '' });
  protected readonly passwordForm = form(this.passwordModel, (path) => {
    required(path.currentPassword, { message: 'Escribe tu contraseña actual' });
    required(path.newPassword, { message: 'Elige una contraseña nueva' });
    minLength(path.newPassword, PASSWORD_MIN, { message: MESSAGES.passwordLength });
    maxLength(path.newPassword, PASSWORD_MAX, { message: MESSAGES.passwordLength });
  });

  protected async changePassword(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.passwordForm, {
      action: async () => {
        try {
          this.auth.applySession(await this.api.changePassword(this.passwordModel()));
          this.passwordForm().reset({ currentPassword: '', newPassword: '' });
          this.toaster.success(
            'Contraseña cambiada',
            'Hemos cerrado tus sesiones en los demás dispositivos.',
          );
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.passwordForm, problem);
          }
          this.toaster.problem(problem);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
