import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideEyeOff, LucideShieldCheck } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Paginator } from 'primeng/paginator';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { Toaster } from '@core/ui/toaster';
import { REPORT_STATUS_LABELS, REPORT_TARGET_LABELS, optionsOf } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { AdminApi, type ReportFilters } from '../data/admin-api';
import { ResolveDialog, type Resolution, type Resolved } from './resolve-dialog';
import { FormField, form } from '@angular/forms/signals';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { dialogState } from '@shared/ui/dialog-state';

/** Denuncias de la comunidad: las abiertas se atienden por orden de llegada; las cerradas, de la más reciente. */
@Component({
  selector: 'app-moderation-page',
  imports: [
    FormField,
    DatePipe,
    SelectButton,
    Paginator,
    Skeleton,
    ButtonDirective,
    LucideEyeOff,
    ResolveDialog,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './moderation-page.html',
})
export class ModerationPage {
  private readonly api = inject(AdminApi);
  private readonly toaster = inject(Toaster);

  protected readonly resolveDialog = dialogState<Resolution>();
  protected readonly targets = REPORT_TARGET_LABELS;
  protected readonly statusOptions = optionsOf(REPORT_STATUS_LABELS);
  protected readonly doneIcon = LucideShieldCheck;

  private readonly filterModel = signal<ReportFilters>({ status: 'OPEN' });
  protected readonly filters = form(this.filterModel);
  protected readonly status = computed(() => this.filterModel().status);
  /** Las abiertas se atienden por orden de llegada; las cerradas, de la más reciente. */
  protected readonly reports = pagedQuery({
    filters: this.filterModel,
    defaultSort: ({ status }) => (status === 'OPEN' ? 'createdAt,asc' : 'createdAt,desc'),
    pageSize: PAGE_SIZE.table,
    load: (request) => this.api.reports(request),
  });

  protected resolved(event: Resolved): void {
    if (event.alreadyClosed) {
      this.toaster.info('Ya estaba resuelta', 'Otra persona la cerró antes.');
    } else if (event.action === 'HIDE') {
      this.toaster.success('Contenido oculto', 'Se han cerrado todas sus denuncias.');
    } else {
      this.toaster.success('Denuncia descartada');
    }
    // Ya no está entre las abiertas.
    this.reports.afterRemove();
  }
}
