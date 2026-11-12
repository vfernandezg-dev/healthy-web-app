import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBookOpen,
  LucideCircleCheck,
  LucideDynamicIcon,
  LucideFlame,
  LucideTrophy,
  LucideUtensils,
} from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { RewardResponse } from '../../../core/api/schema';
import { Confirmer } from '../../../core/ui/confirmer';
import { Toaster } from '../../../core/ui/toaster';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { PageHeader } from '../../../shared/ui/page-header';
import { ProgressBar } from '../../../shared/ui/progress-bar';
import { RewardsApi } from '../data/rewards-api';

/** Rachas del cliente hacia las recompensas y las que puede empezar. */
@Component({
  selector: 'app-rewards-page',
  imports: [
    DatePipe,
    RouterLink,
    ButtonDirective,
    ButtonLabel,
    Skeleton,
    LucideDynamicIcon,
    LucideFlame,
    LucideCircleCheck,
    ProgressBar,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './rewards-page.html',
})
export class RewardsPage {
  private readonly api = inject(RewardsApi);
  private readonly toaster = inject(Toaster);
  private readonly confirmer = inject(Confirmer);

  protected readonly catalog = this.api.catalog();
  private readonly streaks = this.api.streaks();

  /** Rachas en curso y completadas (de /me/streaks, que incluye las de recompensas retiradas). */
  protected readonly mine = computed(() =>
    this.streaks.hasValue() ? this.streaks.value().filter((reward) => reward.streak) : [],
  );
  /** Recompensas activas sin racha todavía. */
  protected readonly available = computed(() =>
    this.catalog.hasValue() ? this.catalog.value().filter((reward) => !reward.streak) : [],
  );
  protected readonly starting = signal<string | null>(null);
  protected readonly trophy = LucideTrophy;

  protected prizeIcon(reward: RewardResponse) {
    return reward.target.type === 'MEAL_PLAN' ? LucideUtensils : LucideBookOpen;
  }

  /** Dónde ver el premio desbloqueado: el plan por su id; el contenido, en el catálogo («Desbloqueado…»). */
  protected prizeLink(reward: RewardResponse): string {
    return reward.target.type === 'MEAL_PLAN'
      ? `/client/meal-plans/${reward.target.id}`
      : '/client/content';
  }

  protected percent(reward: RewardResponse): number {
    return ((reward.streak?.currentDays ?? 0) / reward.requiredStreakDays) * 100;
  }

  protected async start(reward: RewardResponse): Promise<void> {
    this.starting.set(reward.id);
    try {
      await this.api.start(reward.id);
      this.reload();
      this.toaster.success('Racha empezada', 'Cada día que registres tus hábitos sumará.');
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.starting.set(null);
    }
  }

  protected async abandon(reward: RewardResponse): Promise<void> {
    const streak = reward.streak;
    if (!streak) {
      return;
    }
    const confirmed = await this.confirmer.ask({
      header: 'Abandonar la racha',
      message: `Perderás los ${streak.currentDays} días que llevas hacia «${reward.title}».`,
      acceptLabel: 'Abandonar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.abandon(streak.id);
      this.reload();
      this.toaster.info('Racha abandonada');
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }

  private reload(): void {
    this.catalog.reload();
    this.streaks.reload();
  }
}
