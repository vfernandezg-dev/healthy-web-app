import { Component, inject, signal } from '@angular/core';
import { form, submit } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { toProblem } from '../../../core/api/problem';
import { Toaster } from '../../../core/ui/toaster';
import { focusFirstInvalid, serverFieldErrors } from '../../../shared/forms/server-errors';
import { PageHeader } from '../../../shared/ui/page-header';
import { ContentApi } from '../data/content-api';
import { ContentFields, contentSchema, emptyContent, toContentRequest } from './content-fields';

/** Nuevo contenido: se guarda como borrador y se pasa a su editor. */
@Component({
  selector: 'app-content-new',
  imports: [RouterLink, ButtonDirective, ButtonLabel, LucideArrowLeft, ContentFields, PageHeader],
  template: `
    <a
      routerLink=".."
      class="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
    >
      <svg lucideArrowLeft class="size-4"></svg>
      Tu contenido
    </a>
    <app-page-header
      title="Nuevo contenido"
      description="Se guarda como borrador: revísalo y publícalo cuando esté listo."
    />
    <form class="card max-w-4xl p-6 sm:p-8" novalidate (submit)="onSubmit($event)">
      <app-content-fields [form]="contentForm" />
      <div class="mt-6 flex justify-end">
        <button pButton type="submit" [loading]="contentForm().submitting()">
          <span pButtonLabel>Guardar el borrador</span>
        </button>
      </div>
    </form>
  `,
})
export class ContentNew {
  private readonly api = inject(ContentApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  protected readonly model = signal(emptyContent());
  protected readonly contentForm = form(this.model, contentSchema);

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    await submit(this.contentForm, {
      action: async () => {
        try {
          const created = await this.api.create(toContentRequest(this.model()));
          this.toaster.success('Borrador guardado');
          await this.router.navigate(['/nutritionist/content', created.item.id]);
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
}
