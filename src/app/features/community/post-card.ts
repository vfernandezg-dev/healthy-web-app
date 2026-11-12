import { DatePipe, NgOptimizedImage, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, submit } from '@angular/forms/signals';
import { LucideFlag, LucideMessageCircle, LucidePencil, LucideTrash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Textarea } from 'primeng/textarea';
import type { CommentResponse, PostResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { focusFirstInvalid } from '@shared/forms/server-errors';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { PersonAvatar } from '@shared/ui/person-avatar';
import { loadMore } from '@shared/utils/load-more';
import { CommunityApi } from './data/community-api';
import type { Viewer } from './data/membership';

/** Publicación o comentario que se quiere denunciar. */
export interface ReportTarget {
  readonly kind: 'posts' | 'comments';
  readonly id: string;
}

type Author = PostResponse['author'];

/**
 * Una publicación del grupo con sus acciones (editar, borrar, denunciar) y sus comentarios, que se cargan al
 * desplegarlos: los 20 más antiguos y, con «Ver más comentarios», los siguientes.
 */
@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe,
    NgOptimizedImage,
    NgTemplateOutlet,
    MediaUrlPipe,
    FormField,
    Textarea,
    ButtonDirective,
    Skeleton,
    LabeledField,
    PersonAvatar,
    LucideMessageCircle,
    LucidePencil,
    LucideTrash,
    LucideFlag,
  ],
  host: { class: 'block' },
  template: `
    <article class="card p-5 sm:p-6" [attr.aria-labelledby]="titleId()">
      <header class="flex items-center gap-3">
        <app-person-avatar [name]="post().author?.name" />
        <div class="min-w-0">
          <p class="truncate font-semibold">{{ authorName(post().author) }}</p>
          <p class="text-sm text-muted">
            @if (post().createdAt; as createdAt) {
              <time [attr.datetime]="createdAt">{{ createdAt | date: dateFormat }}</time>
            }
            @if (edited()) {
              · editada
            }
          </p>
        </div>
      </header>

      <h3 [id]="titleId()" class="mt-4 text-lg font-bold text-balance">{{ post().title }}</h3>
      <p class="mt-2 whitespace-pre-line">{{ post().body }}</p>
      @if (post().imagePath; as imagePath) {
        <div class="relative mt-4 aspect-video overflow-hidden rounded-2xl bg-brand-50">
          <img
            [ngSrc]="(imagePath | mediaUrl) ?? ''"
            alt=""
            fill
            sizes="(min-width: 1024px) 42rem, 100vw"
            class="object-cover"
          />
        </div>
      }

      <div
        class="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-brand-100 pt-3"
      >
        <button
          pButton
          type="button"
          size="small"
          severity="secondary"
          variant="text"
          [attr.aria-expanded]="expanded()"
          [attr.aria-controls]="expanded() ? commentsId() : null"
          [attr.aria-describedby]="titleId()"
          (click)="toggleComments()"
        >
          <svg lucideMessageCircle></svg>
          {{ expanded() ? 'Ocultar los comentarios' : 'Comentarios' }}
        </button>
        <div class="flex flex-wrap gap-1">
          @if (mine()) {
            <button
              pButton
              type="button"
              size="small"
              severity="secondary"
              variant="text"
              [attr.aria-describedby]="titleId()"
              (click)="edit.emit()"
            >
              <svg lucidePencil></svg>
              Editar
            </button>
          }
          @if (mine() || viewer().owner) {
            <button
              pButton
              type="button"
              size="small"
              severity="danger"
              variant="text"
              [attr.aria-describedby]="titleId()"
              (click)="remove.emit()"
            >
              <svg lucideTrash></svg>
              Eliminar
            </button>
          }
          @if (!mine()) {
            <button
              pButton
              type="button"
              size="small"
              severity="secondary"
              variant="text"
              [attr.aria-describedby]="titleId()"
              (click)="report.emit({ kind: 'posts', id: post().id })"
            >
              <svg lucideFlag></svg>
              Denunciar
            </button>
          }
        </div>
      </div>

      @if (expanded()) {
        <div [id]="commentsId()" class="mt-4 space-y-4">
          @if (comments.loaded()) {
            @if (comments.items().length === 0) {
              <p class="text-sm text-muted">Aún no hay comentarios.</p>
            } @else {
              <ul class="space-y-3" role="list">
                @for (comment of comments.items(); track comment.id) {
                  <li class="rounded-2xl bg-brand-50/70 px-4 py-3">
                    <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                      <p class="text-sm">
                        <span class="font-semibold">{{ authorName(comment.author) }}</span>
                        @if (comment.createdAt; as createdAt) {
                          <span class="text-muted">
                            ·
                            <time [attr.datetime]="createdAt">{{
                              createdAt | date: dateFormat
                            }}</time>
                          </span>
                        }
                      </p>
                      <span class="flex gap-1">
                        @if (isMine(comment.author) || viewer().owner) {
                          <button
                            pButton
                            type="button"
                            size="small"
                            severity="danger"
                            variant="text"
                            [attr.aria-label]="
                              'Eliminar el comentario de ' + authorName(comment.author)
                            "
                            (click)="deleteComment(comment)"
                          >
                            Eliminar
                          </button>
                        }
                        @if (!isMine(comment.author)) {
                          <button
                            pButton
                            type="button"
                            size="small"
                            severity="secondary"
                            variant="text"
                            [attr.aria-label]="
                              'Denunciar el comentario de ' + authorName(comment.author)
                            "
                            (click)="report.emit({ kind: 'comments', id: comment.id })"
                          >
                            Denunciar
                          </button>
                        }
                      </span>
                    </div>
                    <p class="mt-1 whitespace-pre-line">{{ comment.body }}</p>
                  </li>
                }
              </ul>
            }
            @if (comments.resource.error()) {
              <ng-container *ngTemplateOutlet="loadError" />
            } @else if (comments.hasMore()) {
              <button
                pButton
                type="button"
                size="small"
                severity="secondary"
                variant="outlined"
                class="w-full"
                [attr.aria-describedby]="titleId()"
                [loading]="comments.resource.isLoading()"
                (click)="comments.more()"
              >
                Ver más comentarios
              </button>
            }
          } @else if (comments.resource.error()) {
            <ng-container *ngTemplateOutlet="loadError" />
          } @else {
            <p-skeleton height="4rem" borderRadius="1rem" />
          }

          @if (viewer().member) {
            <form class="space-y-3" novalidate (submit)="addComment($event)">
              <app-field
                label="Tu comentario"
                [inputId]="commentInputId()"
                [field]="commentForm.body"
              >
                <textarea
                  pTextarea
                  rows="2"
                  class="w-full"
                  [id]="commentInputId()"
                  [formField]="commentForm.body"
                  [attr.aria-describedby]="describe(commentInputId(), commentForm.body)"
                ></textarea>
              </app-field>
              <div class="flex justify-end">
                <button pButton type="submit" size="small" [loading]="commentForm().submitting()">
                  Comentar
                </button>
              </div>
            </form>
          } @else {
            <p class="text-sm text-muted">Únete al grupo para comentar.</p>
          }
        </div>
      }
    </article>

    <ng-template #loadError>
      <p class="text-sm text-red-700" role="alert">
        No se han podido cargar los comentarios.
        <button type="button" class="font-semibold underline" (click)="comments.resource.reload()">
          Reintentar
        </button>
      </p>
    </ng-template>
  `,
})
export class PostCard {
  private readonly api = inject(CommunityApi);
  private readonly confirmer = inject(Confirmer);
  private readonly toaster = inject(Toaster);

