import { Component, inject, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Toaster } from '@core/ui/toaster';
import { PageHeader } from '@shared/ui/page-header';
import { ContentApi } from '../data/content-api';
import { ContentFields, contentSchema, emptyContent, toContentRequest } from '../ui/content-fields';
import { formSubmitter } from '@shared/forms/form-submitter';

/** Nuevo contenido: se guarda como borrador y se pasa a su editor. */
@Component({
  selector: 'app-content-new',
  imports: [RouterLink, ButtonDirective, LucideArrowLeft, ContentFields, PageHeader],
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
    <form class="card max-w-4xl p-6 sm:p-8" novalidate (submit)="save($event)">
      <app-content-fields [form]="contentForm" />
      <div class="mt-6 flex justify-end">
        <button pButton type="submit" [loading]="contentForm().submitting()">
          Guardar el borrador
        </button>
      </div>
    </form>
  `,
})
export class ContentNew {
  private readonly submitForm = formSubmitter();
  private readonly api = inject(ContentApi);
  private readonly router = inject(Router);
  private readonly toaster = inject(Toaster);

  protected readonly model = signal(emptyContent());
  protected readonly contentForm = form(this.model, contentSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.contentForm, {
      save: () => this.api.create(toContentRequest(this.model())),
      onSuccess: async (created) => {
        this.toaster.success('Borrador guardado');
        await this.router.navigate(['/nutritionist/content', created.item.id]);
      },
    });
  }
}
