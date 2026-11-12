import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Textarea } from 'primeng/textarea';
import type { CommentResponse, PostResponse } from '@core/api/schema';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { DELETED_ACCOUNT } from '@shared/i18n/labels';
import { LoadMoreFooter } from '@shared/ui/load-more-footer';
import { sameValues } from '@shared/utils/last-value';
import { loadMore } from '@shared/utils/load-more';
import { mutation } from '@shared/utils/mutation';
import { CommunityApi, type ReportTarget } from './data/community-api';
import type { Viewer } from './data/membership';

/**
 * Los comentarios de una publicación, de 20 en 20 con «Ver más», y el formulario para comentar. Contenedor: pide y
 * escribe en la API. La tarjeta de la publicación lo crea al abrir los comentarios (empieza por la primera página).
 */
@Component({
  selector: 'app-comment-thread',
  imports: [DatePipe, FormField, ButtonDirective, Skeleton, Textarea, LabeledField, LoadMoreFooter],
  host: { class: 'block space-y-4' },
  templateUrl: './comment-thread.html',
})
export class CommentThread {
  private readonly api = inject(CommunityApi);
  private readonly submitForm = formSubmitter();

  readonly post = input.required<PostResponse>();
  readonly viewer = input.required<Viewer>();
  /** Id del título de la publicación: da contexto a los botones. */
  readonly titleId = input.required<string>();
  readonly report = output<ReportTarget>();

  protected readonly dateFormat = "d 'de' MMMM, HH:mm";
  protected readonly describe = fieldDescription;
  protected readonly inputId = computed(() => `post-${this.post().id}-comment`);

  /** Por el id: otra copia de la misma publicación (al recargar la lista) no vuelve a pedirlos. */
  private readonly postId = computed(() => this.post().id);
  protected readonly comments = loadMore({
    resource: (page) =>
      this.api.comments(
        computed(() => ({ postId: this.postId(), page: page() }), { equal: sameValues }),
      ),
    key: (comment) => comment.id,
  });

  protected readonly model = signal({ body: '' });
  protected readonly commentForm = form(this.model, (path) => {
    required(path.body, { message: 'Escribe tu comentario' });
    maxLength(path.body, 1000, { message: 'Máximo 1000 caracteres' });
  });

  protected isMine(comment: CommentResponse): boolean {
    return !!comment.author && comment.author.id === this.viewer().userId;
  }

  protected authorName(comment: CommentResponse): string {
    return comment.author?.name ?? DELETED_ACCOUNT;
  }

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.commentForm, {
      save: () => this.api.comment(this.post().id, this.model().body.trim()),
      onSuccess: (created) => {
        this.commentForm().reset({ body: '' });
        // Es el más nuevo: va al final aunque queden páginas sin pedir.
        this.comments.append(created);
      },
    });
  }

  protected readonly remove = mutation(
    (comment: CommentResponse) => this.api.deleteComment(comment.id),
    {
      confirm: (comment) => ({
        header: 'Eliminar el comentario',
        message: this.isMine(comment)
          ? 'Se borrará tu comentario.'
          : 'Como creador del grupo, puedes retirar comentarios de otras personas.',
        acceptLabel: 'Eliminar',
        danger: true,
      }),
      success: 'Comentario eliminado',
      onSuccess: (_, comment) => this.comments.remove(comment.id),
    },
  );
}
