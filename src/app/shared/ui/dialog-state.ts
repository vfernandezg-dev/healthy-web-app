import { type Signal, computed, signal } from '@angular/core';

/**
 * Qué diálogo está abierto y con qué. La página pinta el diálogo solo mientras está abierto, dentro de un `@defer`:
 *
 * ```html
 * @defer (when groupDialog.isOpen(); prefetch on idle) {
 *   @if (groupDialog.data(); as dialog) {
 *     <app-group-dialog [group]="dialog.value" (saved)="…" (closed)="groupDialog.close()" />
 *   }
 * }
 * ```
 *
 * Así el diálogo se crea al abrirlo (sin estado de la vez anterior, sin `reset()`), su código llega en su propio
 * chunk y sus datos solo se piden cuando hace falta. `value` va envuelto para que `null` («crear uno nuevo») también
 * cuente como abierto.
 */
export interface DialogState<T> {
  readonly data: Signal<{ readonly value: T } | null>;
  readonly isOpen: Signal<boolean>;
  open(value: T): void;
  close(): void;
}

export function dialogState<T = void>(): DialogState<T> {
  const data = signal<{ readonly value: T } | null>(null);
  return {
    data: data.asReadonly(),
    isOpen: computed(() => data() !== null),
    open: (value) => data.set({ value }),
    close: () => data.set(null),
  };
}
