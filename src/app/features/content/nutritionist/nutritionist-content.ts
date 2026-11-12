import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBookOpen, LucidePlus } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { PUBLICATION_STATUS_LABELS, PUBLICATION_STATUS_SEVERITY } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { ContentApi, type OwnContentFilters } from '../data/content-api';
import { ContentCard } from '../ui/content-card';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PagedGrid } from '@shared/table/paged-grid';
import { RowTemplate } from '@shared/table/row-template';

/** El contenido del nutricionista, en cualquier estado. */
@Component({
  selector: 'app-nutritionist-content',
  imports: [
    PagedGrid,
    RowTemplate,
    RouterLink,
    ButtonDirective,
    Tag,
    LucidePlus,
    ContentCard,
    EmptyState,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Tu contenido"
      description="Artículos, vídeos y guías para tus clientes. Puedes reservarlos para Premium o VIP."
    >
      <a pButton routerLink="new">
        <svg lucidePlus></svg>
        Nuevo contenido
      </a>
    </app-page-header>

    <app-paged-grid [query]="items" label="Tu contenido" skeletonHeight="18rem">
      <ng-template [appRow]="items.items()" let-item>
        <app-content-card [item]="item" [link]="item.id">
          <p-tag [value]="statusLabels[item.status]" [severity]="statusSeverity[item.status]" />
        </app-content-card>
      </ng-template>
      <div empty>
        <app-empty-state
          [icon]="emptyIcon"
          title="Aún no has publicado contenido"
          description="Empieza con un artículo o una guía: se guarda como borrador hasta que lo publiques."
        >
          <a pButton routerLink="new">Crear contenido</a>
        </app-empty-state>
      </div>
    </app-paged-grid>
  `,
})
export class NutritionistContent {
  private readonly api = inject(ContentApi);
  protected readonly items = pagedQuery({
    filters: signal<OwnContentFilters>({ status: null }),
    defaultSort: 'updatedAt,desc',
    pageSize: PAGE_SIZE.grid,
    load: (request) => this.api.mine(request),
  });
  protected readonly statusLabels = PUBLICATION_STATUS_LABELS;
  protected readonly statusSeverity = PUBLICATION_STATUS_SEVERITY;
  protected readonly emptyIcon = LucideBookOpen;
}
