import { DatePipe, I18nPluralPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideArrowLeft,
  LucideLock,
  LucideLogOut,
  LucideMessageSquare,
  LucidePencil,
  LucidePlus,
  LucideTrash,
  LucideUserPlus,
  LucideUsers,
} from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { AuthStore } from '@core/auth/auth-store';
import type { GroupResponse, PostResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { CommunityApi, POST_PAGE_SIZE, type ReportTarget } from './data/community-api';
import { GroupDialog } from './group-dialog';
import { GroupMembers } from './group-members';
import { PostCard } from './post-card';
import { PostDialog, type PostTarget } from './post-dialog';
import { ReportDialog } from './report-dialog';
import { MEMBERS_PLURAL, type Viewer, membershipLabel, viewerOf } from './data/membership';
import { VisibilityBadge } from './ui/visibility-badge';
import { titleFrom } from '@core/routing/title-strategy';
import { dialogState } from '@shared/ui/dialog-state';

type Relation = 'owner' | 'member' | 'pending' | 'none';

/**
 * Un grupo: su ficha, las acciones según la relación con él (entrar, pedir entrar, salir, editar, borrar), las
 * publicaciones con sus comentarios y, para los miembros, la lista de miembros.
 */
@Component({
  selector: 'app-group-page',
  imports: [
    RouterLink,
    DatePipe,
    I18nPluralPipe,
    ButtonDirective,
    Paginator,
    Skeleton,
    LucideArrowLeft,
    LucideLogOut,
    LucidePencil,
    LucidePlus,
    LucideTrash,
    LucideUserPlus,
    LucideUsers,
    VisibilityBadge,
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
  private readonly api = inject(CommunityApi);
  private readonly auth = inject(AuthStore);
  private readonly confirmer = inject(Confirmer);
  private readonly toaster = inject(Toaster);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Id del grupo (parámetro de la ruta). */
  readonly id = input.required<string>();

  protected readonly groupDialog = dialogState<GroupResponse>();
  protected readonly postDialog = dialogState<PostTarget>();
  protected readonly reportDialog = dialogState<ReportTarget>();
  protected readonly pageSize = POST_PAGE_SIZE;
  protected readonly membersPlural = MEMBERS_PLURAL;
  protected readonly lockIcon = LucideLock;
  protected readonly postsIcon = LucideMessageSquare;

  protected readonly group = this.api.group(this.id);

  /** La pestaña lleva el nombre de lo que se ve. */
  private readonly tabTitle = titleFrom(() =>
    this.group.hasValue() ? this.group.value().name : null,
  );
  private readonly current = computed(() => (this.group.hasValue() ? this.group.value() : null));

  protected readonly viewer = computed<Viewer>(() => {
    const userId = this.auth.user()?.id ?? null;
    const group = this.current();
    return group ? viewerOf(group, userId) : { userId, member: false, owner: false };
  });
  protected readonly relation = computed<Relation>(() => {
    const membership = this.current()?.membership;
    if (!membership) {
      return 'none';
    }
    if (membership.status === 'PENDING') {
      return 'pending';
    }
    return membership.role === 'OWNER' ? 'owner' : 'member';
  });
  protected readonly membership = computed(() => membershipLabel(this.current()?.membership));
  /** Las publicaciones de un grupo privado solo las leen sus miembros. */
  protected readonly canRead = computed(
    () => this.current()?.visibility === 'PUBLIC' || this.viewer().member,
  );

  protected readonly page = linkedSignal({ source: this.id, computation: () => 0 });
  protected readonly posts = this.api.posts(
    computed(() => (this.canRead() ? { groupId: this.id(), page: this.page() } : undefined)),
  );
  /** Entrando, saliendo o retirando la solicitud. */
  protected readonly busy = signal(false);

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }

  // ---------------------------------------------------------------- membresía

  protected async join(): Promise<void> {
    this.busy.set(true);
    try {
      const updated = await this.api.join(this.id());
      this.group.set(updated);
      if (updated.membership?.status === 'PENDING') {
        this.toaster.success('Solicitud enviada', 'Quien creó el grupo la revisará.');
      } else {
        this.toaster.success('Ya eres miembro', 'Ahora puedes publicar y comentar.');
      }
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.busy.set(false);
    }
  }

  /** Sale del grupo o retira la solicitud pendiente. */
  protected async leave(group: GroupResponse): Promise<void> {
    const pending = group.membership?.status === 'PENDING';
    if (!pending) {
      const confirmed = await this.confirmer.ask({
        header: 'Salir del grupo',
        message:
          group.visibility === 'PRIVATE'
            ? 'Dejarás de ver sus publicaciones. Para volver tendrás que pedir entrar otra vez.'
            : 'Podrás volver a entrar cuando quieras.',
        acceptLabel: 'Salir',
        danger: true,
      });
      if (!confirmed) {
        return;
      }
    }
    this.busy.set(true);
    try {
      await this.api.leave(group.id);
      this.group.set({
        ...group,
        membership: null,
        members: pending ? group.members : Math.max(0, group.members - 1),
      });
      this.toaster.success(pending ? 'Solicitud retirada' : 'Has salido del grupo');
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.busy.set(false);
    }
  }

  // ---------------------------------------------------------------- el grupo (creador)

  protected groupSaved(group: GroupResponse): void {
    this.group.set(group);
    this.toaster.success('Grupo actualizado');
  }

  protected async deleteGroup(): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Eliminar el grupo',
      message: 'Se borrarán el grupo, sus publicaciones y sus comentarios. No se puede deshacer.',
      acceptLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.deleteGroup(this.id());
      this.toaster.success('Grupo eliminado');
      void this.router.navigate(['../..'], { relativeTo: this.route });
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }

  // ---------------------------------------------------------------- publicaciones

  protected postSaved(post: PostResponse): void {
    const edited =
      this.posts.hasValue() && this.posts.value().content.some((p) => p.id === post.id);
    this.toaster.success(edited ? 'Publicación actualizada' : 'Publicación creada');
    // Las nuevas salen las primeras.
    if (edited || this.page() === 0) {
      this.posts.reload();
    } else {
      this.page.set(0);
    }
  }

  protected async deletePost(post: PostResponse): Promise<void> {
    const mine = !!post.author && post.author.id === this.viewer().userId;
    const confirmed = await this.confirmer.ask({
      header: 'Eliminar la publicación',
      message: mine
        ? 'Se borrarán la publicación y sus comentarios.'
        : 'Como creador del grupo, puedes retirar publicaciones de otras personas. Se borrará con sus comentarios.',
      acceptLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.deletePost(post.id);
      this.toaster.success('Publicación eliminada');
      const lastOnPage = this.posts.hasValue() && this.posts.value().content.length === 1;
      if (lastOnPage && this.page() > 0) {
        this.page.update((page) => page - 1);
      } else {
        this.posts.reload();
      }
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }

  protected reported(): void {
    this.toaster.success('Denuncia enviada', 'Gracias. El equipo de moderación la revisará.');
  }
}
