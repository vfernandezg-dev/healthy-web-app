import { Component, computed, input } from '@angular/core';
import type { FieldTree } from '@angular/forms/signals';
import { LucideCircleAlert } from '@lucide/angular';

/**
 * Etiqueta, control y mensajes de un campo. El control va proyectado y tiene que usar el mismo `inputId` como id
 * y `describedBy(...)` como aria-describedby (ver {@link fieldDescription}).
 *
 * La etiqueta tiene el id `{inputId}-label`: los controles cuyo foco no es un <input> (p-select) se enlazan con
 * `ariaLabelledBy`, porque un <label for> no puede nombrar a un elemento que no es de formulario.
 *
 * El error se muestra cuando el campo se ha tocado (o tras intentar enviar el formulario) y es inválido; los
 * mensajes vienen de los validadores de Signal Forms o de la API (errores de campo de un 422).
 */
@Component({
  selector: 'app-field',
  imports: [LucideCircleAlert],
  host: { class: 'block' },
  template: `
    <label
      [for]="inputId()"
      [id]="inputId() + '-label'"
      class="mb-1.5 block text-sm font-semibold text-ink"
    >
      {{ label() }}
      @if (optional()) {
        <span class="font-normal text-muted">(opcional)</span>
      }
    </label>
    <ng-content />
    @if (error(); as message) {
      <p [id]="inputId() + '-error'" class="mt-1.5 flex items-start gap-1.5 text-sm text-red-700">
        <svg lucideCircleAlert class="mt-0.5 size-4"></svg>
        <span>{{ message }}</span>
      </p>
    } @else if (hint()) {
      <p [id]="inputId() + '-hint'" class="mt-1.5 text-sm text-muted">{{ hint() }}</p>
    }
  `,
})
export class LabeledField {
  readonly label = input.required<string>();
  readonly inputId = input.required<string>();
  readonly field = input<FieldTree<unknown>>();
  readonly hint = input<string>();
  readonly optional = input(false);

  readonly error = computed(() => fieldError(this.field()));
}

/** Primer mensaje de error de un campo, si se ha tocado y es inválido. */
export function fieldError(field: FieldTree<unknown> | undefined): string | null {
  if (!field) {
    return null;
  }
  const state = field();
  if (!state.touched() || !state.invalid()) {
    return null;
  }
  return state.errors()[0]?.message ?? 'Revisa este campo';
}

/**
 * Valor de aria-describedby para el control de un {@link LabeledField}: el id del error si lo hay y, si no, el de la
 * ayuda (si existe).
 */
export function fieldDescription(
  inputId: string,
  field: FieldTree<unknown> | undefined,
  hasHint = false,
): string | null {
  if (fieldError(field)) {
    return `${inputId}-error`;
  }
  return hasHint ? `${inputId}-hint` : null;
}
