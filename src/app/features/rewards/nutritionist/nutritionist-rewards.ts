import { Component, inject, signal, viewChild } from '@angular/core';
import {
  LucideBookOpen,
  LucideDynamicIcon,
  LucideFlame,
  LucidePencil,
  LucidePlus,
  LucideTrophy,
  LucideUtensils,
} from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import type { RewardResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { lastValue } from '@shared/utils/last-value';
import { REWARD_PAGE_SIZE, RewardsApi } from '../data/rewards-api';
import { RewardDialog } from './reward-dialog';

/** Recompensas del nutricionista: rachas de hábitos que desbloquean un contenido o un plan suyo. */
@Component({
  selector: 'app-nutritionist-rewards',
  imports: [
    ButtonDirective,
    Paginator,
    Skeleton,
    Tag,
    LucideDynamicIcon,
    LucideFlame,
    LucidePlus,
    LucidePencil,
    RewardDialog,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Tus recompensas"
      description="Premia la constancia: cuando un cliente registra sus hábitos los días que pidas, desbloquea un contenido o un plan tuyo."
    >
      <button pButton type="button" (click)="dialog()?.open(null)">
        <svg lucidePlus></svg>
        Nueva recompensa
      </button>
    </app-page-header>

    @if (rewards.error()) {
      <app-load-error [error]="rewards.error()" (retry)="rewards.reload()" />
    } @else if (result(); as result) {
      @if (result.content.length === 0) {
        <app-empty-state
          [icon]="trophy"
          title="Aún no has creado recompensas"
          description="Elige uno de tus contenidos o planes publicados como premio y cuántos días seguidos hacen falta."
        />
      } @else {
        <ul
          class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          role="list"
          [attr.aria-busy]="rewards.isLoading()"
        >
          @for (reward of result.content; track reward.id) {
            <li class="card flex flex-col p-6">
              <div class="flex items-center justify-between gap-2">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900"
                >
                  <svg lucideFlame class="size-3.5"></svg> {{ reward.requiredStreakDays }} días
                </span>
                <p-tag
                  [value]="reward.active ? 'Activa' : 'Retirada'"
                  [severity]="reward.active ? 'success' : 'secondary'"
                />
              </div>
              <h2 class="mt-3 text-lg font-bold">{{ reward.title }}</h2>
              <p class="mt-2 flex-1 text-muted">{{ reward.description }}</p>
              <p class="mt-4 flex items-center gap-2 text-sm font-medium">
                <svg [lucideIcon]="prizeIcon(reward)" class="size-4 text-brand-700"></svg>
                {{ reward.target.title }}
              </p>
              @if (reward.active) {
                <div class="mt-5 flex justify-end gap-2">
                  <button
                    pButton
                    type="button"
                    size="small"
                    severity="secondary"
                    variant="text"
                    (click)="deactivate(reward)"
                  >
                    Retirar
                  </button>
                  <button
                    pButton
                    type="button"
                    size="small"
                    severity="secondary"
                    (click)="dialog()?.open(reward)"
                  >
                    <svg lucidePencil></svg>
                    Editar
                  </button>
                </div>
              }
            </li>
          }
        </ul>
        @if (result.page.totalPages > 1) {
          <p-paginator
            class="mt-6 block"
            [first]="result.page.number * pageSize"
            [rows]="pageSize"
            [totalRecords]="result.page.totalElements"
            (onPageChange)="changePage($event)"
          />
        }
      }
    } @else {
      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        @for (placeholder of [1, 2]; track placeholder) {
          <p-skeleton height="14rem" borderRadius="1.5rem" />
        }
      </div>
    }

    <app-reward-dialog (saved)="saved($event)" />
  `,
})
export class NutritionistRewards {
  private readonly api = inject(RewardsApi);
  private readonly toaster = inject(Toaster);
  private readonly confirmer = inject(Confirmer);

  protected readonly dialog = viewChild(RewardDialog);
  protected readonly pageSize = REWARD_PAGE_SIZE;
  private readonly page = signal(0);
  protected readonly rewards = this.api.mine(this.page);
  /** La última página: se sigue viendo mientras carga la siguiente. */
  protected readonly result = lastValue(this.rewards);
  protected readonly trophy = LucideTrophy;

  protected prizeIcon(reward: RewardResponse) {
    return reward.target.type === 'MEAL_PLAN' ? LucideUtensils : LucideBookOpen;
  }

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }

  protected saved(reward: RewardResponse): void {
    this.toaster.success('Recompensa guardada');
    // Las nuevas salen las primeras; una editada sigue en su página.
    const edited = this.result()?.content.some((item) => item.id === reward.id) ?? false;
    if (edited || this.page() === 0) {
      this.rewards.reload();
    } else {
      this.page.set(0);
    }
  }

  protected async deactivate(reward: RewardResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Retirar la recompensa',
      message: 'Dejará de ofrecerse a los clientes. Quien ya completó su racha conserva el premio.',
      acceptLabel: 'Retirar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.deactivate(reward.id);
      this.rewards.reload();
      this.toaster.success('Recompensa retirada');
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }
}
