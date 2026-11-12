import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { Toaster } from '@core/ui/toaster';
import { PUBLICATION_STATUS_LABELS, PUBLICATION_STATUS_SEVERITY } from '@shared/i18n/labels';
import { LoadError } from '@shared/ui/load-error';
import { ContentApi } from '../data/content-api';
import {
  ContentFields,
  contentModelOf,
  contentSchema,
  emptyContent,
  toContentRequest,
} from '../ui/content-fields';
import { formSubmitter } from '@shared/forms/form-submitter';
import { mutation } from '@shared/utils/mutation';
import { PublicationActions } from '@shared/publishing/publication-actions';
import { BackLink } from '@shared/ui/back-link';

/** Editor de un contenido del nutricionista: texto, portada, fichero y publicación. */
@Component({
  selector: 'app-content-editor',
  imports: [BackLink, PublicationActions, ButtonDirective, Skeleton, Tag, ContentFields, LoadError],
  templateUrl: './content-editor.html',
})
export class ContentEditor {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(ContentApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  /** Id del contenido (parámetro de la ruta). */
  readonly id = input.required<string>();

  protected readonly content = this.api.own(this.id);
  protected readonly current = computed(() =>
    this.content.hasValue() ? this.content.value() : undefined,
  );
  protected readonly statusLabels = PUBLICATION_STATUS_LABELS;
  protected readonly statusSeverity = PUBLICATION_STATUS_SEVERITY;

  protected readonly model = linkedSignal(() => {
    const current = this.current();
    return current ? contentModelOf(current) : emptyContent();
  });
  protected readonly contentForm = form(this.model, contentSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.contentForm, {
      save: () => this.api.update(this.id(), toContentRequest(this.model())),
      onSuccess: (content) => {
        this.content.value.set(content);
        this.contentForm().reset();
        this.toaster.success('Cambios guardados');
      },
    });
  }

  protected readonly publish = mutation(() => this.api.publish(this.id()), {
    success: 'Contenido publicado: ya está en el catálogo',
    onSuccess: (content) => this.content.value.set(content),
  });

  protected readonly archive = mutation(() => this.api.archive(this.id()), {
    confirm: {
      header: 'Archivar el contenido',
      message:
        'Dejará de aparecer en el catálogo. Quien lo desbloqueó con una recompensa lo conserva.',
      acceptLabel: 'Archivar',
      danger: true,
    },
    success: 'Contenido archivado',
    onSuccess: (content) => this.content.value.set(content),
  });

  protected readonly remove = mutation(() => this.api.delete(this.id()), {
    confirm: {
      header: 'Eliminar el borrador',
      message: 'Se borrará el contenido. Esta acción no se puede deshacer.',
      acceptLabel: 'Eliminar',
      danger: true,
    },
    success: 'Borrador eliminado',
    onSuccess: async () => {
      await this.router.navigate(['/nutritionist/content']);
    },
  });

  protected readonly pending = computed(
    () => this.publish.pending() || this.archive.pending() || this.remove.pending(),
  );
}
