import { dialogState } from './dialog-state';

describe('dialogState', () => {
  it('abre con lo que se edita, también con null (crear uno nuevo), y cierra', () => {
    const dialog = dialogState<{ id: string } | null>();
    expect(dialog.isOpen()).toBe(false);

    dialog.open(null);
    expect(dialog.isOpen()).toBe(true);
    expect(dialog.data()).toEqual({ value: null });

    dialog.open({ id: 'g1' });
    expect(dialog.data()?.value).toEqual({ id: 'g1' });

    dialog.close();
    expect(dialog.isOpen()).toBe(false);
    expect(dialog.data()).toBeNull();
  });
});
