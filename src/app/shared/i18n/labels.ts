import type { components } from '@core/api/schema';
import type { Role } from '@core/auth/roles';

type Schemas = components['schemas'];

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

export const PAYMENT_STATUS_LABELS: Readonly<Record<Schemas['PaymentResponse']['status'], string>> =
  {
    CREATED: 'Pendiente',
    CAPTURED: 'Pagado',
    FAILED: 'Fallido',
    CANCELED: 'Cancelado',
  };

/** Severidad de p-tag para cada estado de pago. */
export const PAYMENT_STATUS_SEVERITY: Readonly<
  Record<Schemas['PaymentResponse']['status'], 'success' | 'warn' | 'danger' | 'secondary'>
> = {
  CREATED: 'warn',
  CAPTURED: 'success',
  FAILED: 'danger',
  CANCELED: 'secondary',
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

export const PUBLICATION_STATUS_SEVERITY: Readonly<
  Record<PublicationStatus, 'success' | 'warn' | 'secondary'>
> = {
  DRAFT: 'warn',
  PUBLISHED: 'success',
  ARCHIVED: 'secondary',
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

export const GOAL_STATUS_SEVERITY: Readonly<Record<GoalStatus, 'info' | 'success' | 'secondary'>> =
  {
    ACTIVE: 'info',
    COMPLETED: 'success',
    ABANDONED: 'secondary',
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

export const ROLE_SEVERITY: Readonly<Record<Role, 'info' | 'success' | 'warn'>> = {
  CLIENT: 'info',
  NUTRITIONIST: 'success',
  ADMIN: 'warn',
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

export const SUBSCRIPTION_STATUS_SEVERITY: Readonly<
  Record<SubscriptionStatus, 'success' | 'warn' | 'info' | 'secondary'>
> = {
  PENDING_PAYMENT: 'warn',
  ACTIVE: 'success',
  CANCELED: 'info',
  EXPIRED: 'secondary',
};

export type InvitationStatus = Schemas['InvitationResponse']['status'];

export const INVITATION_STATUS_LABELS: Readonly<Record<InvitationStatus, string>> = {
  PENDING: 'Pendiente',
  ACCEPTED: 'Aceptada',
  EXPIRED: 'Caducada',
  REVOKED: 'Revocada',
};

export const INVITATION_STATUS_SEVERITY: Readonly<
  Record<InvitationStatus, 'success' | 'warn' | 'secondary' | 'danger'>
> = {
  PENDING: 'warn',
  ACCEPTED: 'success',
  EXPIRED: 'secondary',
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

/** Opciones para un p-select o p-selectbutton a partir de un mapa de etiquetas. */
export function optionsOf<T extends string>(
  labels: Readonly<Record<T, string>>,
): { label: string; value: T }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }));
}
