import { Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, submit } from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '../../core/api/problem';
import type { PostResponse } from '../../core/api/schema';
import { LabeledField, fieldDescription } from '../../shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '../../shared/forms/server-errors';
import { MediaUpload } from '../../shared/media/media-upload';
import { CommunityApi } from './data/community-api';

interface PostModel {
  title: string;
  body: string;
  imageMediaId: string | null;
}

/** Id de la imagen a partir de su ruta pública (`/media/{id}`). */
function mediaIdOf(path: string | null | undefined): string | null {
  return path?.match(/^\/media\/([0-9a-f-]{36})$/i)?.[1] ?? null;
}

/** Escribir o editar una publicación, con imagen opcional. Se abre con {@link PostDialog.open}. */
@Component({
  selector: 'app-post-dialog',
  imports: [
    FormField,
    Dialog,
    InputText,
    Textarea,
    Message,
    ButtonDirective,
    ButtonLabel,
    LabeledField,
    MediaUpload,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="editing() ? 'Editar la publicación' : 'Nueva publicación'"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(36rem,calc(100vw-2rem))]"
    >
      <!-- En plantilla: el contenido se crea al abrir y se destruye al cerrar (la subida empieza de cero). -->
      <ng-template #content>
        @if (failure(); as message) {
          <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
        }
        <form id="post-form" class="space-y-5" novalidate (submit)="onSubmit($event)">
          <app-field label="Título" inputId="post-title" [field]="postForm.title">
            <input
              pInputText
              id="post-title"
              class="w-full"
              [formField]="postForm.title"
              [attr.aria-describedby]="describe('post-title', postForm.title)"
            />
          </app-field>
          <app-field label="Texto" inputId="post-body" [field]="postForm.body">
            <textarea
              pTextarea
              id="post-body"
              rows="5"
              class="w-full"
              [formField]="postForm.body"
              [attr.aria-describedby]="describe('post-body', postForm.body)"
            ></textarea>
          </app-field>
          <app-media-upload
            inputId="post-image"
            label="Imagen"
            purpose="POST_IMAGE"
            [hasCurrent]="model().imageMediaId !== null"
            [currentPath]="currentImage()"
            (changed)="postForm.imageMediaId().value.set($event?.id ?? null)"
          />
        </form>
      </ng-template>
      <ng-template #footer>
        <button
          pButton
          type="button"
          severity="secondary"
          variant="text"
          (click)="visible.set(false)"
        >
          <span pButtonLabel>Cancelar</span>
        </button>
        <button pButton type="submit" form="post-form" [loading]="postForm().submitting()">
          <span pButtonLabel>{{ editing() ? 'Guardar' : 'Publicar' }}</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class PostDialog {
  private readonly api = inject(CommunityApi);

  readonly saved = output<PostResponse>();

  protected readonly visible = signal(false);
  private readonly groupId = signal('');
  private readonly post = signal<PostResponse | null>(null);
  protected readonly editing = computed(() => this.post() !== null);
  protected readonly currentImage = computed(() => this.post()?.imagePath ?? null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected readonly model = signal<PostModel>({ title: '', body: '', imageMediaId: null });
  protected readonly postForm = form(this.model, (path) => {
    required(path.title, { message: 'Ponle un título' });
    maxLength(path.title, 120, { message: 'Máximo 120 caracteres' });
    required(path.body, { message: 'Escribe algo' });
    maxLength(path.body, 4000, { message: 'Máximo 4000 caracteres' });
  });

  open(groupId: string, post: PostResponse | null): void {
    this.groupId.set(groupId);
    this.post.set(post);
    this.failure.set(null);
    this.postForm().reset({
      title: post?.title ?? '',
      body: post?.body ?? '',
      imageMediaId: mediaIdOf(post?.imagePath),
    });
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.postForm, {
      action: async () => {
        const value = this.model();
        const body = {
          title: value.title.trim(),
          body: value.body.trim(),
          imageMediaId: value.imageMediaId,
        };
        const current = this.post();
        try {
          const saved = current
            ? await this.api.editPost(current.id, body)
            : await this.api.publish(this.groupId(), body);
          this.visible.set(false);
          this.saved.emit(saved);
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.postForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
