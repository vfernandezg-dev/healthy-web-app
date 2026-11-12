import type { components } from '../../src/app/core/api/schema';
import { type Role, sessionFor } from './api';

type S = components['schemas'];

/** Página de un listado paginado de la API. */
export function paged<T>(content: T[], size = 20) {
  return {
    content,
    page: { size, number: 0, totalElements: content.length, totalPages: content.length ? 1 : 0 },
  };
}

const CARLOS: S['PersonResponse'] = {
  id: sessionFor('NUTRITIONIST').user.id,
  name: 'Carlos García',
};
const MARIA_ID = sessionFor('CLIENT').user.id;

export const PLAN: S['MealPlanSummaryResponse'] = {
  id: 'plan-1',
  title: 'Semana ligera',
  description: 'Siete días de comidas sencillas y equilibradas.',
  goal: 'WEIGHT_LOSS',
  durationDays: 7,
  averageDailyCalories: 1800,
  requiredTier: 'BASIC',
  locked: false,
  status: 'PUBLISHED',
  publishedAt: '2026-10-01T10:00:00Z',
  author: CARLOS,
};

const PLAN_DETAIL: S['MealPlanDetailResponse'] = {
  plan: PLAN,
  status: 'PUBLISHED',
  meals: [
    {
      id: 'meal-1',
      dayNumber: 1,
      position: 0,
      category: 'BREAKFAST',
      name: 'Avena con fruta',
      description: 'Copos de avena, leche y plátano.',
      calories: 350,
    },
  ],
};

export const CONTENT: S['ContentSummaryResponse'] = {
  id: 'content-1',
  slug: 'guia-de-la-compra',
  title: 'Guía de la compra',
  summary: 'Cómo llenar la cesta con cabeza.',
  type: 'ARTICLE',
  category: 'NUTRITION',
  requiredTier: 'BASIC',
  locked: false,
  hasFile: false,
  coverPath: null,
  status: 'PUBLISHED',
  publishedAt: '2026-10-05T10:00:00Z',
  author: CARLOS,
};

export const GROUP: S['GroupResponse'] = {
  id: 'group-1',
  name: 'Recetas saludables',
  description: 'Comparte tus recetas favoritas.',
  visibility: 'PUBLIC',
  members: 2,
  membership: { role: 'MEMBER', status: 'ACTIVE' },
  createdAt: '2026-10-01T10:00:00Z',
};

const GOAL: S['GoalResponse'] = {
  id: 'goal-1',
  title: 'Bajar a 65 kg',
  description: null,
  status: 'ACTIVE',
  targetWeightKg: 65,
  startedOn: '2026-10-01',
  createdAt: '2026-10-01T10:00:00Z',
  completedAt: null,
};

const REWARD: S['RewardResponse'] = {
  id: 'reward-1',
  title: 'Una semana constante',
  description: 'Registra tus hábitos siete días seguidos.',
  requiredStreakDays: 7,
  active: true,
  target: { id: PLAN.id, title: PLAN.title, type: 'MEAL_PLAN' },
  streak: null,
};

const SUBSCRIPTION: S['CurrentSubscriptionResponse'] = {
  tier: 'BASIC',
  status: null,
  renews: false,
  currentPeriodEnd: null,
  subscriptionId: null,
};

const ME: Record<Role, S['MeResponse']> = {
  CLIENT: {
    id: MARIA_ID,
    email: 'maria.lopez@healthybites.com',
    firstName: 'María',
    lastName: 'López',
    role: 'CLIENT',
    client: { sex: 'FEMALE', birthDate: '1995-04-12', heightCm: 165, weightKg: 68 },
    nutritionist: null,
  },
  NUTRITIONIST: {
    id: CARLOS.id,
    email: 'carlos.garcia@healthybites.com',
    firstName: 'Carlos',
    lastName: 'García',
    role: 'NUTRITIONIST',
    client: null,
    nutritionist: { bio: 'Nutricionista deportivo.' },
  },
  ADMIN: {
    id: sessionFor('ADMIN').user.id,
    email: 'admin@healthybites.com',
    firstName: 'Admin',
    lastName: 'Healthy Bites',
    role: 'ADMIN',
    client: null,
    nutritionist: null,
  },
};

