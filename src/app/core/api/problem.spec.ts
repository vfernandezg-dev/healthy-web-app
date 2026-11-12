import { HttpErrorResponse } from '@angular/common/http';
import { toProblem } from './problem';

describe('toProblem', () => {
  it('lee el código, el detalle, los errores de campo y las propiedades extra', () => {
    const problem = toProblem(
      new HttpErrorResponse({
        status: 403,
        error: {
          type: 'about:blank',
          title: 'Forbidden',
          status: 403,
          code: 'subscription-required',
          detail: 'Este contenido es Premium',
          requiredTier: 'PREMIUM',
        },
      }),
    );

    expect(problem).toEqual({
      status: 403,
      code: 'subscription-required',
      summary: 'Sin acceso',
      detail: 'Este contenido es Premium',
      errors: [],
      properties: { requiredTier: 'PREMIUM' },
    });
  });

  it('conserva solo los errores de campo bien formados', () => {
    const problem = toProblem(
      new HttpErrorResponse({
        status: 422,
        error: {
          code: 'validation-failed',
          detail: 'Revisa los datos del formulario',
          errors: [{ field: 'email', message: 'Debe ser un email válido' }, { campo: 'x' }],
        },
      }),
    );

    expect(problem.errors).toEqual([{ field: 'email', message: 'Debe ser un email válido' }]);
    expect(problem.summary).toBe('Revisa los datos');
  });

  it('sin respuesta del servidor es un error de red', () => {
    const problem = toProblem(
      new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') }),
    );

    expect(problem.code).toBe('network-error');
    expect(problem.detail).toContain('No hay conexión');
  });

  it('un 5xx sin cuerpo tiene un mensaje genérico', () => {
    const problem = toProblem(new HttpErrorResponse({ status: 503, error: null }));

    expect(problem).toMatchObject({ code: 'http-503', summary: 'Error del servidor' });
    expect(problem.detail).toContain('Algo ha fallado');
  });
});
