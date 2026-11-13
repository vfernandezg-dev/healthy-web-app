import type { BadgeTone } from '../ui/badge';
import type { components } from '@core/api/schema';
import type { Role } from '@core/auth/roles';

type Schemas = components['schemas'];

/** Nombre que se muestra cuando el autor o el titular ya no tiene cuenta (la API lo manda como null). */
export const DELETED_ACCOUNT = 'Cuenta eliminada';

/** Nombres en español de los valores que la API envía en inglés (enums). */
export const SEX_LABELS: Readonly<Record<NonNullable<Schemas['ClientData']['sex']>, string>> = {
  FEMALE: 'Mujer',
  MALE: 'Hombre',
  OTHER: 'Otro',
};

export type Tier = Schemas['PlanResponse']['tier'];

export const TIER_LABELS: Readonly<Record<Tier, string>> = {
  BASIC: 'Básico',
  PREMIUM: 'Premium',
  VIP: 'VIP',
};

export type PaymentStatus = Schemas['PaymentResponse']['status'];

export const PAYMENT_STATUS_LABELS: Readonly<Record<PaymentStatus, string>> = {
  CREATED: 'Pendiente',
  CAPTURED: 'Pagado',
  FAILED: 'Fallido',
  CANCELED: 'Cancelado',
};

/** Tono de app-badge para cada estado de pago (y así con el resto de mapas *_TONE). */
export const PAYMENT_STATUS_TONE: Readonly<
  Record<Schemas['PaymentResponse']['status'], BadgeTone>
> = {
  CREATED: 'warning',
  CAPTURED: 'positive',
  FAILED: 'danger',
  CANCELED: 'neutral',
};

export type MealPlanGoal = Schemas['MealPlanSummaryResponse']['goal'];
export type MealCategory = Schemas['MealResponse']['category'];
export type PublicationStatus = Schemas['MealPlanSummaryResponse']['status'];

export const GOAL_LABELS: Readonly<Record<MealPlanGoal, string>> = {
  WEIGHT_LOSS: 'Perder peso',
  MAINTENANCE: 'Mantener el peso',
  MUSCLE_GAIN: 'Ganar músculo',
};

export const MEAL_CATEGORY_LABELS: Readonly<Record<MealCategory, string>> = {
  BREAKFAST: 'Desayuno',
  LUNCH: 'Comida',
  DINNER: 'Cena',
  SNACK: 'Tentempié',
};

/** Estado de publicación (planes y contenidos). */
export const PUBLICATION_STATUS_LABELS: Readonly<Record<PublicationStatus, string>> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

export const PUBLICATION_STATUS_TONE: Readonly<Record<PublicationStatus, BadgeTone>> = {
  DRAFT: 'warning',
  PUBLISHED: 'positive',
  ARCHIVED: 'neutral',
};

export type ContentType = Schemas['ContentSummaryResponse']['type'];
export type ContentCategory = Schemas['ContentSummaryResponse']['category'];

export const CONTENT_TYPE_LABELS: Readonly<Record<ContentType, string>> = {
  ARTICLE: 'Artículo',
  VIDEO: 'Vídeo',
  GUIDE: 'Guía',
};

export const CONTENT_CATEGORY_LABELS: Readonly<Record<ContentCategory, string>> = {
  NUTRITION: 'Nutrición',
  EXERCISE: 'Ejercicio',
  MENTAL_HEALTH: 'Salud mental',
};

export type GoalStatus = Schemas['GoalResponse']['status'];

export const GOAL_STATUS_LABELS: Readonly<Record<GoalStatus, string>> = {
  ACTIVE: 'En curso',
  COMPLETED: 'Cumplida',
  ABANDONED: 'Abandonada',
};

export const GOAL_STATUS_TONE: Readonly<Record<GoalStatus, BadgeTone>> = {
  ACTIVE: 'outline',
  COMPLETED: 'positive',
  ABANDONED: 'neutral',
};

export type GroupVisibility = Schemas['GroupResponse']['visibility'];

export const GROUP_VISIBILITY_LABELS: Readonly<Record<GroupVisibility, string>> = {
  PUBLIC: 'Público',
  PRIVATE: 'Privado',
};

export const ROLE_LABELS: Readonly<Record<Role, string>> = {
  CLIENT: 'Cliente',
  NUTRITIONIST: 'Nutricionista',
  ADMIN: 'Administración',
};

/** Los roles en plural (filtros y recuentos por rol). */
export const ROLE_PLURAL_LABELS: Readonly<Record<Role, string>> = {
  CLIENT: 'Clientes',
  NUTRITIONIST: 'Nutricionistas',
  ADMIN: 'Administración',
};

export const ROLE_TONE: Readonly<Record<Role, BadgeTone>> = {
  CLIENT: 'neutral',
  NUTRITIONIST: 'positive',
  ADMIN: 'pine',
};

export type UserStatus = Schemas['AdminUserResponse']['status'];

export const USER_STATUS_LABELS: Readonly<Record<UserStatus, string>> = {
  ACTIVE: 'Activa',
  DEACTIVATED: 'Desactivada',
};

export type SubscriptionStatus = Schemas['AdminSubscriptionResponse']['status'];

export const SUBSCRIPTION_STATUS_LABELS: Readonly<Record<SubscriptionStatus, string>> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  ACTIVE: 'Activa',
  CANCELED: 'Cancelada',
  EXPIRED: 'Caducada',
};

export const SUBSCRIPTION_STATUS_TONE: Readonly<Record<SubscriptionStatus, BadgeTone>> = {
  PENDING_PAYMENT: 'warning',
  ACTIVE: 'positive',
  CANCELED: 'outline',
  EXPIRED: 'neutral',
};

export type InvitationStatus = Schemas['InvitationResponse']['status'];

export const INVITATION_STATUS_LABELS: Readonly<Record<InvitationStatus, string>> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  EXPIRED: 'Caducada',
  REVOKED: 'Revocada',
};

export const INVITATION_STATUS_TONE: Readonly<Record<InvitationStatus, BadgeTone>> = {
  PENDING: 'warning',
  ACCEPTED: 'positive',
  EXPIRED: 'neutral',
  REVOKED: 'danger',
};

export type ReportStatus = Schemas['ReportResponse']['status'];

export const REPORT_STATUS_LABELS: Readonly<Record<ReportStatus, string>> = {
  OPEN: 'Abiertas',
  RESOLVED: 'Resueltas',
  DISMISSED: 'Descartadas',
};

export const REPORT_TARGET_LABELS: Readonly<
  Record<Schemas['ReportResponse']['targetType'], string>
> = {
  POST: 'Publicación',
  COMMENT: 'Comentario',
};

/** Una opción de un p-select o p-selectbutton. */
export interface Option<T> {
  readonly label: string;
  readonly value: T;
}

/** Opciones para un p-select o p-selectbutton a partir de un mapa de etiquetas. */
export function optionsOf<T extends string>(labels: Readonly<Record<T, string>>): Option<T>[] {
  return (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }));
}

/** Las opciones de un filtro, con una primera opción «todos» (valor null) que no filtra. */
export function withAllOption<T extends string>(
  allLabel: string,
  labels: Readonly<Record<T, string>>,
): Option<T | null>[] {
  return [{ label: allLabel, value: null }, ...optionsOf(labels)];
}
