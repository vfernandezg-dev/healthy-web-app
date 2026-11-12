import type { GroupResponse } from '../../../core/api/schema';

export type Membership = NonNullable<GroupResponse['membership']>;

/** Quién mira el grupo y qué puede hacer en él. */
export interface Viewer {
  /** Id del usuario con sesión. */
  readonly userId: string | null;
  /** Miembro activo (también el creador): puede publicar y comentar. */
  readonly member: boolean;
  /** Creador del grupo: modera las publicaciones y los comentarios de todos. */
  readonly owner: boolean;
}

export function viewerOf(group: GroupResponse, userId: string | null): Viewer {
  const membership = group.membership;
  return {
    userId,
    member: membership?.status === 'ACTIVE',
    owner: membership?.role === 'OWNER',
  };
}

/** Texto de la relación con el grupo para las tarjetas; `null` si no hay ninguna. */
export function membershipLabel(membership: GroupResponse['membership']): string | null {
  if (!membership) {
    return null;
  }
  if (membership.status === 'PENDING') {
    return 'Solicitud pendiente';
  }
  return membership.role === 'OWNER' ? 'Lo creaste tú' : 'Eres miembro';
}

/** Para el pipe i18nPlural. */
export const MEMBERS_PLURAL = { '=0': 'Sin miembros', '=1': '1 miembro', other: '# miembros' };
