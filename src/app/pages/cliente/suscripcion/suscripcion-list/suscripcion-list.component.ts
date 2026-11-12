import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { CheckoutService, isPayPalUrl } from '../../../../core/services/checkout.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SuscripcionCreateRequest, TipoSuscripcion } from '../../../../shared/models/suscripcion-create-request.model';

@Component({
    selector: 'app-suscripcion-list',
    imports: [ReactiveFormsModule],
    templateUrl: './suscripcion-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./suscripcion-list.component.css']
})
export class SuscripcionListComponent implements OnInit {
  loading = false;
  /** Aviso para el usuario (vuelta de PayPal, errores del pago). */
  message: string | null = null;

  subscriptionForm: FormGroup;

  // Enum de tipos de suscripción para usar en el formulario
  tiposSuscripcion = Object.values(TipoSuscripcion);

  private suscripcionService = inject(SuscripcionService);
  private checkoutService = inject(CheckoutService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  constructor() {
    this.subscriptionForm = this.fb.group({
      tipoSuscripcion: ['', Validators.required], // Selección obligatoria
    });
  }

  ngOnInit(): void {
    // Vuelta de PayPal: la API decide estas URLs (aprobado: ?token&PayerID; cancelado: ?checkout=cancelado).
    const params = this.route.snapshot.queryParamMap;
    if (params.get('checkout') === 'cancelado') {
      this.message = 'Pago cancelado. No se ha realizado ningún cargo.';
      this.clearQueryParams();
      return;
    }
    const orderId = params.get('token');
    if (orderId && params.get('PayerID')) {
      this.capture(orderId);
    }
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid) {
      const tipoSuscripcion: TipoSuscripcion = this.subscriptionForm.value.tipoSuscripcion;
      this.proceedToCheckout(tipoSuscripcion);
    }
  }

  proceedToCheckout(tipoSuscripcion: TipoSuscripcion): void {
    const suscripcionRequest: SuscripcionCreateRequest = {
      usuarioId: Number(this.authService.getUser()?.id),
      tipoSuscripcion
    };

    this.loading = true;
    this.message = null;
    this.suscripcionService.crearSuscripcion(suscripcionRequest).subscribe({
      next: suscripcion => {
        if (suscripcion.tipoSuscripcion === TipoSuscripcion.BASICO) {
          this.loading = false;
          this.router.navigate(['/cliente/perfil']); // El plan básico no necesita pago
          return;
        }
        this.checkoutService.createPaypalOrder(suscripcion.id).subscribe({
          next: response => {
            if (isPayPalUrl(response.paypalUrl)) {
              window.location.href = response.paypalUrl; // Redirigir a PayPal
            } else {
              this.fail('No se pudo iniciar el pago. Inténtalo más tarde.');
            }
          },
          error: (error: HttpErrorResponse) => this.fail(this.errorMessage(error)),
        });
      },
      error: (error: HttpErrorResponse) => this.fail(this.errorMessage(error)),
    });
  }

  private capture(orderId: string): void {
    this.loading = true;
    this.checkoutService.capturePaypalOrder(orderId).subscribe({
      next: response => {
        this.loading = false;
        if (response.completed) {
          this.router.navigate(['/cliente/perfil']);
        } else {
          this.fail('PayPal no completó el pago. No se ha realizado ningún cargo.');
        }
      },
      error: (error: HttpErrorResponse) => this.fail(this.errorMessage(error)),
    });
    this.clearQueryParams();
  }

  private fail(message: string): void {
    this.loading = false;
    this.message = message;
  }

  private errorMessage(error: HttpErrorResponse): string {
    return error.error?.message ?? 'No se pudo completar el pago. Inténtalo más tarde.';
  }

  /** Quita de la barra de direcciones el id del pedido que añade PayPal. */
  private clearQueryParams(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }
}
