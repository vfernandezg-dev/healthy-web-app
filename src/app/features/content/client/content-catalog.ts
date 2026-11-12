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
  templateUrl: './content-catalog.html',
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
