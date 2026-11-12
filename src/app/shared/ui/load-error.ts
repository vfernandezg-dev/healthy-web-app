import { Component, computed, input, output } from '@angular/core';
import { LucideRefreshCw, LucideTriangleExclamationPoint } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { toProblem } from '@core/api/problem';

/**
 * Estado de error de una lectura (un httpResource que falló), con el mensaje de la API y un botón para reintentar. */
@Component({
  selector: 'app-load-error',
  imports: [ButtonDirective, LucideTriangleExclamationPoint, LucideRefreshCw],
  host: { class: 'block' },
  template: `
    @if (compact()) {
      <p class="text-sm text-red-700" role="alert">
        {{ title() }}.
        <button type="button" class="font-semibold underline" (click)="retry.emit()">
          Reintentar
        </button>
      </p>
    } @else {
      <div class="card flex flex-col items-center gap-3 px-6 py-10 text-center" role="alert">
        <span class="grid size-12 place-items-center rounded-full bg-red-50 text-red-700">
          <svg lucideTriangleExclamationPoint class="size-6"></svg>
        </span>
        <p class="text-lg font-bold">{{ title() }}</p>
        <p class="max-w-md text-muted">{{ detail() }}</p>
        <button pButton type="button" severity="secondary" class="mt-2" (click)="retry.emit()">
          <svg lucideRefreshCw></svg>
          Reintentar
        </button>
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
