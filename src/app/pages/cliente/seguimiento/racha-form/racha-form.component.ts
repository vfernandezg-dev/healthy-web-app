import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../core/services/auth.service';
import { RachaService } from '../../../../core/services/racha.service';
import { RecompensaResponse } from '../../../../shared/models/recompensa-response.model';
import { RecompensaService } from '../../../../core/services/recompensa.service';

@Component({
    selector: 'app-racha-form',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule
    ],
    templateUrl: './racha-form.component.html',
    styleUrls: ['./racha-form.component.css']
})
export class RachaFormComponent implements OnInit {

  rachaForm!: FormGroup;
  recompensas: RecompensaResponse[] = [];

  private fb = inject(FormBuilder);
  private rachaService = inject(RachaService);
  private recompensaService = inject(RecompensaService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.rachaForm = this.fb.group({
      recompensaId: ['', Validators.required]
    });

    this.loadRecompensas();
  }

  loadRecompensas(): void {
    this.recompensaService.getAllRecompensas().subscribe({
      next: (recompensas) => {
        this.recompensas = recompensas;
      },
      error: (error) => {
        console.error(error);
        this.snackBar.open('Error al cargar las recompensas', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  onSubmit(): void {
    if (this.rachaForm.valid) {
      const clienteId = this.authService.getClienteId();
      const recompensaId = this.rachaForm.value.recompensaId;

      this.rachaService.addRecompensaToCliente(clienteId, recompensaId).subscribe({
        next: (response) => {
          this.snackBar.open('Te has unido a la recompensa exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/cliente/seguimiento']);
        },
        error: (error) => {
          console.error(error);
          this.snackBar.open('Error al unirse a la recompensa', 'Cerrar', {
            duration: 3000,
          });
        }
      });
    }
  }
}