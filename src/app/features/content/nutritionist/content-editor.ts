import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
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

/** Editor de un contenido del nutricionista: texto, portada, fichero y publicación. */
@Component({
  selector: 'app-content-editor',
  imports: [
    PublicationActions,
    RouterLink,
    ButtonDirective,
    Skeleton,
    Tag,
    LucideArrowLeft,
    ContentFields,
    LoadError,
  ],
  template: `
    <a
      routerLink=".."
      class="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
    >
      <svg lucideArrowLeft class="size-4"></svg>
      Tu contenido
    </a>

    @if (content.error()) {
      <app-load-error [error]="content.error()" (retry)="content.reload()" />
    } @else if (current(); as current) {
      @let status = current.item.status;
      <header class="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p-tag [value]="statusLabels[status]" [severity]="statusSeverity[status]" />
          <h1 class="mt-2 text-3xl font-bold tracking-tight text-balance">
            {{ current.item.title }}
          </h1>
          @if (status === 'PUBLISHED') {
            <p class="mt-1 text-muted">Publicado en el catálogo como «{{ current.item.slug }}».</p>
          }
        </div>
        <app-publication-actions
          [status]="status"
          [pending]="pending()"
          (publish)="publish.run()"
          (archive)="archive.run()"
          (remove)="remove.run()"
        />
      </header>

      <form class="card max-w-4xl p-6 sm:p-8" novalidate (submit)="save($event)">
        <app-content-fields [form]="contentForm" [coverPath]="current.item.coverPath ?? null" />
        <div class="mt-6 flex justify-end">
          <button pButton type="submit" [loading]="contentForm().submitting()">
            Guardar los cambios
          </button>
        </div>
      </form>
    } @else {
      <div class="max-w-4xl space-y-4" aria-busy="true">
        <p-skeleton height="2.5rem" width="50%" />
        <p-skeleton height="24rem" borderRadius="1.5rem" />
      </div>
    }
  `,
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
