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
  template: `
    <section class="card p-5" aria-labelledby="members-title">
      <h2 id="members-title" class="text-lg font-bold">Miembros</h2>

      @if (members.loaded()) {
        @if (owner() && pending().length > 0) {
          <h3 class="mt-4 text-sm font-semibold text-muted">
            Solicitudes pendientes ({{ pending().length }})
          </h3>
          <ul class="mt-2 space-y-3 border-b border-brand-100 pb-4" role="list">
            @for (member of pending(); track $index) {
              <li class="flex flex-wrap items-center justify-between gap-2">
                <span class="flex min-w-0 items-center gap-2">
                  <app-person-avatar size="sm" [name]="member.person?.name" />
                  <span class="truncate font-medium">{{ nameOf(member) }}</span>
                </span>
                @if (member.person; as person) {
                  <span class="flex gap-1">
                    <button
                      pButton
                      type="button"
                      size="small"
                      [attr.aria-label]="'Aprobar a ' + person.name"
                      (click)="approve.run(person)"
                    >
                      Aprobar
                    </button>
                    <button
                      pButton
                      type="button"
                      size="small"
                      severity="secondary"
                      variant="text"
                      [attr.aria-label]="'Rechazar a ' + person.name"
                      (click)="reject.run(person)"
                    >
                      Rechazar
                    </button>
                  </span>
                }
              </li>
            }
          </ul>
        }

        <ul class="mt-4 space-y-3" role="list">
          @for (member of active(); track $index) {
            <li class="flex items-center justify-between gap-2">
              <span class="flex min-w-0 items-center gap-2">
                <app-person-avatar size="sm" [name]="member.person?.name" />
                <span class="min-w-0">
                  <span class="block truncate font-medium">{{ nameOf(member) }}</span>
                  @if (member.role === 'OWNER') {
                    <span class="block text-xs text-muted">Creador del grupo</span>
                  }
                </span>
              </span>
              @if (owner() && member.role !== 'OWNER' && member.person; as person) {
                <button
                  pButton
                  type="button"
                  size="small"
                  severity="danger"
                  variant="text"
                  [attr.aria-label]="'Expulsar a ' + person.name"
                  (click)="kick.run(person)"
                >
                  Expulsar
                </button>
              }
            </li>
          }
        </ul>
      } @else if (!members.resource.error()) {
        <div class="mt-4 space-y-3" aria-busy="true">
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <p-skeleton height="2rem" />
          }
        </div>
      }
      <app-load-more-footer class="mt-4" [list]="members" label="Ver más miembros" />
    </section>
  `,
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
