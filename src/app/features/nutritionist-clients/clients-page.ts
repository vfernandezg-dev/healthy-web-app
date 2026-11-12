import { DatePipe, I18nPluralPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideSearch, LucideUsers } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { Table } from 'primeng/table';
import type { NutritionistClientResponse } from '@core/api/schema';
import { RowTemplate } from '@shared/table/row-template';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { bmiCategory, bmiOf } from './data/bmi';
import { ClientsApi, type ClientFilters } from './data/clients-api';
import { FormField, form, maxLength } from '@angular/forms/signals';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { debouncedSearch } from '@shared/utils/debounced';
import { PersonCell } from '@shared/ui/person-cell';
import { MeasureValue } from '@shared/ui/measure-value';

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
    MeasureValue,
    PersonCell,
    FormField,
    RouterLink,
    NgTemplateOutlet,
    DatePipe,
    I18nPluralPipe,
    Table,
    InputText,
    IconField,
    InputIcon,
    Skeleton,
    ButtonDirective,
    LucideSearch,
    RowTemplate,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './clients-page.html',
})
export class ClientsPage {
  private readonly api = inject(ClientsApi);

  protected readonly usersIcon = LucideUsers;
  protected readonly clientsPlural = {
    '=0': 'Ningún cliente',
    '=1': '1 cliente',
    other: '# clientes',
  };

  private readonly filterModel = signal<ClientFilters>({ q: '' });
  /** La API admite búsquedas de hasta 100 caracteres. */
  protected readonly filters = form(this.filterModel, (path) => {
    maxLength(path.q, 100);
  });
  /** Los más recientes primero: la API no admite otro orden. */
  protected readonly clients = pagedQuery({
    filters: debouncedSearch(this.filterModel, 'q'),
    defaultSort: '',
    pageSize: PAGE_SIZE.table,
    load: (request) => this.api.clients(request),
  });
  protected readonly rows = computed(() => this.clients.items().map(toRow));
  /** Sin búsqueda, la API no devuelve a nadie: aún no tiene clientes (no es que no coincida ninguno). */
  protected readonly noClients = computed(
    () => this.clients.page()?.page.totalElements === 0 && !this.filterModel().q.trim(),
  );
}
