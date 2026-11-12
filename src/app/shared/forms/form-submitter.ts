import { type WritableSignal, inject } from '@angular/core';
import { type FieldTree, submit } from '@angular/forms/signals';
import { toProblem } from '@core/api/problem';
import { Toaster } from '@core/ui/toaster';
import { focusFirstInvalid, serverFieldErrors } from './server-errors';

export interface SubmitOptions<T> {
  /** Guarda en la API. Las escrituras de formulario llevan `silentErrors()`: los errores los muestra el formulario. */
  readonly save: () => Promise<T>;
  /** Tras guardar (cerrar el diálogo, avisar, navegar...). */
  readonly onSuccess?: (result: T) => void | Promise<void>;
  /**
   * Dónde mostrar un error que no es de un campo (un mensaje dentro del diálogo). Se vacía al volver a enviar. Sin
   * él, el error sale en un aviso.
   */
  readonly failure?: WritableSignal<string | null>;
  /**
   * Errores de la API que son de un campo aunque no sean un 422, por su `code`: por ejemplo, 409 `email-taken` va
   * al campo del correo, con el mensaje de la API.
   */
  readonly codeFields?: Readonly<Record<string, FieldTree<unknown>>>;
}

/** Envía un formulario de Signal Forms (ver {@link formSubmitter}). */
export type FormSubmitter = <M, T>(
  event: Event | null,
  form: FieldTree<M>,
  options: SubmitOptions<T>,
) => Promise<void>;

/**
 * Envío de formularios con el mismo comportamiento en toda la app:
 * - Si el formulario no es válido, no se envía y el foco va al primer campo con error.
 * - Un 422 con errores de campo los marca en sus campos (con el mensaje de la API).
 * - Cualquier otro error va a `failure` (dentro del diálogo) o a un aviso.
 * - Mientras guarda, `form().submitting()` es true (para el botón).
 *
 * Llamar en el contexto de inyección: `private readonly submitForm = formSubmitter();`.
 */
export function formSubmitter(): FormSubmitter {
  const toaster = inject(Toaster);
  return async <M, T>(event: Event | null, form: FieldTree<M>, options: SubmitOptions<T>) => {
    event?.preventDefault();
    options.failure?.set(null);
    await submit(form, {
      action: async () => {
        let result: T;
        try {
          result = await options.save();
        } catch (error) {
          const problem = toProblem(error);
          const codeField = options.codeFields?.[problem.code];
          if (codeField) {
            return { kind: 'server', message: problem.detail, fieldTree: codeField };
          }
          const fieldErrors = serverFieldErrors(form, problem);
          if (fieldErrors) {
            return fieldErrors;
          }
          if (options.failure) {
            options.failure.set(problem.detail);
          } else {
            toaster.problem(problem);
          }
          return undefined;
        }
        await options.onSuccess?.(result);
        return undefined;
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  };
}
