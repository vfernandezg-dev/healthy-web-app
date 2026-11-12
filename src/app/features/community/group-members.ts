import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { MemberResponse } from '@core/api/schema';
import { PersonAvatar } from '@shared/ui/person-avatar';
import { loadMore } from '@shared/utils/load-more';
import { CommunityApi } from './data/community-api';
import { LoadMoreFooter } from '@shared/ui/load-more-footer';
import { mutation } from '@shared/utils/mutation';
import { DELETED_ACCOUNT } from '@shared/i18n/labels';

type Person = NonNullable<MemberResponse['person']>;

/** Identidad de un miembro; el de una cuenta eliminada (sin persona) no tiene id, se distingue por su fecha. */
function memberKey(member: MemberResponse): string {
  return member.person?.id ?? `sin-cuenta:${member.since ?? ''}`;
}

/**
 * Miembros de un grupo (solo los ven sus miembros), de 20 en 20 con «Ver más miembros». El creador ve también las
 * solicitudes pendientes: las aprueba o las rechaza, y puede expulsar a cualquier miembro.
 */
@Component({
  selector: 'app-group-members',
  imports: [LoadMoreFooter, ButtonDirective, Skeleton, PersonAvatar],
  host: { class: 'block' },
  templateUrl: './group-members.html',
})
export class GroupMembers {
  private readonly api = inject(CommunityApi);

  readonly groupId = input.required<string>();
  /** Quien mira es el creador del grupo. */
  readonly owner = input(false);
  /** Ha cambiado el número de miembros. */
  readonly changed = output();

  protected readonly members = loadMore({
    resource: (page) =>
      this.api.members(computed(() => ({ groupId: this.groupId(), page: page() }))),
    key: memberKey,
    resetOn: this.groupId,
  });
  protected readonly pending = computed(() =>
    this.members.items().filter((m) => m.status === 'PENDING'),
  );
  protected readonly active = computed(() =>
    this.members.items().filter((m) => m.status === 'ACTIVE'),
  );

  protected nameOf(member: MemberResponse): string {
    return member.person?.name ?? DELETED_ACCOUNT;
  }

  protected readonly approve = mutation(
    (person: Person) => this.api.approve(this.groupId(), person.id),
    {
      success: (_, person) => `${person.name} ya es miembro`,
      onSuccess: (_, person) => {
        this.members.replace(person.id, (member) => ({ ...member, status: 'ACTIVE' }));
        this.changed.emit();
      },
    },
  );

  protected readonly reject = mutation(
    (person: Person) => this.api.remove(this.groupId(), person.id),
    { success: 'Solicitud rechazada', onSuccess: (_, person) => this.dropped(person) },
  );

  protected readonly kick = mutation(
    (person: Person) => this.api.remove(this.groupId(), person.id),
    {
      confirm: (person) => ({
        header: 'Expulsar del grupo',
        message: `${person.name} dejará de ser miembro. Podrá volver a pedir entrar.`,
        acceptLabel: 'Expulsar',
        danger: true,
      }),
      success: 'Miembro expulsado',
      onSuccess: (_, person) => this.dropped(person),
    },
  );

  /** Lo refleja en la lista ya cargada, sin volver a pedirla entera. */
  private dropped(person: Person): void {
    this.members.remove(person.id);
    this.changed.emit();
  }
}
