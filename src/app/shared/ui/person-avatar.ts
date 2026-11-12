import { Component, computed, input } from '@angular/core';

/** Iniciales de un nombre: la primera letra de la primera y de la última palabra («María López» → «ML»). */
export function initialsOf(name: string | null | undefined): string {
  const [first, ...rest] = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!first) {
    return '?';
  }
  const last = rest.at(-1)?.charAt(0) ?? '';
  return `${first.charAt(0)}${last}`.toLocaleUpperCase('es');
}

/** Círculo con las iniciales de una persona. Es decorativo: el nombre ya va escrito al lado. */
@Component({
  selector: 'app-person-avatar',
  host: { 'aria-hidden': 'true', '[class]': 'classes()' },
  template: `{{ initials() }}`,
})
export class PersonAvatar {
  readonly name = input<string | null | undefined>();
  readonly size = input<'sm' | 'md'>('md');

  protected readonly initials = computed(() => initialsOf(this.name()));
  protected readonly classes = computed(
    () =>
      `grid shrink-0 place-items-center rounded-full bg-mint font-bold text-brand-900 ${
        this.size() === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm'
      }`,
  );
}
