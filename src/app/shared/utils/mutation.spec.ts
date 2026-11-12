import { TestBed } from '@angular/core/testing';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { type Mutation, type MutationOptions, mutation } from './mutation';

function setup<A extends unknown[], R>(
  action: (...args: A) => Promise<R>,
  options: MutationOptions<A, R> = {},
  confirmed = true,
) {
  const toaster = { success: vi.fn() };
  const confirmer = { ask: vi.fn(() => Promise.resolve(confirmed)) };
  TestBed.configureTestingModule({
    providers: [
      { provide: Toaster, useValue: toaster },
      { provide: Confirmer, useValue: confirmer },
    ],
  });
  let result!: Mutation<A>;
  TestBed.runInInjectionContext(() => {
    result = mutation(action, options);
  });
  return { action: result, toaster, confirmer };
}

describe('mutation', () => {
  it('ejecuta, avisa y llama a onSuccess', async () => {
    const onSuccess = vi.fn();
    const { action, toaster } = setup((id: string) => Promise.resolve(`publicado ${id}`), {
      success: 'Publicado',
      onSuccess,
    });

    await expect(action.run('c1')).resolves.toBe(true);

    expect(toaster.success).toHaveBeenCalledWith('Publicado');
    expect(onSuccess).toHaveBeenCalledWith('publicado c1', 'c1');
  });

  it('está pendiente mientras corre y no se lanza dos veces', async () => {
    let finish!: () => void;
    const work = vi.fn(() => new Promise<void>((resolve) => (finish = resolve)));
    const { action } = setup(work);

    const first = action.run();
    await Promise.resolve();
    expect(action.pending()).toBe(true);
    expect(action.running()).toEqual([]);
    await expect(action.run()).resolves.toBe(false);

    finish();
    await expect(first).resolves.toBe(true);
    expect(action.pending()).toBe(false);
    expect(work).toHaveBeenCalledTimes(1);
  });

  it('si no se confirma, no hace nada', async () => {
    const work = vi.fn(() => Promise.resolve());
    const { action, confirmer } = setup(
      work,
      { confirm: { header: 'Eliminar', message: '¿Seguro?', acceptLabel: 'Eliminar' } },
      false,
    );

    await expect(action.run()).resolves.toBe(false);

    expect(confirmer.ask).toHaveBeenCalled();
    expect(work).not.toHaveBeenCalled();
  });

  it('si falla, devuelve false sin lanzar ni avisar de éxito', async () => {
    const { action, toaster } = setup(() => Promise.reject(new Error('409')), {
      success: 'Hecho',
    });

    await expect(action.run()).resolves.toBe(false);

    expect(toaster.success).not.toHaveBeenCalled();
    expect(action.pending()).toBe(false);
  });
});
