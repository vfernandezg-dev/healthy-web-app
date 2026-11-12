import type { Routes } from '@angular/router';

/** /client/meal-plans: catálogo y detalle. */
export const CLIENT_MEAL_PLAN_ROUTES: Routes = [
  {
    path: '',
    title: 'Planes alimenticios',
    loadComponent: () => import('./client/meal-plan-catalog').then((m) => m.MealPlanCatalog),
  },
  {
    path: ':id',
    title: 'Plan alimenticio',
    loadComponent: () => import('./client/meal-plan-detail').then((m) => m.MealPlanDetail),
  },
];

/** /nutritionist/meal-plans: sus planes, alta y editor. */
export const NUTRITIONIST_MEAL_PLAN_ROUTES: Routes = [
  {
    path: '',
    title: 'Tus planes',
    loadComponent: () =>
      import('./nutritionist/nutritionist-plans').then((m) => m.NutritionistPlans),
  },
  {
    path: 'new',
    title: 'Nuevo plan',
    loadComponent: () => import('./nutritionist/plan-new').then((m) => m.PlanNew),
  },
  {
    path: ':id',
    title: 'Editar el plan',
    loadComponent: () => import('./nutritionist/plan-editor').then((m) => m.PlanEditor),
  },
];
