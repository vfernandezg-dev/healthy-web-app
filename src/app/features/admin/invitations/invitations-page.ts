import { DatePipe, NgTemplateOutlet, formatDate } from '@angular/common';
import { Component, LOCALE_ID, computed, inject, signal, viewChild } from '@angular/core';
import { LucideMailPlus } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import {
  SortIcon as TableSortIcon,
  SortableColumn,
  Table,
  type TableLazyLoadEvent,
} from 'primeng/table';
import { Tag } from 'primeng/tag';
import type { InvitationResponse } from '@core/api/schema';
import { Confirmer } from '@core/ui/confirmer';
import { Toaster } from '@core/ui/toaster';
import { INVITATION_STATUS_LABELS, INVITATION_STATUS_SEVERITY } from '@shared/i18n/labels';
import { type PageQuery, pageQueryOf, samePageQuery } from '@shared/table/page-query';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { SortIcon } from '@shared/ui/sort-icon';
import { ADMIN_PAGE_SIZE, AdminApi } from '../data/admin-api';
import { InviteDialog } from './invite-dialog';
import { RowTemplate } from '@shared/table/row-template';
import { lastValue, sameValues } from '@shared/utils/last-value';

const DEFAULT_SORT = 'createdAt,desc';

/** Alta de nutricionistas por invitación (el registro público es solo para clientes). */
@Component({
  selector: 'app-invitations-page',
  imports: [
    DatePipe,
    NgTemplateOutlet,
    Skeleton,
    Tag,
    Table,
    SortableColumn,
    TableSortIcon,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    LucideMailPlus,
    InviteDialog,
    SortIcon,
    RowTemplate,
    EmptyState,
    LoadError,
    PageHeader,
  ],
  templateUrl: './invitations-page.html',
})
export class InvitationsPage {
  private readonly api = inject(AdminApi);
  private readonly confirmer = inject(Confirmer);
  private readonly toaster = inject(Toaster);
  private readonly locale = inject(LOCALE_ID);

  protected readonly dialog = viewChild(InviteDialog);
  protected readonly pageSize = ADMIN_PAGE_SIZE;
  protected readonly statuses = INVITATION_STATUS_LABELS;
  protected readonly severities = INVITATION_STATUS_SEVERITY;
  protected readonly mailIcon = LucideMailPlus;

  private readonly query = signal<PageQuery>(
    { page: 0, sort: DEFAULT_SORT },
    { equal: samePageQuery },
  );
  protected readonly first = computed(() => this.query().page * this.pageSize);
  protected readonly invitations = this.api.invitations(
    computed(() => this.query(), { equal: sameValues }),
  );
  /** La última página recibida: la tabla la conserva mientras carga la siguiente. */
  protected readonly result = lastValue(this.invitations);
  protected readonly items = computed(() => this.result()?.content ?? []);
  protected readonly total = computed(() => this.result()?.page.totalElements ?? 0);

  protected load(event: TableLazyLoadEvent): void {
    this.query.set(pageQueryOf(event, this.pageSize, DEFAULT_SORT));
  }

  /** Se puede reenviar mientras no se haya aceptado ni revocado. */
  protected canResend(invitation: InvitationResponse): boolean {
    return invitation.status === 'PENDING' || invitation.status === 'EXPIRED';
  }

  protected invited(invitation: InvitationResponse): void {
    const expires = formatDate(invitation.expiresAt, 'longDate', this.locale);
    this.toaster.success(
      'Invitación enviada',
      `${invitation.firstName} recibirá el enlace en ${invitation.email}. Caduca el ${expires}.`,
    );
    // A la primera página (con el orden actual) para ver la invitación nueva.
    const first = { page: 0, sort: this.query().sort };
    if (samePageQuery(this.query(), first)) {
      this.invitations.reload();
    } else {
      this.query.set(first);
    }
  }

  protected async resend(invitation: InvitationResponse): Promise<void> {
    try {
      await this.api.resend(invitation.id);
      this.invitations.reload();
      this.toaster.success('Invitación reenviada', 'El enlace anterior ya no sirve.');
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }

  protected async revoke(invitation: InvitationResponse): Promise<void> {
    const confirmed = await this.confirmer.ask({
      header: 'Revocar la invitación',
      message: `El enlace que recibió ${invitation.firstName} ${invitation.lastName} dejará de funcionar.`,
      acceptLabel: 'Revocar',
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    try {
      await this.api.revoke(invitation.id);
      this.invitations.reload();
      this.toaster.success('Invitación revocada');
    } catch {
      // El interceptor de errores ya ha avisado.
    }
  }
}
