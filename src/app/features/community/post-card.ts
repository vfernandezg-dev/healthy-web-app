import { DatePipe, NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import { LucideFlag, LucideMessageCircle, LucidePencil, LucideTrash } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import type { PostResponse } from '@core/api/schema';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { PersonAvatar } from '@shared/ui/person-avatar';
import type { ReportTarget } from './data/community-api';
import type { Viewer } from './data/membership';
import { CommentThread } from './comment-thread';
import { DELETED_ACCOUNT } from '@shared/i18n/labels';

/**
 * Una publicación: autor, fecha, texto, imagen y sus acciones (editar, eliminar, denunciar). Presentacional: la página
 * hace las escrituras. Al abrir los comentarios crea {@link CommentThread}, que los pide y permite comentar.
 */
@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe,
    NgOptimizedImage,
    ButtonDirective,
    LucideMessageCircle,
    LucidePencil,
    LucideTrash,
    LucideFlag,
    PersonAvatar,
    MediaUrlPipe,
    CommentThread,
  ],
  templateUrl: './post-card.html',
})
export class PostCard {
  readonly post = input.required<PostResponse>();
  readonly viewer = input.required<Viewer>();

  readonly edit = output();
  readonly remove = output();
  readonly report = output<ReportTarget>();

  protected readonly dateFormat = "d 'de' MMMM, HH:mm";
  protected readonly titleId = computed(() => `post-${this.post().id}-title`);
  protected readonly commentsId = computed(() => `post-${this.post().id}-comments`);
  protected readonly authorName = computed(() => this.post().author?.name ?? DELETED_ACCOUNT);
  protected readonly mine = computed(() => {
    const author = this.post().author;
    return !!author && author.id === this.viewer().userId;
  });
  /** La API pone la misma fecha de creación y de modificación al crear. */
  protected readonly edited = computed(() => {
    const { createdAt, updatedAt } = this.post();
    return !!createdAt && !!updatedAt && createdAt !== updatedAt;
  });
  /** Comentarios abiertos: entonces se crea el hilo (y pide la primera página). */
  protected readonly expanded = signal(false);
}
