import { Component, inject, signal } from '@angular/core';
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
import { dialogState } from '@shared/ui/dialog-state';

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
  templateUrl: './community-directory.html',
})
export class CommunityDirectory {
  private readonly api = inject(CommunityApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toaster = inject(Toaster);

  protected readonly groupDialog = dialogState<GroupResponse | null>();
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
