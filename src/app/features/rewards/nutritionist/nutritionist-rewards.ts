import { Component, inject, signal } from '@angular/core';
import { LucidePencil, LucidePlus, LucideTrophy } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import type { RewardResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PagedGrid } from '@shared/table/paged-grid';
import { pagedQuery } from '@shared/table/paged-query';
import { RowTemplate } from '@shared/table/row-template';
import { dialogState } from '@shared/ui/dialog-state';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { mutation } from '@shared/utils/mutation';
import { type OwnRewardFilters, RewardsApi } from '../data/rewards-api';
import { RewardCard } from '../ui/reward-card';
import { RewardDialog } from './reward-dialog';
import { Badge } from '@shared/ui/badge';

/** Las recompensas del nutricionista (activas y retiradas): crearlas, editarlas y retirarlas. */
@Component({
  selector: 'app-nutritionist-rewards',
  imports: [
    ButtonDirective,
    Badge,
    LucidePlus,
    LucidePencil,
    EmptyState,
    PageHeader,
    PagedGrid,
    RowTemplate,
    RewardCard,
    RewardDialog,
  ],
  templateUrl: './nutritionist-rewards.html',
})
export class NutritionistRewards {
  private readonly api = inject(RewardsApi);
  private readonly toaster = inject(Toaster);

  protected readonly rewardDialog = dialogState<RewardResponse | null>();
  protected readonly trophy = LucideTrophy;

  /** Las últimas creadas primero. */
  protected readonly rewards = pagedQuery({
    filters: signal<OwnRewardFilters>({ active: null }),
    defaultSort: 'createdAt,desc',
    pageSize: PAGE_SIZE.grid,
    load: (request) => this.api.mine(request),
  });

  protected saved(editing: boolean): void {
    this.toaster.success('Recompensa guardada');
    // Una nueva sale la primera; una editada sigue en su página.
    if (editing) {
      this.rewards.reload();
    } else {
      this.rewards.afterCreate();
    }
  }

  protected readonly deactivate = mutation(
    (reward: RewardResponse) => this.api.deactivate(reward.id),
    {
      confirm: {
        header: 'Retirar la recompensa',
        message:
          'Dejará de ofrecerse a los clientes. Quien ya completó su racha conserva el premio.',
        acceptLabel: 'Retirar',
        danger: true,
      },
      success: 'Recompensa retirada',
      onSuccess: () => this.rewards.reload(),
    },
  );
}
