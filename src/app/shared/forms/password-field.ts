import { Component, Directive, contentChild, signal } from '@angular/core';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

/** Campo de contraseña que se puede mostrar en claro. Va dentro de {@link PasswordField}. */
@Directive({
  selector: 'input[appPassword]',
  host: {
    '[type]': 'visible() ? "text" : "password"',
    class: 'pr-12!',
    autocapitalize: 'off',
    spellcheck: 'false',
  },
})
export class PasswordInput {
  readonly visible = signal(false);
}

/**
 * Envuelve un `<input appPassword>` y añade el botón para mostrar u ocultar la contraseña (con su estado
 * anunciado por los lectores de pantalla).
 */
@Component({
  selector: 'app-password-field',
  imports: [LucideEye, LucideEyeOff],
  host: { class: 'relative block' },
  template: `
    <ng-content />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-muted hover:text-ink"
      [attr.aria-label]="input().visible() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      [attr.aria-pressed]="input().visible()"
      (click)="input().visible.set(!input().visible())"
    >
      @if (input().visible()) {
        <svg lucideEyeOff class="size-4.5"></svg>
      } @else {
        <svg lucideEye class="size-4.5"></svg>
      }
    </button>
  `,
})
export class PasswordField {
  protected readonly input = contentChild.required(PasswordInput);
}
