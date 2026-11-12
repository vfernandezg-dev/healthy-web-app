import { DatePipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideEyeOff, LucideShieldCheck } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { type PaginatorState, Paginator } from 'primeng/paginator';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { Toaster } from '@core/ui/toaster';
import {
  REPORT_STATUS_LABELS,
  REPORT_TARGET_LABELS,
  type ReportStatus,
  optionsOf,
} from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { ADMIN_PAGE_SIZE, AdminApi } from '../data/admin-api';
import { ResolveDialog } from './resolve-dialog';

/** Denuncias de la comunidad: las abiertas se atienden por orden de llegada; las cerradas, de la más reciente. */
@Component({
  selector: 'app-moderation-page',
  imports: [
    FormsModule,
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

  protected readonly dialog = viewChild(ResolveDialog);
  protected readonly pageSize = ADMIN_PAGE_SIZE;
  protected readonly targets = REPORT_TARGET_LABELS;
  protected readonly statusOptions = optionsOf(REPORT_STATUS_LABELS);
  protected readonly doneIcon = LucideShieldCheck;

  protected readonly status = signal<ReportStatus>('OPEN');
  protected readonly page = linkedSignal({ source: this.status, computation: () => 0 });
  protected readonly reports = this.api.reports(
    computed(() => ({
      status: this.status(),
      page: this.page(),
      sort: this.status() === 'OPEN' ? 'createdAt,asc' : 'createdAt,desc',
    })),
  );

  protected changePage(event: PaginatorState): void {
    this.page.set(event.page ?? 0);
  }

  protected resolved(event: { action: 'HIDE' | 'DISMISS'; alreadyClosed: boolean }): void {
    if (event.alreadyClosed) {
      this.toaster.info('Ya estaba resuelta', 'Otra persona la cerró antes.');
    } else if (event.action === 'HIDE') {
      this.toaster.success('Contenido oculto', 'Se han cerrado todas sus denuncias.');
    } else {
      this.toaster.success('Denuncia descartada');
    }
    const lastOnPage = this.reports.hasValue() && this.reports.value().content.length === 1;
    if (lastOnPage && this.page() > 0) {
      this.page.update((page) => page - 1);
    } else {
      this.reports.reload();
    }
  }
}
