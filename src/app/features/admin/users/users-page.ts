import { DatePipe, I18nPluralPipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { LucideSearch } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Skeleton } from 'primeng/skeleton';
import {
  SortIcon as TableSortIcon,
  SortableColumn,
  Table,
  type TableLazyLoadEvent,
} from 'primeng/table';
import { Tag } from 'primeng/tag';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import type { AdminUserResponse } from '@core/api/schema';
import { AuthStore } from '@core/auth/auth-store';
import type { Role } from '@core/auth/roles';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import {
  ROLE_LABELS,
  ROLE_SEVERITY,
  USER_STATUS_LABELS,
  type UserStatus,
} from '@shared/i18n/labels';
import { type PageQuery, pageQueryOf, samePageQuery } from '@shared/table/page-query';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { PersonAvatar } from '@shared/ui/person-avatar';
import { SortIcon } from '@shared/ui/sort-icon';
import { ADMIN_PAGE_SIZE, AdminApi } from '../data/admin-api';
import { RowTemplate } from '@shared/table/row-template';
import { lastValue, sameValues } from '@shared/utils/last-value';

const DEFAULT_SORT = 'createdAt,desc';

/** Cuentas de la plataforma: búsqueda por nombre o correo, filtros por rol y estado, y activar o desactivar. */
@Component({
  selector: 'app-users-page',
  imports: [
    FormsModule,
    DatePipe,
    I18nPluralPipe,
    NgTemplateOutlet,
    InputText,
    IconField,
    InputIcon,
    Select,
    Skeleton,
    Tag,
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
  private readonly confirmer = inject(Confirmer);
  private readonly toaster = inject(Toaster);

  protected readonly pageSize = ADMIN_PAGE_SIZE;
  protected readonly roles = ROLE_LABELS;
  protected readonly roleSeverity = ROLE_SEVERITY;
  protected readonly statuses = USER_STATUS_LABELS;
  protected readonly roleOptions = [
    { label: 'Todos los roles', value: null },
    { label: 'Clientes', value: 'CLIENT' },
    { label: 'Nutricionistas', value: 'NUTRITIONIST' },
    { label: 'Administración', value: 'ADMIN' },
  ];
  protected readonly statusOptions = [
    { label: 'Todas las cuentas', value: null },
    { label: 'Activas', value: 'ACTIVE' },
    { label: 'Desactivadas', value: 'DEACTIVATED' },
  ];
  protected readonly accountsPlural = {
    '=0': 'Ninguna cuenta',
    '=1': '1 cuenta',
    other: '# cuentas',
  };

  protected readonly searchText = signal('');
  private readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly role = signal<Role | null>(null);
  protected readonly status = signal<UserStatus | null>(null);
  /** Página y orden; con otros filtros vuelve a la primera página (conservando el orden). */
  private readonly query = linkedSignal<unknown, PageQuery>({
    source: () => [this.search(), this.role(), this.status()],
    computation: (_, previous) => ({ page: 0, sort: previous?.value.sort ?? DEFAULT_SORT }),
    equal: samePageQuery,
  });
  protected readonly first = computed(() => this.query().page * this.pageSize);

  protected readonly users = this.api.users(
    computed(
      () => ({
        q: this.search(),
        role: this.role(),
        status: this.status(),
        ...this.query(),
      }),
      { equal: sameValues },
    ),
  );
  /** La última página recibida: la tabla la conserva mientras carga la siguiente. */
  protected readonly result = lastValue(this.users);
  protected readonly items = computed(() => this.result()?.content ?? []);
  protected readonly total = computed(() => this.result()?.page.totalElements ?? 0);

  protected load(event: TableLazyLoadEvent): void {
    this.query.set(pageQueryOf(event, this.pageSize, DEFAULT_SORT));
  }

  protected isMe(user: AdminUserResponse): boolean {
    return user.id === this.auth.user()?.id;
  }

  protected async deactivate(user: AdminUserResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Desactivar la cuenta',
      message: `${user.firstName} ${user.lastName} no podrá iniciar sesión y se cerrarán sus sesiones abiertas. Puedes reactivarla cuando quieras.`,
      acceptLabel: 'Desactivar',
      danger: true,
    });
    if (confirmed) {
      await this.change(() => this.api.deactivate(user.id), 'Cuenta desactivada');
    }
  }

  protected async activate(user: AdminUserResponse): Promise<void> {
    await this.change(() => this.api.activate(user.id), 'Cuenta reactivada');
  }

  private async change(action: () => Promise<unknown>, done: string): Promise<void> {
    try {
      await action();
      this.users.reload();
      this.toaster.success(done);
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }
}
