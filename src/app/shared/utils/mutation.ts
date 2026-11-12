import { type Signal, inject, signal } from '@angular/core';
import { type ConfirmOptions, Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';

/** Una acción que escribe en la API (publicar, borrar, aprobar...), con su estado. */
export interface Mutation<A extends unknown[]> {
  /** Está en marcha: para el `[loading]` del botón y para no lanzarla dos veces. */
  readonly pending: Signal<boolean>;
  /**
   * La ejecuta (tras confirmarla, si se pidió). Devuelve si se hizo: false si se canceló, si ya estaba en marcha o si
   * falló. Nunca lanza: los errores de escritura ya los avisa el interceptor de errores.
   */
  run(...args: A): Promise<boolean>;
}

export interface MutationOptions<A extends unknown[], R> {
  /** Pide confirmación antes (acciones destructivas). */
  readonly confirm?: ConfirmOptions | ((...args: A) => ConfirmOptions);
  /** Aviso al terminar bien. */
  readonly success?: string | ((result: R, ...args: A) => string);
  /** Tras terminar bien (actualizar la vista, navegar...). */
  readonly onSuccess?: (result: R, ...args: A) => void | Promise<void>;
}

/**
 * Una escritura con confirmación opcional, estado `pending`, aviso de éxito y errores avisados una sola vez (por el
 * interceptor). Sustituye al patrón `busy.set(true); try { … } catch {} finally { busy.set(false) }` de cada
 * componente. Llamar en el contexto de inyección.
 *
 * ```ts
 * protected readonly archive = mutation(() => this.api.archive(this.id()), {
 *   confirm: { header: 'Archivar', message: '…', acceptLabel: 'Archivar', danger: true },
 *   success: 'Archivado',
 *   onSuccess: (item) => this.detail.set(item),
 * });
 * // <button pButton [loading]="archive.pending()" (click)="archive.run()">Archivar</button>
 * ```
 */
export function mutation<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: MutationOptions<A, R> = {},
): Mutation<A> {
  const toaster = inject(Toaster);
  const confirmer = inject(Confirmer);
  const pending = signal(false);

  return {
    pending: pending.asReadonly(),
    async run(...args: A): Promise<boolean> {
      if (pending()) {
        return false;
      }
      const confirm =
        typeof options.confirm === 'function' ? options.confirm(...args) : options.confirm;
      if (confirm && !(await confirmer.ask(confirm))) {
        return false;
      }
      pending.set(true);
      try {
        const result = await action(...args);
        const success =
          typeof options.success === 'function'
            ? options.success(result, ...args)
            : options.success;
        if (success) {
          toaster.success(success);
        }
        await options.onSuccess?.(result, ...args);
        return true;
      } catch {
        // El interceptor de errores ya ha avisado (las escrituras sin silentErrors()).
        return false;
      } finally {
        pending.set(false);
      }
    },
  };
}
