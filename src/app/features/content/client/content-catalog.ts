import { Component, computed, inject, signal } from '@angular/core';
import { LucideBookOpen, LucideSearch } from '@lucide/angular';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { CONTENT_CATEGORY_LABELS, CONTENT_TYPE_LABELS, withAllOption } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { ContentApi, type ContentFilters } from '../data/content-api';
import { ContentCard } from '../ui/content-card';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PagedGrid } from '@shared/table/paged-grid';
import { RowTemplate } from '@shared/table/row-template';
import { FormField, form } from '@angular/forms/signals';
import { debouncedSearch } from '@shared/utils/debounced';

/** Catálogo de artículos, vídeos y guías, con búsqueda y filtros; lo desbloqueado con recompensas, arriba. */
@Component({
  selector: 'app-content-catalog',
  imports: [
    PagedGrid,
    RowTemplate,
    FormField,
    SelectButton,
    Select,
    InputText,
    IconField,
    InputIcon,
    LucideSearch,
    ContentCard,
    EmptyState,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Contenido"
      description="Artículos, vídeos y guías de nuestros nutricionistas para aprender a comer mejor."
    />

    @if (unlocked().length > 0) {
      <section class="mb-10" aria-labelledby="unlocked-title">
        <h2 id="unlocked-title" class="mb-4 text-xl font-bold">Desbloqueado con tus rachas</h2>
        <ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
          @for (item of unlocked(); track item.id) {
            <li><app-content-card [item]="item" [link]="item.slug" /></li>
          }
        </ul>
      </section>
    }

    <section aria-labelledby="library-title">
      <h2 id="library-title" class="sr-only">Biblioteca</h2>
      <div class="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p-iconfield class="lg:w-80">
          <p-inputicon><svg lucideSearch class="size-4.5"></svg></p-inputicon>
          <input
            pInputText
            type="search"
            class="w-full"
            placeholder="Buscar por título"
            aria-label="Buscar contenido por título"
            [formField]="filters.q"
          />
        </p-iconfield>
        <div class="flex flex-wrap items-center gap-3">
          <p-selectbutton
            [options]="typeOptions"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            ariaLabelledBy="library-title"
            [formField]="filters.type"
          />
          <p-select
            [options]="categoryOptions"
            optionLabel="label"
            optionValue="value"
            ariaLabel="Categoría"
            [formField]="filters.category"
          />
        </div>
      </div>

      <app-paged-grid [query]="catalog" skeletonHeight="18rem">
        <ng-template [appRow]="catalog.items()" let-item>
          <app-content-card [item]="item" [link]="item.slug" />
        </ng-template>
        <div empty>
          <app-empty-state
            [icon]="emptyIcon"
            title="No hay contenido con esos filtros"
            description="Prueba con otra búsqueda o quita algún filtro."
          />
        </div>
      </app-paged-grid>
    </section>
  `,
})
export class ContentCatalog {
  private readonly api = inject(ContentApi);

  protected readonly emptyIcon = LucideBookOpen;
  protected readonly typeOptions = withAllOption('Todo', CONTENT_TYPE_LABELS);
  protected readonly categoryOptions = withAllOption(
    'Todas las categorías',
    CONTENT_CATEGORY_LABELS,
  );

  private readonly filterModel = signal<ContentFilters>({ type: null, category: null, q: '' });
  protected readonly filters = form(this.filterModel);
  protected readonly catalog = pagedQuery({
    filters: debouncedSearch(this.filterModel, 'q'),
    defaultSort: 'publishedAt,desc',
    pageSize: PAGE_SIZE.grid,
    load: (request) => this.api.catalog(request),
  });
  private readonly unlocks = this.api.unlocks();
  protected readonly unlocked = computed(() =>
    this.unlocks.hasValue() ? this.unlocks.value() : [],
  );
}
