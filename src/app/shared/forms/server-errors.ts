import type { FieldTree, TreeValidationResult, ValidationError } from '@angular/forms/signals';
import type { Problem } from '../../core/api/problem';

/**
 * Convierte los errores de campo de un 422 de la API (`errors[{field, message}]`) en errores de Signal Forms,
 * para devolverlos desde la acción de `submit()`. Los campos que el formulario no tiene se ignoran.
 */
export function serverFieldErrors<T>(form: FieldTree<T>, problem: Problem): TreeValidationResult {
  const errors: ValidationError.WithFieldTree[] = [];
  for (const { field, message } of problem.errors) {
    const target = findField(form, field);
    if (target) {
      errors.push({ kind: 'server', message, fieldTree: target });
    }
  }
  return errors.length > 0 ? errors : undefined;
}

function findField(form: FieldTree<unknown>, path: string): FieldTree<unknown> | undefined {
  let current: unknown = form;
  for (const key of path.split('.')) {
    if (typeof current !== 'function' && typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown> | null)?.[key];
    if (current === undefined) {
      return undefined;
    }
  }
  return typeof current === 'function' ? (current as FieldTree<unknown>) : undefined;
}

/** Lleva el foco al primer campo con error (tras intentar enviar un formulario inválido). */
export function focusFirstInvalid(form: FieldTree<unknown>): void {
  form().errorSummary()[0]?.fieldTree().focusBoundControl();
}
