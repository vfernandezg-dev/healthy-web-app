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
import type { PublicationSummaryResponse } from '../../core/api/schema';
import { NAVIGATION } from '../../layout/app-shell/nav-config';
import { PageHeader } from '../../shared/ui/page-header';
import { PersonAvatar } from '../../shared/ui/person-avatar';
import { StatCard } from '../../shared/ui/stat-card';
import { DashboardApi } from './data/dashboard-api';
import { Shortcuts } from './shortcuts';

/** Todos sus planes o contenidos, en cualquier estado. */
function totalOf(summary: PublicationSummaryResponse): number {
  return summary.draft + summary.published + summary.archived;
}

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

  protected readonly clients = this.dashboard.recentClients();
  protected readonly rewards = this.dashboard.activeRewards();
  protected readonly planSummary = this.dashboard.planSummary();
  protected readonly contentSummary = this.dashboard.contentSummary();
  protected readonly draftPlans = this.dashboard.draftPlans();
  protected readonly draftContent = this.dashboard.draftContent();

  protected readonly failed = computed(
    () =>
      !!(
        this.clients.error() ||
        this.rewards.error() ||
        this.planSummary.error() ||
        this.contentSummary.error()
      ),
  );

  protected readonly stats = computed(() => {
    if (
      !this.clients.hasValue() ||
      !this.rewards.hasValue() ||
      !this.planSummary.hasValue() ||
      !this.contentSummary.hasValue()
    ) {
      return null;
    }
    const plans = this.planSummary.value();
    const content = this.contentSummary.value();
    return {
      clients: this.clients.value().page.totalElements,
      plansPublished: plans.published,
      plansTotal: totalOf(plans),
      contentPublished: content.published,
      contentTotal: totalOf(content),
      activeRewards: this.rewards.value().page.totalElements,
    };
  });

  /** Los clientes que entraron hace menos (la API los manda así). */
  protected readonly recentClients = computed(() =>
    this.clients.hasValue() ? this.clients.value().content : [],
  );

  /** Los últimos planes y contenidos en borrador que ha editado. */
  protected readonly drafts = computed<Draft[]>(() => [
    ...(this.draftPlans.hasValue() ? this.draftPlans.value().content : []).map((plan) => ({
      id: plan.id,
      title: plan.title,
      kind: 'plan' as const,
      link: `meal-plans/${plan.id}`,
    })),
    ...(this.draftContent.hasValue() ? this.draftContent.value().content : []).map((item) => ({
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
