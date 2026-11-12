import type { Routes } from '@angular/router';

/** /client/subscription. Las rutas de vuelta de PayPal las construye la API (no cambiar sin cambiarla). */
export const SUBSCRIPTION_ROUTES: Routes = [
  {
    path: '',
    title: 'Suscripción',
    loadComponent: () => import('./subscription-page').then((m) => m.SubscriptionPage),
  },
  {
    path: 'checkout/return',
    title: 'Confirmando el pago',
    loadComponent: () => import('./checkout-return').then((m) => m.CheckoutReturn),
  },
  {
    path: 'checkout/cancel',
    title: 'Pago cancelado',
    loadComponent: () => import('./checkout-cancel').then((m) => m.CheckoutCancel),
  },
];
