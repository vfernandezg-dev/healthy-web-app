import { DatePipe, I18nPluralPipe, NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LucideSearch } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import { SortIcon as TableSortIcon, SortableColumn, Table } from 'primeng/table';
import type { AdminUserResponse } from '@core/api/schema';
import { AuthStore } from '@core/auth/auth-store';
import {
  ROLE_LABELS,
  ROLE_TONE,
  USER_STATUS_LABELS,
  type UserStatus,
  ROLE_PLURAL_LABELS,
  withAllOption,
} from '@shared/i18n/labels';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { PersonAvatar } from '@shared/ui/person-avatar';
import { SortIcon } from '@shared/ui/sort-icon';
import { AdminApi, type UserFilters } from '../data/admin-api';
import { RowTemplate } from '@shared/table/row-template';
import { FormField, form } from '@angular/forms/signals';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { debouncedSearch } from '@shared/utils/debounced';
import { mutation } from '@shared/utils/mutation';
import { Badge } from '@shared/ui/badge';

const DEFAULT_SORT = 'createdAt,desc';

/** Cuentas de la plataforma: búsqueda por nombre o correo, filtros por rol y estado, y activar o desactivar. */
/** Filtro por estado: en plural, como la opción «Todas las cuentas». */
const ACCOUNT_STATUS_FILTER: Readonly<Record<UserStatus, string>> = {
  ACTIVE: 'Activas',
  DEACTIVATED: 'Desactivadas',
};

@Component({
  selector: 'app-users-page',
  imports: [
    FormField,
    DatePipe,
    I18nPluralPipe,
    NgTemplateOutlet,
    InputText,
    IconField,
    InputIcon,
    Select,
    Skeleton,
    Badge,
    Table,
    SortableColumn,
    TableSortIcon,
    ButtonDirective,
    LucideSearch,
    PersonAvatar,
    SortIcon,
    RowTemplate,
    LoadError,
    PageHeader,
  ],
  templateUrl: './users-page.html',
})
export class UsersPage {
  private readonly api = inject(AdminApi);
  private readonly auth = inject(AuthStore);

  protected readonly roles = ROLE_LABELS;
  protected readonly roleTones = ROLE_TONE;
  protected readonly statuses = USER_STATUS_LABELS;
  protected readonly roleOptions = withAllOption('Todos los roles', ROLE_PLURAL_LABELS);
  protected readonly statusOptions = withAllOption('Todas las cuentas', ACCOUNT_STATUS_FILTER);
  protected readonly accountsPlural = {
    '=0': 'Ninguna cuenta',
    '=1': '1 cuenta',
    other: '# cuentas',
  };

  private readonly filterModel = signal<UserFilters>({ q: '', role: null, status: null });
  protected readonly filters = form(this.filterModel);
  protected readonly users = pagedQuery({
    filters: debouncedSearch(this.filterModel, 'q'),
    defaultSort: DEFAULT_SORT,
    pageSize: PAGE_SIZE.table,
    load: (request) => this.api.users(request),
  });

  protected isMe(user: AdminUserResponse): boolean {
    return user.id === this.auth.user()?.id;
  }

  protected readonly deactivate = mutation(
    (user: AdminUserResponse) => this.api.deactivate(user.id),
    {
      confirm: (user) => ({
        header: 'Desactivar la cuenta',
        message: `${user.firstName} ${user.lastName} no podrá iniciar sesión y se cerrarán sus sesiones abiertas. Puedes reactivarla cuando quieras.`,
        acceptLabel: 'Desactivar',
        danger: true,
      }),
      success: 'Cuenta desactivada',
      onSuccess: () => this.users.reload(),
    },
  );

  protected readonly activate = mutation((user: AdminUserResponse) => this.api.activate(user.id), {
    success: 'Cuenta reactivada',
    onSuccess: () => this.users.reload(),
  });
}
