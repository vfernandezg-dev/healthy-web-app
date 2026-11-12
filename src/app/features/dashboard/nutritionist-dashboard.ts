import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBookOpen,
  LucideDynamicIcon,
  LucideTrophy,
  LucideUsers,
  LucideUtensils,
} from '@lucide/angular';
import { Skeleton } from 'primeng/skeleton';
import { AuthStore } from '../../core/auth/auth-store';
import { NAVIGATION } from '../../layout/app-shell/nav-config';
import { ClientsApi } from '../nutritionist-clients/data/clients-api';
import { RewardsApi } from '../rewards/data/rewards-api';
import { PageHeader } from '../../shared/ui/page-header';
import { PersonAvatar } from '../../shared/ui/person-avatar';
import { StatCard } from '../../shared/ui/stat-card';
import { DashboardApi } from './data/dashboard-api';
import { Shortcuts } from './shortcuts';

interface Draft {
  readonly id: string;
  readonly title: string;
  readonly kind: 'plan' | 'content';
  readonly link: string;
}

/** Inicio del nutricionista: cifras de su actividad, clientes recientes y borradores por publicar. */
@Component({
  selector: 'app-nutritionist-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    Skeleton,
    LucideArrowRight,
    LucideDynamicIcon,
    PageHeader,
    PersonAvatar,
    StatCard,
    Shortcuts,
  ],
  templateUrl: './nutritionist-dashboard.html',
})
export class NutritionistDashboard {
  private readonly auth = inject(AuthStore);
  private readonly dashboard = inject(DashboardApi);

  protected readonly greeting = computed(() => `Hola, ${this.auth.user()?.firstName ?? ''}`);
  protected readonly shortcuts = NAVIGATION.NUTRITIONIST.filter((item) => item.description);
  protected readonly icons = {
    clients: LucideUsers,
    plans: LucideUtensils,
    content: LucideBookOpen,
    rewards: LucideTrophy,
  };

  protected readonly clients = inject(ClientsApi).clients();
  protected readonly rewards = inject(RewardsApi).mine();
  protected readonly plans = this.dashboard.ownPlans();
  protected readonly content = this.dashboard.ownContent();

  protected readonly loaded = computed(
    () =>
      this.clients.hasValue() &&
      this.rewards.hasValue() &&
      this.plans.hasValue() &&
      this.content.hasValue(),
  );
  protected readonly failed = computed(
    () =>
      !!(
        this.clients.error() ||
        this.rewards.error() ||
        this.plans.error() ||
        this.content.error()
      ),
  );

  protected readonly stats = computed(() => {
    if (!this.loaded()) {
      return null;
    }
    const plans = this.plans.value()?.content ?? [];
    const content = this.content.value()?.content ?? [];
    return {
      clients: this.clients.value()?.length ?? 0,
      plansPublished: plans.filter((plan) => plan.status === 'PUBLISHED').length,
      plansTotal: this.plans.value()?.page.totalElements ?? 0,
      contentPublished: content.filter((item) => item.status === 'PUBLISHED').length,
      contentTotal: this.content.value()?.page.totalElements ?? 0,
      activeRewards: (this.rewards.value() ?? []).filter((reward) => reward.active).length,
    };
  });

  /** Los cuatro clientes que entraron hace menos. */
  protected readonly recentClients = computed(() =>
    [...(this.clients.value() ?? [])].sort((a, b) => b.since.localeCompare(a.since)).slice(0, 4),
  );

  /** Planes y contenidos en borrador (los últimos editados primero). */
  protected readonly drafts = computed<Draft[]>(() => [
    ...(this.plans.value()?.content ?? [])
      .filter((plan) => plan.status === 'DRAFT')
      .map((plan) => ({
        id: plan.id,
        title: plan.title,
        kind: 'plan' as const,
        link: `meal-plans/${plan.id}`,
      })),
    ...(this.content.value()?.content ?? [])
      .filter((item) => item.status === 'DRAFT')
      .map((item) => ({
        id: item.id,
        title: item.title,
        kind: 'content' as const,
        link: `content/${item.id}`,
      })),
  ]);

  protected publishedDetail(published: number, total: number): string {
    return total === published ? 'Todo publicado' : `${total - published} sin publicar`;
  }
}
