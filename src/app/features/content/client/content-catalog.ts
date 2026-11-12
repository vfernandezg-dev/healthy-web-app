import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideBookOpen, LucideSearch } from '@lucide/angular';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import {
  CONTENT_CATEGORY_LABELS,
  CONTENT_TYPE_LABELS,
  type ContentCategory,
  type ContentType,
  optionsOf,
} from '../../../shared/i18n/labels';
import { EmptyState } from '../../../shared/ui/empty-state';
import { LoadError } from '../../../shared/ui/load-error';
import { PageHeader } from '../../../shared/ui/page-header';
import { CONTENT_PAGE_SIZE, ContentApi } from '../data/content-api';
import { ContentCard } from '../shared/content-card';

/** Catálogo de artículos, vídeos y guías, con búsqueda y filtros; lo desbloqueado con recompensas, arriba. */
@Component({
  selector: 'app-content-catalog',
  imports: [
    FormsModule,
    SelectButton,
    Select,
    InputText,
    IconField,
    InputIcon,
    Paginator,
    Skeleton,
    LucideSearch,
    ContentCard,
    EmptyState,
    LoadError,
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
            [(ngModel)]="searchText"
          />
        </p-iconfield>
        <div class="flex flex-wrap items-center gap-3">
          <p-selectbutton
            [options]="typeOptions"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            ariaLabelledBy="library-title"
            [(ngModel)]="type"
          />
          <p-select
            [options]="categoryOptions"
            optionLabel="label"
            optionValue="value"
            ariaLabel="Categoría"
            [(ngModel)]="category"
          />
        </div>
      </div>

      @if (catalog.error()) {
        <app-load-error [error]="catalog.error()" (retry)="catalog.reload()" />
      } @else if (catalog.hasValue()) {
        @let result = catalog.value();
        @if (result.content.length === 0) {
          <app-empty-state
            [icon]="emptyIcon"
            title="No hay contenido con esos filtros"
            description="Prueba con otra búsqueda o quita algún filtro."
          />
        } @else {
          <ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
            @for (item of result.content; track item.id) {
              <li><app-content-card [item]="item" [link]="item.slug" /></li>
            }
          </ul>
          @if (result.page.totalPages > 1) {
            <p-paginator
              class="mt-6 block"
              [first]="result.page.number * pageSize"
              [rows]="pageSize"
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
    </section>
  `,
})
export class ContentCatalog {
  private readonly api = inject(ContentApi);

  protected readonly pageSize = CONTENT_PAGE_SIZE;
  protected readonly emptyIcon = LucideBookOpen;
  protected readonly typeOptions = [
    { label: 'Todo', value: null },
    ...optionsOf(CONTENT_TYPE_LABELS),
  ];
  protected readonly categoryOptions = [
    { label: 'Todas las categorías', value: null },
    ...optionsOf(CONTENT_CATEGORY_LABELS),
  ];

  protected readonly type = signal<ContentType | null>(null);
  protected readonly category = signal<ContentCategory | null>(null);
  protected readonly searchText = signal('');
  /** Búsqueda aplicada: 300 ms después de dejar de escribir. */
  private readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  /** Vuelve a la primera página al cambiar cualquier filtro. */
  protected readonly page = linkedSignal({
    source: () => [this.type(), this.category(), this.search()],
    computation: () => 0,
  });

  protected readonly catalog = this.api.catalog(
    computed(() => ({
      type: this.type(),
      category: this.category(),
      search: this.search(),
      page: this.page(),
    })),
  );
  private readonly unlocks = this.api.unlocks();
  protected readonly unlocked = computed(() =>
    this.unlocks.hasValue() ? this.unlocks.value() : [],
  );

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }
}
