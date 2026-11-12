import { DatePipe, DecimalPipe, I18nPluralPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideSearch, LucideUsers } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { Table, type TableLazyLoadEvent } from 'primeng/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import type { NutritionistClientResponse } from '@core/api/schema';
import { pageOf } from '@shared/table/page-query';
import { RowTemplate } from '@shared/table/row-template';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { PersonAvatar } from '@shared/ui/person-avatar';
import { lastValue, sameValues } from '@shared/utils/last-value';
import { bmiCategory, bmiOf } from './data/bmi';
import { CLIENTS_PAGE_SIZE, ClientsApi } from './data/clients-api';

/** Fila de la tabla: los datos de la API más el IMC y su categoría. */
interface ClientRow {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly plans: readonly string[];
  readonly heightCm: number | null;
  readonly weightKg: number | null;
  readonly bmi: number | null;
  readonly bmiLabel: string | null;
  readonly since: string;
}

function toRow(client: NutritionistClientResponse): ClientRow {
  const bmi = bmiOf(client.heightCm, client.weightKg);
  return {
    id: client.id,
    fullName: `${client.firstName} ${client.lastName}`,
    email: client.email,
    plans: client.plans,
    heightCm: client.heightCm ?? null,
    weightKg: client.weightKg ?? null,
    bmi,
    bmiLabel: bmiCategory(bmi),
    since: client.since,
  };
}

/**
 * Clientes del nutricionista (quienes siguen alguno de sus planes) con sus datos físicos e IMC. La API pagina, busca
 * y ordena (los más recientes primero, sin otro orden posible).
 */
