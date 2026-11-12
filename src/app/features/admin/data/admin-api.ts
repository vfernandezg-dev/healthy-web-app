import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable, type Signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_CONFIG } from '@core/api/api-config';
import { silentErrors } from '@core/api/http-context';
import type {
  AdminUserResponse,
  BillingSummaryResponse,
  InvitationResponse,
  InviteNutritionistRequest,
  PagedModelAdminPaymentResponse,
  PagedModelAdminSubscriptionResponse,
  PagedModelAdminUserResponse,
  PagedModelInvitationResponse,
  PagedModelReportResponse,
  ReportResponse,
  ResolveRequest,
  UserSummaryResponse,
} from '@core/api/schema';
import { type PageQuery, pageParams } from '@shared/table/page-query';
import type { Role } from '@core/auth/roles';
import type { ReportStatus, UserStatus } from '@shared/i18n/labels';

export const ADMIN_PAGE_SIZE = 20;

export interface UserFilters extends PageQuery {
  readonly q: string;
  readonly role: Role | null;
  readonly status: UserStatus | null;
}

export interface SubscriptionFilters extends PageQuery {
  readonly status: string | null;
  readonly tier: string | null;
}

export interface PaymentFilters extends PageQuery {
  readonly status: string | null;
}

/** Panel de administración: cuentas, invitaciones de nutricionistas, moderación y facturación. */
@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);
  private readonly api = inject(APP_CONFIG).apiUrl;

  // ---------------------------------------------------------------- cuentas

  users(filters: Signal<UserFilters>) {
    return httpResource<PagedModelAdminUserResponse>(() => {
      const { q, role, status, ...query } = filters();
      return {
        url: `${this.api}/admin/users`,
        params: pageParams({ ...query, size: ADMIN_PAGE_SIZE }, { q, role, status }),
      };
    });
  }

  userSummary() {
    return httpResource<UserSummaryResponse>(() => `${this.api}/admin/users/summary`);
  }

  /** Cierra además todas sus sesiones. 409 `cannot-deactivate-self` con la propia cuenta. */
  deactivate(id: string): Promise<AdminUserResponse> {
    return firstValueFrom(
      this.http.post<AdminUserResponse>(`${this.api}/admin/users/${id}/deactivate`, null),
    );
  }

  activate(id: string): Promise<AdminUserResponse> {
    return firstValueFrom(
      this.http.post<AdminUserResponse>(`${this.api}/admin/users/${id}/activate`, null),
    );
  }

  // ---------------------------------------------------------------- invitaciones

  invitations(query: Signal<PageQuery>) {
    return httpResource<PagedModelInvitationResponse>(() => ({
      url: `${this.api}/admin/nutritionist-invitations`,
      params: pageParams({ ...query(), size: ADMIN_PAGE_SIZE }),
    }));
  }

  /** 409 `email-taken` si ya hay una cuenta con ese correo. */
  invite(body: InviteNutritionistRequest): Promise<InvitationResponse> {
    return firstValueFrom(
      this.http.post<InvitationResponse>(`${this.api}/admin/nutritionist-invitations`, body, {
        context: silentErrors(),
      }),
    );
  }

  /** Enlace nuevo (el anterior deja de valer). Para invitaciones pendientes o caducadas. */
  resend(id: string): Promise<InvitationResponse> {
    return firstValueFrom(
      this.http.post<InvitationResponse>(
        `${this.api}/admin/nutritionist-invitations/${id}/resend`,
        null,
      ),
    );
  }

  revoke(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.api}/admin/nutritionist-invitations/${id}`),
    );
  }

  // ---------------------------------------------------------------- moderación

  reports(filters: Signal<PageQuery & { readonly status: ReportStatus }>) {
    return httpResource<PagedModelReportResponse>(() => {
      const { status, ...query } = filters();
      return {
        url: `${this.api}/admin/moderation/reports`,
        params: pageParams({ ...query, size: ADMIN_PAGE_SIZE }, { status }),
      };
    });
  }

  /** HIDE oculta lo denunciado y cierra todas sus denuncias; DISMISS cierra solo esta. 409 `report-closed`. */
  resolve(id: string, body: ResolveRequest): Promise<ReportResponse> {
    return firstValueFrom(
      this.http.post<ReportResponse>(`${this.api}/admin/moderation/reports/${id}/resolve`, body, {
        context: silentErrors(),
      }),
    );
  }

  // ---------------------------------------------------------------- facturación

  billingSummary() {
    return httpResource<BillingSummaryResponse>(() => `${this.api}/admin/billing/summary`);
  }

  subscriptions(filters: Signal<SubscriptionFilters>) {
    return httpResource<PagedModelAdminSubscriptionResponse>(() => {
      const { status, tier, ...query } = filters();
      return {
        url: `${this.api}/admin/subscriptions`,
        params: pageParams({ ...query, size: ADMIN_PAGE_SIZE }, { status, tier }),
      };
    });
  }

  payments(filters: Signal<PaymentFilters>) {
    return httpResource<PagedModelAdminPaymentResponse>(() => {
      const { status, ...query } = filters();
      return {
        url: `${this.api}/admin/payments`,
        params: pageParams({ ...query, size: ADMIN_PAGE_SIZE }, { status }),
      };
    });
  }
}
