import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/** 404 de la aplicación (antes, una URL desconocida rompía la navegación). */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="container py-5 text-center">
      <h1 class="display-6 mb-3">Página no encontrada</h1>
      <p class="text-muted mb-4">La dirección que buscas no existe o ya no está disponible.</p>
      <a class="btn btn-primary" [routerLink]="auth.homeUrl()">Volver al inicio</a>
    </main>
  `,
})
export class NotFoundComponent {
  protected readonly auth = inject(AuthService);
}
