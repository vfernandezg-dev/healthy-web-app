import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBookOpen, LucidePlus } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import {
  PUBLICATION_STATUS_LABELS,
  PUBLICATION_STATUS_SEVERITY,
} from '../../../shared/i18n/labels';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { PageHeader } from '../../../shared/ui/page-header';
import { ContentApi } from '../data/content-api';
import { ContentCard } from '../shared/content-card';

/** El contenido del nutricionista, en cualquier estado. */
@Component({
  selector: 'app-nutritionist-content',
  imports: [
    RouterLink,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Paginator,
    Skeleton,
    Tag,
    LucidePlus,
    ContentCard,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Tu contenido"
      description="Artículos, vídeos y guías para tus clientes. Puedes reservarlos para Premium o VIP."
    >
      <a pButton routerLink="new">
        <svg lucidePlus pButtonIcon></svg>
        <span pButtonLabel>Nuevo contenido</span>
      </a>
    </app-page-header>

    @if (items.error()) {
      <app-load-error [error]="items.error()" (retry)="items.reload()" />
    } @else if (items.hasValue()) {
      @let result = items.value();
      @if (result.content.length === 0) {
        <app-empty-state
          [icon]="emptyIcon"
          title="Aún no has publicado contenido"
          description="Empieza con un artículo o una guía: se guarda como borrador hasta que lo publiques."
        >
          <a pButton routerLink="new"><span pButtonLabel>Crear contenido</span></a>
        </app-empty-state>
      } @else {
        <ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
          @for (item of result.content; track item.id) {
            <li>
              <app-content-card [item]="item" [link]="item.id">
                <p-tag
                  [value]="statusLabels[item.status]"
                  [severity]="statusSeverity[item.status]"
                />
              </app-content-card>
            </li>
          }
        </ul>
        @if (result.page.totalPages > 1) {
          <p-paginator
            class="mt-6 block"
            [first]="result.page.number * 20"
            [rows]="20"
            [totalRecords]="result.page.totalElements"
            (onPageChange)="changePage($event)"
          />
        }
      }
    } @else {
      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
        @for (placeholder of [1, 2, 3]; track placeholder) {
          <p-skeleton height="18rem" borderRadius="1.5rem" />
        }
      </div>
    }
  `,
})
export class NutritionistContent {
  private readonly api = inject(ContentApi);
  private readonly page = signal(0);

  protected readonly items = this.api.mine(this.page);
  protected readonly statusLabels = PUBLICATION_STATUS_LABELS;
  protected readonly statusSeverity = PUBLICATION_STATUS_SEVERITY;
  protected readonly emptyIcon = LucideBookOpen;

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }
}
