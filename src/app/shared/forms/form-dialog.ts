import { Component, computed, input, model, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Message } from 'primeng/message';

const WIDTHS = {
  sm: 'w-[min(30rem,calc(100vw-2rem))]',
  md: 'w-[min(32rem,calc(100vw-2rem))]',
  lg: 'w-[min(36rem,calc(100vw-2rem))]',
} as const;

/**
 * Marco común de los diálogos con formulario: cabecera, mensaje de error, el contenido (el `<form>` con su `id`) y
 * los botones Cancelar / enviar. Es presentacional: el diálogo que lo usa tiene el formulario y lo guarda.
 *
 * Empieza abierto: la página crea el diálogo al abrirlo (ver `dialogState`). Al cerrarse (Cancelar, la X, Escape o
 * `open.set(false)` tras guardar) emite `closed` cuando termina la animación, y entonces la página lo destruye.
 */
@Component({
  selector: 'app-form-dialog',
  imports: [Dialog, Message, ButtonDirective],
  template: `
    <p-dialog
      [(visible)]="open"
      [header]="header()"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      [styleClass]="widthClass()"
      (onHide)="closed.emit()"
    >
      @if (failure(); as message) {
        <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
      }
      <ng-content />
      <ng-template #footer>
        <button pButton type="button" severity="secondary" variant="text" (click)="open.set(false)">
          Cancelar
        </button>
        <button
          pButton
          type="submit"
          [attr.form]="formId()"
          [severity]="danger() ? 'danger' : 'primary'"
          [loading]="submitting()"
        >
          {{ submitLabel() }}
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class FormDialog {
  readonly header = input.required<string>();
  /** `id` del `<form>` del contenido: el botón de enviar está fuera de él, en el pie. */
  readonly formId = input.required<string>();
  readonly submitLabel = input('Guardar');
  readonly submitting = input(false);
  /** Error que no es de un campo (ver `formSubmitter`). */
  readonly failure = input<string | null>(null);
  /** Acción destructiva (ocultar, denunciar): el botón de enviar va en rojo. */
  readonly danger = input(false);
  readonly width = input<keyof typeof WIDTHS>('md');
  readonly open = model(true);
  readonly closed = output();

  protected readonly widthClass = computed(() => WIDTHS[this.width()]);
}
