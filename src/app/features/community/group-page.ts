import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideLock, LucideMessageSquare, LucidePlus } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import type { GroupResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { type ReportTarget } from './data/community-api';
import { GroupDialog } from './group-dialog';
import { GroupMembers } from './group-members';
import { PostCard } from './post-card';
import { PostDialog, type PostTarget } from './post-dialog';
import { ReportDialog } from './report-dialog';
import { titleFrom } from '@core/routing/title-strategy';
import { dialogState } from '@shared/ui/dialog-state';
import { groupStore } from './data/group.store';
import { GroupHeader } from './ui/group-header';
import { BackLink } from '@shared/ui/back-link';
import { PagedGrid } from '@shared/table/paged-grid';
import { RowTemplate } from '@shared/table/row-template';

/**
 * Un grupo: su ficha, las acciones según la relación con él (entrar, pedir entrar, salir, editar, borrar), las
 * publicaciones con sus comentarios y, para los miembros, la lista de miembros.
 */
@Component({
  selector: 'app-group-page',
  imports: [
    GroupHeader,
    BackLink,
    PagedGrid,
    RowTemplate,
    ButtonDirective,
    Skeleton,
    LucidePlus,
    GroupMembers,
    PostCard,
    GroupDialog,
    PostDialog,
    ReportDialog,
    EmptyState,
    LoadError,
  ],
  templateUrl: './group-page.html',
})
export class GroupPage {
  private readonly toaster = inject(Toaster);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Id del grupo (parámetro de la ruta). */
  readonly id = input.required<string>();

  protected readonly store = groupStore(this.id);
  protected readonly groupDialog = dialogState<GroupResponse>();
  protected readonly postDialog = dialogState<PostTarget>();
  protected readonly reportDialog = dialogState<ReportTarget>();
  protected readonly lockIcon = LucideLock;
  protected readonly postsIcon = LucideMessageSquare;

  /** La pestaña lleva el nombre de lo que se ve. */
  private readonly tabTitle = titleFrom(() =>
    this.store.group.hasValue() ? this.store.group.value().name : null,
  );

  protected async deleteGroup(): Promise<void> {
    if (await this.store.deleteGroup.run()) {
      await this.router.navigate(['../..'], { relativeTo: this.route });
    }
  }

  protected reported(): void {
    this.toaster.success('Denuncia enviada', 'Gracias. El equipo de moderación la revisará.');
  }
}
