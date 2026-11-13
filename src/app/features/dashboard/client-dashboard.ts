import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideFlame } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { AuthStore } from '@core/auth/auth-store';
import { HabitsApi } from '@features/habits/data/habits-api';
import { ProgressApi } from '@features/progress/data/progress-api';
import { goalProgress } from '@features/progress/data/progress-math';
import { RewardsApi } from '@features/rewards/data/rewards-api';
import { streakPercent } from '@features/rewards/data/streaks';
import { BillingApi } from '@features/subscription/data/billing-api';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { ProgressBar } from '@shared/ui/progress-bar';
import { SectionHeader } from '@shared/ui/section-header';
import { Sparkline } from '@shared/ui/sparkline';
import { TierBadge } from '@shared/ui/tier-badge';
import { longDateLabel, todayIso } from '@shared/utils/date';

/** Pesajes que dibuja la línea de tendencia de la meta. */
const TREND_POINTS = 12;

/**
 * Inicio del cliente: su meta (la tarjeta principal, con el último pesaje y su tendencia), los hábitos de hoy, su
 * plan de suscripción y las rachas en curso.
 */
@Component({
  selector: 'app-client-dashboard',
  imports: [
    LoadError,
    RouterLink,
    DatePipe,
    DecimalPipe,
    ButtonDirective,
    Skeleton,
    EmptyState,
    PageHeader,
    ProgressBar,
    SectionHeader,
    Sparkline,
    TierBadge,
  ],
  templateUrl: './client-dashboard.html',
})
export class ClientDashboard {
  private readonly auth = inject(AuthStore);
  private readonly progress = inject(ProgressApi);
  private readonly habits = inject(HabitsApi);
  private readonly rewards = inject(RewardsApi);
  private readonly billing = inject(BillingApi);

  protected readonly greeting = computed(() => `Hola, ${this.auth.user()?.firstName ?? ''}`);
  protected readonly today = longDateLabel();
  protected readonly flameIcon = LucideFlame;
  protected readonly scores = [
    { key: 'hydration', label: 'Hidratación' },
    { key: 'nutrition', label: 'Alimentación' },
    { key: 'exercise', label: 'Ejercicio' },
    { key: 'sleep', label: 'Sueño' },
  ] as const;

  // ---------------------------------------------------------------- meta
  protected readonly goals = this.progress.goals();
  protected readonly activeGoal = computed(() =>
    this.goals.hasValue()
      ? (this.goals.value().find((goal) => goal.status === 'ACTIVE') ?? null)
      : null,
  );
  protected readonly entries = this.progress.entries(computed(() => this.activeGoal()?.id));
  protected readonly goalProgress = computed(() => {
    const goal = this.activeGoal();
    return goal && this.entries.hasValue()
      ? goalProgress(this.entries.value(), goal.targetWeightKg)
      : null;
  });
  /** Últimos pesajes, del más antiguo al más reciente (los mismos que ya se cargan para el avance). */
  protected readonly weights = computed(() =>
    this.entries.hasValue()
      ? this.entries
          .value()
          .slice(-TREND_POINTS)
          .map((entry) => entry.weightKg)
      : [],
  );

  // ---------------------------------------------------------------- hábitos de hoy
  private readonly todayDate = todayIso();
  protected readonly todayLogs = this.habits.logs(
    signal({ from: this.todayDate, to: this.todayDate }),
  );
  protected readonly todayLog = computed(() =>
    this.todayLogs.hasValue() ? (this.todayLogs.value()[0] ?? null) : null,
  );

  // ---------------------------------------------------------------- rachas
  protected readonly streaks = this.rewards.streaks();
  protected readonly inProgress = computed(() =>
    this.streaks.hasValue()
      ? this.streaks
          .value()
          .filter((reward) => reward.streak && !reward.streak.completed)
          .slice(0, 3)
      : [],
  );

  // ---------------------------------------------------------------- suscripción
  protected readonly subscription = this.billing.current();

  protected readonly percent = streakPercent;
}
