import { Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LucidePlus, LucideSearch, LucideUsers } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import type { GroupResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { CommunityApi, GROUP_PAGE_SIZE } from './data/community-api';
import { GroupDialog } from './group-dialog';
import { GroupCard } from './ui/group-card';

/** Directorio de grupos de la comunidad, con búsqueda; desde aquí se crea un grupo nuevo. */
@Component({
  selector: 'app-community-directory',
  imports: [
    FormsModule,
    InputText,
    IconField,
    InputIcon,
    Paginator,
    Skeleton,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    LucidePlus,
    LucideSearch,
    GroupCard,
    GroupDialog,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Comunidad"
      description="Grupos para compartir avances, dudas y recetas. En los públicos entra quien quiera; en los privados, quien los creó aprueba cada solicitud."
    >
      <button pButton type="button" (click)="dialog()?.open(null)">
        <svg lucidePlus pButtonIcon></svg>
        <span pButtonLabel>Nuevo grupo</span>
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
          [(ngModel)]="searchText"
        />
      </p-iconfield>

      @if (directory.error()) {
        <app-load-error [error]="directory.error()" (retry)="directory.reload()" />
      } @else if (directory.hasValue()) {
        @let result = directory.value();
        @if (result.content.length === 0) {
          @if (search()) {
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
                <svg lucidePlus pButtonIcon></svg>
                <span pButtonLabel>Crear un grupo</span>
              </button>
            </app-empty-state>
          }
        } @else {
          <ul class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
            @for (group of result.content; track group.id) {
              <li><app-group-card [group]="group" /></li>
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
            <p-skeleton height="12rem" borderRadius="1.5rem" />
          }
        </div>
      }
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
  protected readonly pageSize = GROUP_PAGE_SIZE;
  protected readonly usersIcon = LucideUsers;

  protected readonly searchText = signal('');
  /** Búsqueda aplicada: 300 ms después de dejar de escribir. */
  protected readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  /** Vuelve a la primera página al cambiar la búsqueda. */
  protected readonly page = linkedSignal({ source: this.search, computation: () => 0 });

  protected readonly directory = this.api.directory(
    computed(() => ({ search: this.search(), page: this.page() })),
  );

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }

  /** Un grupo recién creado: a su página. */
  protected created(group: GroupResponse): void {
    this.toaster.success('Grupo creado', 'Ya puedes publicar en él.');
    void this.router.navigate(['groups', group.id], { relativeTo: this.route });
  }
}
