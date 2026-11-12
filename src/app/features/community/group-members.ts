import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { MemberResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { PersonAvatar } from '@shared/ui/person-avatar';
import { loadMore } from '@shared/utils/load-more';
import { CommunityApi } from './data/community-api';

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
  imports: [NgTemplateOutlet, ButtonDirective, Skeleton, PersonAvatar],
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
                      (click)="approve(person)"
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
                      (click)="reject(person)"
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
                  (click)="kick(person)"
                >
                  Expulsar
                </button>
              }
            </li>
          }
        </ul>
        @if (members.resource.error()) {
          <ng-container *ngTemplateOutlet="loadError" />
        } @else if (members.hasMore()) {
          <button
            pButton
            type="button"
            size="small"
            severity="secondary"
            variant="outlined"
            class="mt-4 w-full"
            [loading]="members.resource.isLoading()"
            (click)="members.more()"
          >
            Ver más miembros
          </button>
        }
      } @else if (members.resource.error()) {
        <ng-container *ngTemplateOutlet="loadError" />
      } @else {
        <div class="mt-4 space-y-3" aria-busy="true">
          @for (placeholder of [1, 2, 3]; track placeholder) {
            <p-skeleton height="2rem" />
          }
        </div>
      }
    </section>

    <ng-template #loadError>
      <p class="mt-3 text-sm text-red-700" role="alert">
        No se ha podido cargar la lista.
        <button type="button" class="font-semibold underline" (click)="members.resource.reload()">
          Reintentar
        </button>
      </p>
    </ng-template>
  `,
})
export class GroupMembers {
  private readonly api = inject(CommunityApi);
  private readonly confirmer = inject(Confirmer);
  private readonly toaster = inject(Toaster);

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
    return member.person?.name ?? 'Cuenta eliminada';
  }

  protected async approve(person: Person): Promise<void> {
    await this.act(
      () => this.api.approve(this.groupId(), person.id),
      () => this.members.replace(person.id, (member) => ({ ...member, status: 'ACTIVE' })),
      `${person.name} ya es miembro`,
    );
  }

  protected async reject(person: Person): Promise<void> {
    await this.act(
      () => this.api.remove(this.groupId(), person.id),
      () => this.members.remove(person.id),
      'Solicitud rechazada',
    );
  }

  protected async kick(person: Person): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Expulsar del grupo',
      message: `${person.name} dejará de ser miembro. Podrá volver a pedir entrar.`,
      acceptLabel: 'Expulsar',
      danger: true,
    });
    if (confirmed) {
      await this.act(
        () => this.api.remove(this.groupId(), person.id),
        () => this.members.remove(person.id),
        'Miembro expulsado',
      );
    }
  }

  /** Hace el cambio en la API y, si sale bien, lo refleja en la lista ya cargada (sin volver a pedirla entera). */
  private async act(action: () => Promise<void>, update: () => void, done: string): Promise<void> {
    try {
      await action();
      update();
      this.changed.emit();
      this.toaster.success(done);
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }
}
