import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCalendarCheck,
  LucideCreditCard,
  LucideFlame,
  LucideTarget,
} from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { AuthStore } from '@core/auth/auth-store';
import { NAVIGATION } from '@core/routing/navigation';
import { HabitsApi } from '@features/habits/data/habits-api';
import { ProgressApi } from '@features/progress/data/progress-api';
import { goalProgress } from '@features/progress/data/progress-math';
import { RewardsApi } from '@features/rewards/data/rewards-api';
import { BillingApi } from '@features/subscription/data/billing-api';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { ProgressBar } from '@shared/ui/progress-bar';
import { TierBadge } from '@shared/ui/tier-badge';
import { todayIso } from '@shared/utils/date';
import { Shortcuts } from '@shared/ui/shortcuts';

/** Inicio del cliente: su meta, los hábitos de hoy, su plan de suscripción y las rachas en curso. */
@Component({
  selector: 'app-client-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    ButtonDirective,
    ButtonLabel,
    Skeleton,
    LucideArrowRight,
    LucideTarget,
    LucideCalendarCheck,
    LucideCreditCard,
    EmptyState,
    PageHeader,
    ProgressBar,
    TierBadge,
    Shortcuts,
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
  protected readonly shortcuts = NAVIGATION.CLIENT.filter((item) => item.description);
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

  // ---------------------------------------------------------------- hábitos de hoy
  private readonly today = todayIso();
  protected readonly todayLogs = this.habits.logs(signal({ from: this.today, to: this.today }));
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

  protected percentOf(current: number, required: number): number {
    return required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 0;
  }
}
