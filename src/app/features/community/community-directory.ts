import { Component, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucidePlus, LucideSearch, LucideUsers } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import type { GroupResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import { EmptyState } from '@shared/ui/empty-state';
import { PageHeader } from '@shared/ui/page-header';
import { CommunityApi, type DirectoryFilters } from './data/community-api';
import { GroupDialog } from './group-dialog';
import { GroupCard } from './ui/group-card';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { PagedGrid } from '@shared/table/paged-grid';
import { RowTemplate } from '@shared/table/row-template';
import { FormField, form } from '@angular/forms/signals';
import { debouncedSearch } from '@shared/utils/debounced';

/** Directorio de grupos de la comunidad, con búsqueda; desde aquí se crea un grupo nuevo. */
@Component({
  selector: 'app-community-directory',
  imports: [
    PagedGrid,
    RowTemplate,
    FormField,
    InputText,
    IconField,
    InputIcon,
    ButtonDirective,
    LucidePlus,
    LucideSearch,
    GroupCard,
    GroupDialog,
    EmptyState,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Comunidad"
      description="Grupos para compartir avances, dudas y recetas. En los públicos entra quien quiera; en los privados, quien los creó aprueba cada solicitud."
    >
      <button pButton type="button" (click)="dialog()?.open(null)">
        <svg lucidePlus></svg>
        Nuevo grupo
      </button>
    </app-page-header>

    <section aria-labelledby="groups-title">
      <h2 id="groups-title" class="sr-only">Grupos</h2>
      <p-iconfield class="mb-5 block sm:w-80">
        <p-inputicon><svg lucideSearch class="size-4.5"></svg></p-inputicon>
        <input
          pInputText
          type="search"
          class="w-full"
          placeholder="Buscar grupos"
          aria-label="Buscar grupos por nombre"
          [formField]="filters.q"
        />
      </p-iconfield>

      <app-paged-grid [query]="directory" label="Grupos" skeletonHeight="12rem">
        <ng-template [appRow]="directory.items()" let-group>
          <app-group-card [group]="group" />
        </ng-template>
        <div empty>
          @if (filterModel().q.trim()) {
            <app-empty-state
              [icon]="usersIcon"
              title="Ningún grupo coincide con la búsqueda"
              description="Prueba con otra palabra o crea tú el grupo."
            />
          } @else {
            <app-empty-state
              [icon]="usersIcon"
              title="Aún no hay grupos"
              description="Crea el primero e invita a la comunidad a participar."
            >
              <button pButton type="button" (click)="dialog()?.open(null)">
                <svg lucidePlus></svg>
                Crear un grupo
              </button>
            </app-empty-state>
          }
        </div>
      </app-paged-grid>
    </section>

    <app-group-dialog (saved)="created($event)" />
  `,
})
export class CommunityDirectory {
  private readonly api = inject(CommunityApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toaster = inject(Toaster);

  protected readonly dialog = viewChild(GroupDialog);
  protected readonly usersIcon = LucideUsers;

  protected readonly filterModel = signal<DirectoryFilters>({ q: '' });
  protected readonly filters = form(this.filterModel);
  protected readonly directory = pagedQuery({
    filters: debouncedSearch(this.filterModel, 'q'),
    defaultSort: 'createdAt,desc',
    pageSize: PAGE_SIZE.grid,
    load: (request) => this.api.directory(request),
  });

  /** Un grupo recién creado: a su página. */
  protected created(group: GroupResponse): void {
    this.toaster.success('Grupo creado', 'Ya puedes publicar en él.');
    void this.router.navigate(['groups', group.id], { relativeTo: this.route });
  }
}
