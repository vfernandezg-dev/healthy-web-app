import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideCircleCheck, LucideDynamicIcon, LucideFlame, LucideTrophy } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import type { RewardResponse, StreakResponse } from '@core/api/schema';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PagedGrid } from '@shared/table/paged-grid';
import { pagedQuery } from '@shared/table/paged-query';
import { RowTemplate } from '@shared/table/row-template';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { ProgressBar } from '@shared/ui/progress-bar';
import { mutation } from '@shared/utils/mutation';
import { RewardsApi } from '../data/rewards-api';
import { prizeLink, streakPercent } from '../data/streaks';
import { RewardCard, prizeIcon } from '../ui/reward-card';

/** Rachas del cliente hacia las recompensas y las que puede empezar. */
@Component({
  selector: 'app-rewards-page',
  imports: [
    DatePipe,
    RouterLink,
    ButtonDirective,
    LucideDynamicIcon,
    LucideFlame,
    LucideCircleCheck,
    ProgressBar,
    EmptyState,
    PageHeader,
    PagedGrid,
    RowTemplate,
    RewardCard,
  ],
  templateUrl: './rewards-page.html',
})
export class RewardsPage {
  private readonly api = inject(RewardsApi);

  /** Recompensas activas, de la más corta a la más larga, cada una con la racha del cliente (si la tiene). */
  protected readonly catalog = pagedQuery({
    defaultSort: 'requiredStreakDays,asc',
    pageSize: PAGE_SIZE.grid,
    load: (request) => this.api.catalog(request),
  });
  private readonly streaks = this.api.streaks();

  /** Rachas en curso y completadas (de /me/streaks, que incluye las de recompensas retiradas). */
  protected readonly mine = computed(() =>
    this.streaks.hasValue() ? this.streaks.value().filter((reward) => reward.streak) : [],
  );
  protected readonly trophy = LucideTrophy;
  protected readonly prizeIcon = prizeIcon;
  protected readonly prizeLink = prizeLink;
  protected readonly percent = streakPercent;

  protected readonly start = mutation((reward: RewardResponse) => this.api.start(reward.id), {
    success: { summary: 'Racha empezada', detail: 'Cada día que registres tus hábitos sumará.' },
    onSuccess: () => this.reload(),
  });

  protected readonly abandon = mutation(
    (_reward: RewardResponse, streak: StreakResponse) => this.api.abandon(streak.id),
    {
      confirm: (reward, streak) => ({
        header: 'Abandonar la racha',
        message: `Perderás los ${streak.currentDays} días que llevas hacia «${reward.title}».`,
        acceptLabel: 'Abandonar',
        danger: true,
      }),
      success: { summary: 'Racha abandonada', severity: 'info' },
      onSuccess: () => this.reload(),
    },
  );

  private reload(): void {
    this.catalog.reload();
    this.streaks.reload();
  }
}
