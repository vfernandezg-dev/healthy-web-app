import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import type { Problem } from '../../core/api/problem';
import { serverFieldErrors } from './server-errors';

function problem(errors: Problem['errors']): Problem {
  return {
    status: 422,
    code: 'validation-failed',
    summary: 'Revisa los datos',
    detail: 'Revisa los datos del formulario',
    errors,
    properties: {},
  };
}

describe('serverFieldErrors', () => {
  const createForm = () =>
    TestBed.runInInjectionContext(() => form(signal({ email: '', profile: { heightCm: 170 } })));

  it('lleva cada error de la API a su campo, también los anidados', () => {
    const registerForm = createForm();

    const result = serverFieldErrors(
      registerForm,
      problem([
        { field: 'email', message: 'Ya existe una cuenta con ese correo' },
        { field: 'profile.heightCm', message: 'Máximo 250' },
      ]),
    );

    expect(result).toEqual([
      {
        kind: 'server',
        message: 'Ya existe una cuenta con ese correo',
        fieldTree: registerForm.email,
      },
      { kind: 'server', message: 'Máximo 250', fieldTree: registerForm.profile.heightCm },
    ]);
  });

  it('ignora los campos que el formulario no tiene', () => {
    expect(
      serverFieldErrors(createForm(), problem([{ field: 'role', message: 'x' }])),
    ).toBeUndefined();
  });
});
