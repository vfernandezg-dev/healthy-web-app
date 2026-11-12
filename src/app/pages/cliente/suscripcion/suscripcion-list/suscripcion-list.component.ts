import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, ActivatedRoute } from '@angular/router';
import { SuscripcionService } from '../../../../core/services/suscripcion.service';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { AuthService } from '../../../../core/services/auth.service';
import { SuscripcionCreateRequest, TipoSuscripcion } from '../../../../shared/models/suscripcion-create-request.model';
import { SuscripcionResponse } from '../../../../shared/models/suscripcion-response.model';

@Component({
    selector: 'app-suscripcion-list',
    imports: [ReactiveFormsModule],
    templateUrl: './suscripcion-list.component.html',
    styleUrls: ['./suscripcion-list.component.css']
})
export class SuscripcionListComponent implements OnInit {
  total: number = 0;
  loading = false;
  clienteId!: number;
  
  subscriptionForm: FormGroup;

  filteredSuscripciones: SuscripcionResponse[] = [];
  suscripciones: SuscripcionResponse[] = [];

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
    this.clienteId = Number(this.authService.getUser()?.id); // Obtén el ID del cliente autenticado

    // Manejo del retorno de PayPal
    const token = this.route.snapshot.queryParamMap.get('token');
    const payerId = this.route.snapshot.queryParamMap.get('PayerID');
    if (token && payerId) {
      this.loading = true;
      this.checkoutService.capturePaypalOrder(token).subscribe(response => {
        this.loading = false;
        if (response.completed) {
          this.router.navigate(['/cliente/perfil']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.subscriptionForm.valid) {
      const tipoSuscripcion: TipoSuscripcion = this.subscriptionForm.value.tipoSuscripcion;
      this.proceedToCheckout(tipoSuscripcion);
    }
  }

  cancelarSuscripcion(suscripcionId: number): void {
    if (confirm('¿Estás seguro de que deseas cancelar esta suscripción?')) {
      this.loading = true;
      this.suscripcionService.eliminarSuscripcion(suscripcionId).subscribe({
        next: () => {
          this.loading = false;
          alert('La suscripción ha sido cancelada exitosamente.');
          // Actualizar la lista de suscripciones
          this.suscripciones = this.suscripciones.filter(s => s.id !== suscripcionId);
        },
        error: (err) => {
          this.loading = false;
          console.error(err);
          alert('Hubo un error al cancelar la suscripción: ' + err.error?.message || 'Error desconocido.');
        },
      });
    }
  }
  

  proceedToCheckout(tipoSuscripcion: TipoSuscripcion): void {
    const suscripcionRequest: SuscripcionCreateRequest = {
      usuarioId: this.clienteId,
      tipoSuscripcion
    };

    this.loading = true;
    this.suscripcionService.crearSuscripcion(suscripcionRequest).subscribe(suscripcion => {
      this.loading = false;
      if (suscripcion.tipoSuscripcion === TipoSuscripcion.BASICO) {
        this.router.navigate(['/cliente/perfil']); // Redirigir directamente
      } else {
        this.checkoutService.createPaypalOrder(suscripcion.id).subscribe(response => {
          window.location.href = response.paypalUrl; // Redirigir a PayPal
        });
      }
    });
  }
}
