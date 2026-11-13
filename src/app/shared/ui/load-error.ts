import { Component, computed, input, output } from '@angular/core';
import { LucideRefreshCw, LucideTriangleExclamationPoint } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { toProblem } from '@core/api/problem';

/**
 * Estado de error de una lectura (un httpResource que falló), con el mensaje de la API y un botón para reintentar.
 * Alineado a la izquierda, como el estado vacío: icono en línea, título, explicación y la acción.
 */
@Component({
  selector: 'app-load-error',
  imports: [ButtonDirective, LucideTriangleExclamationPoint, LucideRefreshCw],
  host: { class: 'block' },
  template: `
    @if (compact()) {
      <p class="text-sm text-danger-700" role="alert">
        {{ title() }}.
        <button type="button" class="font-semibold underline" (click)="retry.emit()">
          Reintentar
        </button>
      </p>
    } @else {
      <div class="card flex items-start gap-4 px-5 py-6" role="alert">
        <svg lucideTriangleExclamationPoint class="mt-0.5 text-danger-700"></svg>
        <div class="min-w-0">
          <p class="font-semibold">{{ title() }}</p>
          <p class="mt-1 max-w-prose text-sm text-muted">{{ detail() }}</p>
          <button
            pButton
            type="button"
            severity="secondary"
            size="small"
            class="mt-4"
            (click)="retry.emit()"
          >
            <svg lucideRefreshCw></svg>
            Reintentar
          </button>
        </div>
      </div>
    }
  `,
})
export class LoadError {
  readonly error = input<unknown>();
  readonly title = input('No se ha podido cargar');
  /** Una línea dentro de una tarjeta (paneles de inicio), en lugar del bloque de página. */
  readonly compact = input(false);
  readonly retry = output();

  protected readonly detail = computed(() => toProblem(this.error()).detail);
}
