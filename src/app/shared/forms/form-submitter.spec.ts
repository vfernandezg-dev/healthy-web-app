import { HttpErrorResponse } from '@angular/common/http';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type FieldTree, form, required } from '@angular/forms/signals';
import { Toaster } from '@core/ui/toaster';
import { firstValueFrom, throwError } from 'rxjs';
import { type FormSubmitter, formSubmitter } from './form-submitter';

/** Como una escritura real que falla: HttpClient convertido en promesa. */
const failing = (error: HttpErrorResponse) => () => firstValueFrom(throwError(() => error));

interface Model {
  name: string;
}

function setup(initial = 'Recetas') {
  const toaster = { problem: vi.fn() };
  TestBed.configureTestingModule({ providers: [{ provide: Toaster, useValue: toaster }] });
  let submitForm!: FormSubmitter;
  let tree!: FieldTree<Model>;
  TestBed.runInInjectionContext(() => {
    submitForm = formSubmitter();
    tree = form(signal<Model>({ name: initial }), (path) => {
      required(path.name, { message: 'Ponle un nombre' });
    });
  });
  return { submitForm, tree, toaster };
}

const unprocessable = new HttpErrorResponse({
  status: 422,
  error: {
    code: 'validation',
    detail: 'Revisa los datos',
    errors: [{ field: 'name', message: 'Ya existe' }],
  },
});

describe('formSubmitter', () => {
  it('guarda y llama a onSuccess con el resultado', async () => {
    const { submitForm, tree } = setup();
    const onSuccess = vi.fn();

    await submitForm(null, tree, { save: () => Promise.resolve({ id: 'g1' }), onSuccess });

    expect(onSuccess).toHaveBeenCalledWith({ id: 'g1' });
  });

  it('si no es válido, no guarda', async () => {
    const { submitForm, tree } = setup('');
    const save = vi.fn();

    await submitForm(null, tree, { save });

    expect(save).not.toHaveBeenCalled();
  });

  it('un 422 marca los errores en sus campos', async () => {
    const { submitForm, tree, toaster } = setup();

    await submitForm(null, tree, { save: failing(unprocessable) });

    expect(tree.name().errors()).toEqual([
      expect.objectContaining({ kind: 'server', message: 'Ya existe' }),
    ]);
    expect(toaster.problem).not.toHaveBeenCalled();
  });

  it('otro error va a failure, que se vacía al volver a enviar', async () => {
    const { submitForm, tree } = setup();
    const failure = signal<string | null>(null);
    const conflict = new HttpErrorResponse({
      status: 409,
      error: { code: 'name-taken', detail: 'Ya hay un grupo con ese nombre' },
    });

    await submitForm(null, tree, { save: failing(conflict), failure });
    expect(failure()).toBe('Ya hay un grupo con ese nombre');

    const retry = submitForm(null, tree, { save: () => new Promise(() => undefined), failure });
    expect(failure()).toBeNull();
    void retry;
  });

  it('sin failure, el error sale en un aviso', async () => {
    const { submitForm, tree, toaster } = setup();

    await submitForm(null, tree, {
      save: failing(new HttpErrorResponse({ status: 0 })),
    });

    expect(toaster.problem).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'network-error' }),
    );
  });

  it('evita el envío nativo del formulario', async () => {
    const { submitForm, tree } = setup();
    const event = new Event('submit', { cancelable: true });

    await submitForm(event, tree, { save: () => Promise.resolve(null) });

    expect(event.defaultPrevented).toBe(true);
  });

  it('un error con code de un campo (409 email-taken) se marca en ese campo', async () => {
    const { submitForm, tree, toaster } = setup();
    const taken = new HttpErrorResponse({
      status: 409,
      error: { code: 'name-taken', detail: 'Ya existe un grupo con ese nombre' },
    });

    await submitForm(null, tree, { save: failing(taken), codeFields: { 'name-taken': tree.name } });

    expect(tree.name().errors()).toEqual([
      expect.objectContaining({ kind: 'server', message: 'Ya existe un grupo con ese nombre' }),
    ]);
    expect(toaster.problem).not.toHaveBeenCalled();
  });
});