@Component({
  selector: 'app-clients-page',
  imports: [
    FormsModule,
    RouterLink,
    NgTemplateOutlet,
    DatePipe,
    DecimalPipe,
    I18nPluralPipe,
    Table,
    InputText,
    IconField,
    InputIcon,
    Skeleton,
    ButtonDirective,
    ButtonLabel,
    LucideSearch,
    PersonAvatar,
    RowTemplate,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  template: `
    <app-page-header
      title="Tus clientes"
      description="Las personas que siguen alguno de tus planes, con los datos de su perfil."
    />

    @if (clients.error()) {
      <app-load-error [error]="clients.error()" (retry)="clients.reload()" />
    } @else if (noClients()) {
      <app-empty-state
        [icon]="usersIcon"
        title="Aún no tienes clientes"
        description="Cuando alguien se inscriba en uno de tus planes publicados, aparecerá aquí."
      >
        <a pButton routerLink="/nutritionist/meal-plans"
          ><span pButtonLabel>Ver tus planes</span></a
        >
      </app-empty-state>
    } @else if (result()) {
      <div class="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p-iconfield class="sm:w-96">
          <p-inputicon><svg lucideSearch class="size-4.5"></svg></p-inputicon>
          <input
            pInputText
            type="search"
            class="w-full"
            maxlength="100"
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar clientes por nombre o correo"
            [(ngModel)]="searchText"
          />
        </p-iconfield>
        <p class="text-sm font-medium text-muted" aria-live="polite">
          {{ total() | i18nPlural: clientsPlural }}
        </p>
      </div>

      <div class="card overflow-hidden">
        <p-table
          [value]="rows()"
          [lazy]="true"
          dataKey="id"
          [totalRecords]="total()"
          [rows]="pageSize"
          [first]="first()"
          [paginator]="total() > pageSize"
          [loading]="clients.isLoading()"
          [scrollable]="true"
          [rowHover]="true"
          tableStyleClass="md:min-w-[52rem]"
          (onLazyLoad)="load($event)"
        >
          <ng-template #header>
            <!-- En móvil cada fila es una ficha y no hay cabecera. -->
            <tr class="max-md:hidden">
              <th scope="col">Cliente</th>
              <th scope="col">Planes</th>
              <th scope="col" class="text-right">Altura</th>
              <th scope="col" class="text-right">Peso</th>
              <th scope="col" class="text-right">IMC</th>
              <th scope="col">Cliente desde</th>
            </tr>
          </ng-template>
          <ng-template #body let-client [appRow]="rows()">
            <tr>
              <td class="md:hidden" colspan="6">
                <ng-container *ngTemplateOutlet="person; context: { $implicit: client }" />
                <dl class="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <dt class="text-muted">Altura</dt>
                    <dd class="font-semibold tabular-nums">
                      <ng-container
                        *ngTemplateOutlet="
                          measure;
                          context: { $implicit: client.heightCm, unit: 'cm' }
                        "
                      />
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted">Peso</dt>
                    <dd class="font-semibold tabular-nums">
                      <ng-container
                        *ngTemplateOutlet="
                          measure;
                          context: { $implicit: client.weightKg, unit: 'kg' }
                        "
                      />
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted">IMC</dt>
                    <dd>
                      <ng-container *ngTemplateOutlet="bmi; context: { $implicit: client }" />
                    </dd>
                  </div>
                </dl>
                <div class="mt-3">
                  <ng-container *ngTemplateOutlet="plans; context: { $implicit: client.plans }" />
                </div>
                <p class="mt-2 text-xs text-muted">
                  Cliente desde el {{ client.since | date: 'mediumDate' }}
                </p>
              </td>
              <td class="max-md:hidden">
                <ng-container *ngTemplateOutlet="person; context: { $implicit: client }" />
              </td>
              <td class="max-md:hidden">
                <ng-container *ngTemplateOutlet="plans; context: { $implicit: client.plans }" />
              </td>
              <td class="text-right tabular-nums max-md:hidden">
                <ng-container
                  *ngTemplateOutlet="measure; context: { $implicit: client.heightCm, unit: 'cm' }"
                />
              </td>
              <td class="text-right tabular-nums max-md:hidden">
                <ng-container
                  *ngTemplateOutlet="measure; context: { $implicit: client.weightKg, unit: 'kg' }"
                />
              </td>
              <td class="text-right max-md:hidden">
                <ng-container *ngTemplateOutlet="bmi; context: { $implicit: client }" />
              </td>
              <td class="max-md:hidden">{{ client.since | date: 'mediumDate' }}</td>
            </tr>
          </ng-template>
          <ng-template #emptymessage>
            <tr>
              <td colspan="6" class="py-10 text-center text-muted">
                Ningún cliente coincide con la búsqueda.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    } @else {
      <div class="space-y-3" aria-busy="true">
        <p-skeleton height="3rem" borderRadius="1rem" />
        <p-skeleton height="18rem" borderRadius="1.5rem" />
      </div>
    }

    <ng-template #person let-client [appRow]="rows()">
      <div class="flex items-center gap-3">
        <app-person-avatar [name]="client.fullName" />
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ client.fullName }}</p>
          <a
            class="block truncate text-sm text-brand-700 hover:underline"
            [href]="'mailto:' + client.email"
            >{{ client.email }}</a
          >
        </div>
      </div>
    </ng-template>

    <ng-template #plans let-plans>
      <ul class="flex flex-wrap gap-1.5" role="list">
        @for (plan of plans; track $index) {
          <li class="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
            {{ plan }}
          </li>
        }
      </ul>
    </ng-template>

    <ng-template #measure let-value let-unit="unit">
      @if (value !== null) {
        {{ value | number: '1.0-1' }} {{ unit }}
      } @else {
        <ng-container *ngTemplateOutlet="missing" />
      }
    </ng-template>

    <ng-template #bmi let-client [appRow]="rows()">
      @if (client.bmi !== null) {
        <span class="font-semibold tabular-nums">{{ client.bmi | number: '1.1-1' }}</span>
        <span class="block text-xs text-muted">{{ client.bmiLabel }}</span>
      } @else {
        <ng-container *ngTemplateOutlet="missing" />
      }
    </ng-template>

    <ng-template #missing>
      <span class="text-muted" aria-hidden="true">—</span>
      <span class="sr-only">Sin datos</span>
    </ng-template>
  `,
})
export class ClientsPage {
  private readonly api = inject(ClientsApi);

  protected readonly pageSize = CLIENTS_PAGE_SIZE;
  protected readonly usersIcon = LucideUsers;
  protected readonly clientsPlural = {
    '=0': 'Ningún cliente',
    '=1': '1 cliente',
    other: '# clientes',
  };

  protected readonly searchText = signal('');
  /** Búsqueda aplicada: 300 ms después de dejar de escribir. */
  private readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  /** Vuelve a la primera página al cambiar la búsqueda. */
  private readonly page = linkedSignal({ source: this.search, computation: () => 0 });
  protected readonly first = computed(() => this.page() * this.pageSize);

  protected readonly clients = this.api.clients(
    computed(() => ({ q: this.search().trim(), page: this.page() }), { equal: sameValues }),
  );
  /** La última página recibida: la tabla la conserva mientras carga la siguiente. */
  protected readonly result = lastValue(this.clients);
  protected readonly rows = computed(() => (this.result()?.content ?? []).map(toRow));
  protected readonly total = computed(() => this.result()?.page.totalElements ?? 0);
  /** Sin búsqueda, la API no devuelve a nadie: aún no tiene clientes (no es que no coincida ninguno). */
  protected readonly noClients = computed(
    () =>
      this.clients.hasValue() &&
      this.clients.value().page.totalElements === 0 &&
      !this.search().trim(),
  );

  protected load(event: TableLazyLoadEvent): void {
    this.page.set(pageOf(event, this.pageSize));
  }
}
