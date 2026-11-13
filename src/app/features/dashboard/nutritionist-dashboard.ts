import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight } from '@lucide/angular';
import { Skeleton } from 'primeng/skeleton';
import { AuthStore } from '@core/auth/auth-store';
import type { PublicationSummaryResponse } from '@core/api/schema';
import { PageHeader } from '@shared/ui/page-header';
import { PersonAvatar } from '@shared/ui/person-avatar';
import { SectionHeader } from '@shared/ui/section-header';
import { StatCard } from '@shared/ui/stat-card';
import { longDateLabel } from '@shared/utils/date';
import { MealPlansApi } from '@features/meal-plans/data/meal-plans-api';
import { ContentApi } from '@features/content/data/content-api';
import { ClientsApi } from '@features/nutritionist-clients/data/clients-api';
import { RewardsApi } from '@features/rewards/data/rewards-api';
import { LoadError } from '@shared/ui/load-error';

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

/** Cuántos clientes recientes y cuántos borradores enseña el panel. */
const DASHBOARD_CLIENTS = 4;
const DASHBOARD_DRAFTS = 5;
const DRAFTS = {
  status: 'DRAFT',
  page: 0,
  size: DASHBOARD_DRAFTS,
  sort: 'updatedAt,desc',
} as const;

/**
 * Inicio del nutricionista: las cifras de su actividad (con el enlace a cada sección), sus clientes más recientes y
 * los borradores por publicar.
 */
@Component({
  selector: 'app-nutritionist-dashboard',
  imports: [
    LoadError,
    RouterLink,
    DatePipe,
    Skeleton,
    LucideArrowRight,
    PageHeader,
    PersonAvatar,
    SectionHeader,
    StatCard,
  ],
  templateUrl: './nutritionist-dashboard.html',
})
export class NutritionistDashboard {
  private readonly auth = inject(AuthStore);
  private readonly plansApi = inject(MealPlansApi);
  private readonly contentApi = inject(ContentApi);
  private readonly clientsApi = inject(ClientsApi);
  private readonly rewardsApi = inject(RewardsApi);

  protected readonly greeting = computed(() => `Hola, ${this.auth.user()?.firstName ?? ''}`);
  protected readonly today = longDateLabel();

  /** Sus clientes más recientes (la API los ordena así) y, en `page.totalElements`, cuántos tiene. */
  protected readonly clients = this.clientsApi.clients(
    signal({ q: '', page: 0, size: DASHBOARD_CLIENTS }),
  );
  /** Solo para contar sus recompensas activas (`page.totalElements`). */
  protected readonly rewards = this.rewardsApi.mine(
    signal({ active: true, page: 0, size: 1, sort: 'createdAt,desc' }),
  );
  protected readonly planSummary = this.plansApi.summary();
  protected readonly contentSummary = this.contentApi.summary();
  /** Sus borradores, los últimos editados primero. */
  protected readonly draftPlans = this.plansApi.mine(signal(DRAFTS));
  protected readonly draftContent = this.contentApi.mine(signal(DRAFTS));

  protected readonly failed = computed(() =>
    [this.clients, this.rewards, this.planSummary, this.contentSummary].some(
      (source) => source.error() !== undefined,
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

  protected reloadFigures(): void {
    for (const source of [this.clients, this.rewards, this.planSummary, this.contentSummary]) {
      source.reload();
    }
  }
}
