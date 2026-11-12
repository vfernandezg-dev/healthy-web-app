import { DatePipe, NgTemplateOutlet, formatDate } from '@angular/common';
import { Component, LOCALE_ID, inject, viewChild } from '@angular/core';
import { LucideMailPlus } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { SortIcon as TableSortIcon, SortableColumn, Table } from 'primeng/table';
import { Tag } from 'primeng/tag';
import type { InvitationResponse } from '@core/api/schema';
import { Toaster } from '@core/ui/toaster';
import { INVITATION_STATUS_LABELS, INVITATION_STATUS_SEVERITY } from '@shared/i18n/labels';
import { EmptyState } from '@shared/ui/empty-state';
import { LoadError } from '@shared/ui/load-error';
import { PageHeader } from '@shared/ui/page-header';
import { SortIcon } from '@shared/ui/sort-icon';
import { AdminApi } from '../data/admin-api';
import { InviteDialog } from './invite-dialog';
import { RowTemplate } from '@shared/table/row-template';
import { pagedQuery } from '@shared/table/paged-query';
import { PAGE_SIZE } from '@shared/table/page-size';
import { mutation } from '@shared/utils/mutation';

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
  private readonly toaster = inject(Toaster);
  private readonly locale = inject(LOCALE_ID);

  protected readonly dialog = viewChild(InviteDialog);
  protected readonly statuses = INVITATION_STATUS_LABELS;
  protected readonly severities = INVITATION_STATUS_SEVERITY;
  protected readonly mailIcon = LucideMailPlus;

  protected readonly invitations = pagedQuery({
    defaultSort: DEFAULT_SORT,
    pageSize: PAGE_SIZE.table,
    load: (request) => this.api.invitations(request),
  });

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
    // La nueva sale primera: a la primera página (con el orden actual).
    this.invitations.afterCreate();
  }

  protected readonly resend = mutation(
    (invitation: InvitationResponse) => this.api.resend(invitation.id),
    {
      success: 'Invitación reenviada',
      onSuccess: () => this.invitations.reload(),
    },
  );

  protected readonly revoke = mutation(
    (invitation: InvitationResponse) => this.api.revoke(invitation.id),
    {
      confirm: (invitation) => ({
        header: 'Revocar la invitación',
        message: `El enlace que recibió ${invitation.firstName} ${invitation.lastName} dejará de funcionar.`,
        acceptLabel: 'Revocar',
        danger: true,
      }),
      success: 'Invitación revocada',
      onSuccess: () => this.invitations.reload(),
    },
  );
}
