import type { components } from '../../core/api/schema';

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

/** Opciones para un p-select o p-selectbutton a partir de un mapa de etiquetas. */
export function optionsOf<T extends string>(
  labels: Readonly<Record<T, string>>,
): { label: string; value: T }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ label: labels[value], value }));
}
