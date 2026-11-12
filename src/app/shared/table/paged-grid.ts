import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef, computed, contentChild, input } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { LoadError } from '../ui/load-error';
import type { PagedQuery } from './paged-query';
import { RowTemplate } from './row-template';

/**
 * Cuadrícula (o lista) de tarjetas de un listado paginado: esqueleto mientras llega la primera página, el error con
 * «Reintentar», el estado vacío (lo que se proyecte con el atributo `empty`), las tarjetas y el paginador. Al cambiar
 * de página se queda la anterior, atenuada, hasta que llega la nueva.
 *
 * ```html
 * <app-paged-grid [query]="catalog" label="Contenido">
 *   <ng-template [appRow]="catalog.items()" let-item>
 *     <app-content-card [item]="item" [link]="item.slug" />
 *   </ng-template>
 *   <app-empty-state empty title="No hay contenido con esos filtros" />
 * </app-paged-grid>
 * ```
 */
@Component({
  selector: 'app-paged-grid',
  imports: [NgTemplateOutlet, Paginator, Skeleton, LoadError],
  host: { class: 'block' },
  template: `
    @if (query().error(); as error) {
      <app-load-error [error]="error" (retry)="query().reload()" />
    } @else if (query().page(); as page) {
      @if (page.content.length === 0) {
        <ng-content select="[empty]" />
      } @else {
        <ul
          class="transition-opacity"
          [class]="layoutClass()"
          [class.opacity-60]="query().loading()"
          role="list"
          [attr.aria-label]="label()"
          [attr.aria-busy]="query().loading()"
        >
          @for (item of page.content; track item.id) {
            <li>
              <ng-container
                [ngTemplateOutlet]="card()"
                [ngTemplateOutletContext]="{ $implicit: item }"
              />
            </li>
          }
        </ul>
        @if (page.page.totalPages > 1) {
          <p-paginator
            class="mt-6 block"
            [first]="query().first()"
            [rows]="query().pageSize"
            [totalRecords]="page.page.totalElements"
            (onPageChange)="query().onPage($event)"
          />
        }
      }
    } @else {
      <div [class]="layoutClass()" aria-busy="true">
        @for (placeholder of placeholders(); track placeholder) {
          <p-skeleton [height]="skeletonHeight()" borderRadius="1.5rem" />
        }
      </div>
    }
  `,
})
export class PagedGrid<T extends { readonly id: string }> {
  readonly query = input.required<PagedQuery<T>>();
  /** Nombre accesible de la lista (si no la nombra ya un encabezado cercano). */
  readonly label = input<string>();
  readonly skeletonHeight = input('14rem');
  readonly skeletons = input(3);
  /** Cuadrícula de tarjetas (por defecto) o lista de una columna (publicaciones). */
  readonly layout = input<'grid' | 'list'>('grid');

  protected readonly card = contentChild.required(RowTemplate, { read: TemplateRef });
  protected readonly layoutClass = computed(() =>
    this.layout() === 'grid' ? 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-5',
  );
  protected readonly placeholders = computed(() =>
    Array.from({ length: this.skeletons() }, (_, index) => index),
  );
}