  readonly post = input.required<PostResponse>();
  readonly viewer = input.required<Viewer>();

  readonly edit = output();
  readonly remove = output();
  readonly report = output<ReportTarget>();

  protected readonly dateFormat = "d 'de' MMMM, HH:mm";
  protected readonly describe = fieldDescription;
  protected readonly titleId = computed(() => `post-${this.post().id}-title`);
  protected readonly commentsId = computed(() => `post-${this.post().id}-comments`);
  protected readonly commentInputId = computed(() => `post-${this.post().id}-comment`);

  protected readonly mine = computed(() => this.isMine(this.post().author));
  /** La API pone la misma fecha de creación y de modificación al crear. */
  protected readonly edited = computed(() => {
    const { createdAt, updatedAt } = this.post();
    return !!createdAt && !!updatedAt && createdAt !== updatedAt;
  });

  protected readonly expanded = signal(false);
  /** Solo se piden con la lista abierta; el id evita pedirlos otra vez si llega otra copia de la publicación. */
  private readonly commentsOf = computed(() => (this.expanded() ? this.post().id : undefined));
  protected readonly comments = loadMore({
    resource: (page) =>
      this.api.comments(
        computed(() => {
          const postId = this.commentsOf();
          return postId ? { postId, page: page() } : undefined;
        }),
      ),
    key: (comment) => comment.id,
  });

  protected readonly commentModel = signal({ body: '' });
  protected readonly commentForm = form(this.commentModel, (path) => {
    required(path.body, { message: 'Escribe tu comentario' });
    maxLength(path.body, 1000, { message: 'Máximo 1000 caracteres' });
  });

  /** Al abrirlos, empiezan otra vez por la primera página. */
  protected toggleComments(): void {
    if (!this.expanded()) {
      this.comments.reset();
    }
    this.expanded.update((open) => !open);
  }

  protected isMine(author: Author): boolean {
    return !!author && author.id === this.viewer().userId;
  }

  protected authorName(author: Author): string {
    return author?.name ?? 'Cuenta eliminada';
  }

  protected async addComment(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.commentForm, {
      action: async () => {
        try {
          const created = await this.api.comment(this.post().id, this.commentModel().body.trim());
          this.commentForm().reset({ body: '' });
          // Es el más nuevo: va al final aunque queden páginas sin pedir.
          this.comments.append(created);
        } catch {
          // El interceptor de errores ya ha avisado.
        }
        return undefined;
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }

  protected async deleteComment(comment: CommentResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Eliminar el comentario',
      message: this.isMine(comment.author)
        ? 'Se borrará tu comentario.'
        : 'Como creador del grupo, puedes retirar comentarios de otras personas.',
      acceptLabel: 'Eliminar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.deleteComment(comment.id);
      this.comments.remove(comment.id);
      this.toaster.success('Comentario eliminado');
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }
}
