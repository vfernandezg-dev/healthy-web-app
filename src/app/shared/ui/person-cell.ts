import { Component, computed, input } from '@angular/core';
import { DELETED_ACCOUNT } from '../i18n/labels';
import { PersonAvatar } from './person-avatar';

/** Lo que la API manda de una persona en un listado (null si ya no tiene cuenta). */
export interface PersonSummary {
  readonly name: string;
  readonly email: string;
}

/** Celda de tabla con una persona: nombre y correo (y, si se pide, sus iniciales y el correo como enlace). */
@Component({
  selector: 'app-person-cell',
  imports: [PersonAvatar],
  host: { class: 'flex min-w-0 items-center gap-3' },
  template: `
    @if (avatar()) {
      <app-person-avatar [name]="person()?.name" />
    }
    <div class="min-w-0">
      <p class="truncate font-semibold">{{ name() }}</p>
      @if (person(); as person) {
        @if (mailto()) {
          <a class="block truncate text-sm text-brand-700 hover:underline" [href]="mailtoHref()">{{
            person.email
          }}</a>
        } @else {
          <p class="truncate text-sm text-muted">{{ person.email }}</p>
        }
      }
    </div>
  `,
})
export class PersonCell {
  readonly person = input.required<PersonSummary | null | undefined>();
  readonly avatar = input(false);
  /** El correo como enlace `mailto:`. */
  readonly mailto = input(false);

  protected readonly name = computed(() => this.person()?.name ?? DELETED_ACCOUNT);
  protected readonly mailtoHref = computed(() => {
    const person = this.person();
    return person ? `mailto:${person.email}` : null;
  });
}
