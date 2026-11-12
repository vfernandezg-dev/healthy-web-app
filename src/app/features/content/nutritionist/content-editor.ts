import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArchive, LucideArrowLeft, LucideSend, LucideTrash2 } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Tag } from 'primeng/tag';
import { toProblem } from '@core/api/problem';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
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

/** Editor de un contenido del nutricionista: texto, portada, fichero y publicación. */
@Component({
  selector: 'app-content-editor',
  imports: [
    RouterLink,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Skeleton,
    Tag,
    LucideArrowLeft,
    LucideSend,
    LucideArchive,
    LucideTrash2,
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
        <div class="flex flex-wrap gap-2">
          @if (status === 'DRAFT') {
            <button
              pButton
              type="button"
              severity="danger"
              variant="text"
              [disabled]="busy()"
              (click)="remove()"
            >
              <svg lucideTrash2 pButtonIcon></svg>
              <span pButtonLabel>Eliminar</span>
            </button>
            <button pButton type="button" [loading]="busy()" (click)="publish()">
              <svg lucideSend pButtonIcon></svg>
              <span pButtonLabel>Publicar</span>
            </button>
          } @else if (status === 'PUBLISHED') {
            <button
              pButton
              type="button"
              severity="secondary"
              variant="outlined"
              [loading]="busy()"
              (click)="archive()"
            >
              <svg lucideArchive pButtonIcon></svg>
              <span pButtonLabel>Archivar</span>
            </button>
          }
        </div>
      </header>

      <form class="card max-w-4xl p-6 sm:p-8" novalidate (submit)="save($event)">
        <app-content-fields [form]="contentForm" [coverPath]="current.item.coverPath ?? null" />
        <div class="mt-6 flex justify-end">
          <button pButton type="submit" [loading]="contentForm().submitting()">
            <span pButtonLabel>Guardar los cambios</span>
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
  private readonly api = inject(ContentApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);
  private readonly confirmer = inject(Confirmer);

  /** Id del contenido (parámetro de la ruta). */
  readonly id = input.required<string>();

  protected readonly content = this.api.own(this.id);
  protected readonly current = computed(() =>
    this.content.hasValue() ? this.content.value() : undefined,
  );
  protected readonly statusLabels = PUBLICATION_STATUS_LABELS;
  protected readonly statusSeverity = PUBLICATION_STATUS_SEVERITY;
  protected readonly busy = signal(false);

  protected readonly model = linkedSignal(() => {
    const current = this.current();
    return current ? contentModelOf(current) : emptyContent();
  });
  protected readonly contentForm = form(this.model, contentSchema);

  protected async save(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.contentForm, {
      action: async () => {
        try {
          this.content.value.set(await this.api.update(this.id(), toContentRequest(this.model())));
          this.contentForm().reset();
          this.toaster.success('Cambios guardados');
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.contentForm, problem);
          }
          this.toaster.problem(problem);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }

  protected async publish(): Promise<void> {
    await this.run(async () => {
      this.content.value.set(await this.api.publish(this.id()));
    }, 'Contenido publicado: ya está en el catálogo');
  }

  protected async archive(): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Archivar el contenido',
      message:
        'Dejará de aparecer en el catálogo. Quien lo desbloqueó con una recompensa lo conserva.',
      acceptLabel: 'Archivar',
      danger: true,
    });
    if (confirmed) {
      await this.run(async () => {
        this.content.value.set(await this.api.archive(this.id()));
      }, 'Contenido archivado');
    }
  }

  protected async remove(): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Eliminar el borrador',
      message: 'Se borrará el contenido. Esta acción no se puede deshacer.',
      acceptLabel: 'Eliminar',
      danger: true,
    });
    if (confirmed) {
      await this.run(async () => {
        await this.api.delete(this.id());
        await this.router.navigate(['/nutritionist/content']);
      }, 'Borrador eliminado');
    }
  }

  private async run(action: () => Promise<void>, success: string): Promise<void> {
    this.busy.set(true);
    try {
      await action();
      this.toaster.success(success);
    } catch {
      // El interceptor de errores ya ha avisado.
    } finally {
      this.busy.set(false);
    }
  }
}
