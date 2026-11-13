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

/**
 * Tonos de los avatares (fondo 100 y texto 900 de cada escala; todos pasan de 8:1). Cada persona tiene siempre el
 * mismo, para reconocerla de un vistazo en listas y tablas.
 */
const AVATAR_TONES = [
  'bg-brand-100 text-brand-900',
  'bg-accent-100 text-accent-900',
  'bg-saffron-100 text-saffron-900',
  'bg-stone-200 text-stone-800',
] as const;

/** Tono estable para un nombre (la suma de sus códigos de carácter, módulo el número de tonos). */
export function avatarToneOf(name: string | null | undefined): (typeof AVATAR_TONES)[number] {
  const key = (name ?? '').trim().toLocaleLowerCase('es');
  let sum = 0;
  for (const char of key) {
    sum += char.codePointAt(0) ?? 0;
  }
  return AVATAR_TONES[sum % AVATAR_TONES.length] ?? AVATAR_TONES[0];
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
      `grid shrink-0 place-items-center rounded-full font-semibold ${avatarToneOf(this.name())} ${
        this.size() === 'sm' ? 'size-8 text-xs' : 'size-10 text-sm'
      }`,
  );
}
