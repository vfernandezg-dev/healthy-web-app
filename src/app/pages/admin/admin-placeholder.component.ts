import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

/**
 * Página provisional del rol ADMIN (antes acababa en una pantalla en blanco). El panel de administración llega en
 * la fase 3 del plan de modernización.
 */
@Component({
  selector: 'app-admin-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container py-5 text-center">
      <h1 class="h3 mb-3">Panel de administración</h1>
      <p class="text-muted mb-4">
        Hola, {{ auth.user()?.nombre }}. El panel de administración está en construcción.
      </p>
      <button type="button" class="btn btn-outline-secondary" (click)="auth.logout()">Cerrar sesión</button>
    </main>
  `,
})
export class AdminPlaceholderComponent {
  protected readonly auth = inject(AuthService);
}