/**
 * Respuestas mínimas pero válidas para todas las lecturas de la API (y las dos escrituras que hacen algunas páginas
 * al abrirse), para recorrer todas las rutas. Cada clave vale para la ruta exacta y con parámetros (`?…`).
 */
export function readsFor(role: Role): Record<string, unknown> {
  return {
    '/me': ME[role],
    // Cliente
    '/me/goals': [GOAL],
    '/me/goals/goal-1/weight-entries': [],
    '/me/goals/goal-1/status-history': [],
    '/me/goals/goal-1/recommendation': {
      heightCm: 165,
      targetWeightKg: 65,
      targetBmi: 23.9,
      healthyMinKg: 50.4,
      healthyMaxKg: 67.8,
      targetInHealthyRange: true,
      currentWeightKg: null,
      currentBmi: null,
      weeklyChangeKg: null,
      estimatedWeeks: null,
      message: 'Tu objetivo está dentro del rango saludable para tu altura.',
    } satisfies S['RecommendationResponse'],
    '/me/habit-logs': [],
    '/me/streaks': [],
    '/rewards': [REWARD],
    '/me/subscription': SUBSCRIPTION,
    '/me/subscription/checkout/capture': {
      ...SUBSCRIPTION,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      renews: true,
      currentPeriodEnd: '2026-12-12T10:00:00Z',
      subscriptionId: 'sub-1',
    } satisfies S['CurrentSubscriptionResponse'],
    '/subscription-plans': [
      {
        id: 'tier-premium',
        tier: 'PREMIUM',
        name: 'Premium',
        description: 'Planes y contenidos Premium.',
        price: { amount: '5.99', currency: 'USD' },
        periodDays: 30,
      },
    ] satisfies S['PlanResponse'][],
    '/me/payments': paged([]),
    '/meal-plans': paged([PLAN]),
    '/meal-plans/plan-1': PLAN_DETAIL,
    '/me/meal-plan-enrollments': [],
    '/content-items': paged([CONTENT]),
    [`/content-items/${CONTENT.slug}`]: {
      item: CONTENT,
      body: 'Haz una lista antes de salir y compra de temporada.',
    } satisfies S['ContentDetailResponse'],
    '/me/content-unlocks': [],
    // Comunidad
    '/groups': paged([GROUP], 12),
    '/groups/group-1': GROUP,
    '/groups/group-1/posts': paged([], 10),
    '/groups/group-1/members': [
      { person: CARLOS, role: 'OWNER', status: 'ACTIVE', since: '2026-10-01T10:00:00Z' },
    ] satisfies S['MemberResponse'][],
    // Nutricionista
    '/nutritionist/meal-plans': paged([PLAN], 100),
    '/nutritionist/meal-plans/plan-1': PLAN_DETAIL,
    '/nutritionist/content-items': paged([CONTENT], 100),
    '/nutritionist/content-items/content-1': {
      item: CONTENT,
      body: 'Texto del artículo.',
      coverMediaId: null,
      fileMediaId: null,
    } satisfies S['EditableContentResponse'],
    '/nutritionist/rewards': [REWARD],
    '/nutritionist/clients': [],
    // Administración
    '/admin/users/summary': {
      total: 3,
      active: 3,
      deactivated: 0,
      newLast30Days: 1,
      byRole: { CLIENT: 1, NUTRITIONIST: 1, ADMIN: 1 },
    } satisfies S['UserSummaryResponse'],
    '/admin/users': paged([]),
    '/admin/nutritionist-invitations': paged([]),
    '/admin/moderation/reports': paged([]),
    '/admin/billing/summary': {
      activeByTier: {},
      monthlyRecurringRevenue: [],
      revenueLast30Days: [],
      paymentsLast30Days: 0,
    } satisfies S['BillingSummaryResponse'],
    '/admin/subscriptions': paged([]),
    '/admin/payments': paged([]),
    // Públicas
    '/auth/invitations/preview': {
      email: 'elena@correo.com',
      firstName: 'Elena',
      lastName: 'Gómez',
    } satisfies S['InvitationPreviewResponse'],
  };
}
