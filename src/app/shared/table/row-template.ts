import { Directive, input } from '@angular/core';

/**
 * Da tipo a la variable de una plantilla que pinta un elemento de una lista. En p-table, `let-row` es `any`; con
 * `<ng-template #body let-user [appRow]="items()">` el compilador sabe que `user` es un elemento de `items()`
 * (`ngTemplateContextGuard`) y comprueba los accesos a sus propiedades. Sirve igual para las plantillas propias que
 * se pintan con ngTemplateOutlet y reciben un elemento.
 */
@Directive({ selector: 'ng-template[appRow]' })
export class RowTemplate<T> {
  /** Solo para inferir el tipo de la fila. */
  readonly appRow = input.required<readonly T[]>();

  static ngTemplateContextGuard<T>(
    _directive: RowTemplate<T>,
    _context: unknown,
  ): _context is { $implicit: T } {
    return true;
  }
}
