import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, schema } from '@angular/forms/signals';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import type { PostRequest, PostResponse } from '@core/api/schema';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { MediaUpload } from '@shared/media/media-upload';
import { CommunityApi } from './data/community-api';

interface PostModel {
  title: string;
  body: string;
  imageMediaId: string | null;
}

export const postSchema = schema<PostModel>((path) => {
  required(path.title, { message: 'Ponle un título' });
  maxLength(path.title, 120, { message: 'Máximo 120 caracteres' });
  required(path.body, { message: 'Escribe algo' });
  maxLength(path.body, 4000, { message: 'Máximo 4000 caracteres' });
});

/** Id de la imagen a partir de su ruta pública (`/media/{id}`). */
function mediaIdOf(path: string | null | undefined): string | null {
  return path?.match(/^\/media\/([0-9a-f-]{36})$/i)?.[1] ?? null;
}

function modelOf(post: PostResponse | null): PostModel {
  return {
    title: post?.title ?? '',
    body: post?.body ?? '',
    imageMediaId: mediaIdOf(post?.imagePath),
  };
}

function requestOf(model: PostModel): PostRequest {
  return { title: model.title.trim(), body: model.body.trim(), imageMediaId: model.imageMediaId };
}

/** Qué publicación se escribe: una nueva en un grupo, o una que ya existe. */
export type PostTarget =
  | { readonly groupId: string; readonly post: null }
  | { readonly groupId: string; readonly post: PostResponse };

/** Escribir o editar una publicación, con imagen opcional. La página lo crea al abrirlo. */
@Component({
  selector: 'app-post-dialog',
  imports: [FormField, InputText, Textarea, LabeledField, MediaUpload, FormDialog],
  templateUrl: './post-dialog.html',
})
export class PostDialog {
  private readonly api = inject(CommunityApi);
  private readonly submitForm = formSubmitter();

  readonly target = input.required<PostTarget>();
  readonly saved = output<PostResponse>();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly failure = signal<string | null>(null);
  protected readonly editing = computed(() => this.target().post !== null);
  protected readonly currentImage = computed(() => this.target().post?.imagePath ?? null);
  protected readonly describe = fieldDescription;

  protected readonly model = linkedSignal(() => modelOf(this.target().post));
  protected readonly postForm = form(this.model, postSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.postForm, {
      failure: this.failure,
      save: () => {
        const { groupId, post } = this.target();
        const body = requestOf(this.model());
        return post ? this.api.editPost(post.id, body) : this.api.publish(groupId, body);
      },
      onSuccess: (post) => {
        this.saved.emit(post);
        this.open.set(false);
      },
    });
  }
}
