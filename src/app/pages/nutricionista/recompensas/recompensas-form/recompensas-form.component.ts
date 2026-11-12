import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RecompensaService } from '../../../../core/services/recompensa.service';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PlanAlimenticioListComponent } from '../../plan-alimenticio/plan-alimenticio-list/plan-alimenticio-list.component';
import { ContenidoResponse } from '../../../../shared/models/contenido-response.model';
import { PlanAlimenticioService } from '../../../../core/services/plan-alimenticio.service';
import { ContenidoService } from '../../../../core/services/contenido.service';

@Component({
    selector: 'app-recompensas-form',
    imports: [
        CommonModule,
        MatInputModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatOptionModule,
        MatSelectModule,
    ],
    templateUrl: './recompensas-form.component.html',
    styleUrl: './recompensas-form.component.css'
})
export class RecompensasFormComponent implements OnInit {
  recompensaForm!: FormGroup;
  titulo!: string;
  textoBoton!: string;
  isEditMode = false;
  recompensaId!: number;

  contenidoOptions: { id: number; titulo: string }[] = [];
  planAlimenticioOptions: { id: number; planObjetivo: string }[] = [];

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private recompensaService = inject(RecompensaService);
  private planAlimenticioService = inject(PlanAlimenticioService);
  private contenidoService = inject(ContenidoService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.recompensaId = Number(this.route.snapshot.paramMap.get('id'));

    this.isEditMode = !!this.recompensaId;
    this.titulo = this.isEditMode ? 'Editar Recompensa' : 'Añadir Recompensa';
    this.textoBoton = this.isEditMode ? 'Actualizar Recompensa' : 'Añadir Recompensa';

    // Crear el formulario con validación
    this.recompensaForm = this.fb.group(
      {
        nombre: [''],
        descripcion: [''],
        diasRequeridos: ['', [Validators.required, Validators.min(1)]],
        nutricionistaId: [this.authService.getNutricionistaId()],
        contenidoId: [null],
        planAlimenticioId: [null],
      },
      { validators: this.validateSingleSelection }
    );

    this.loadContenidoOptions();
    this.loadPlanAlimenticioOptions();

    if (this.isEditMode) {
      this.loadRecompensa();
    }
  }

  private loadContenidoOptions(): void {
    this.contenidoService.getAllContenidos().subscribe({
      next: (contenidos) => (this.contenidoOptions = contenidos),
      error: () => this.showSnackBar('Error al cargar los contenidos disponibles')
    });
  }

  private loadPlanAlimenticioOptions(): void {
    this.planAlimenticioService.getPlanAlimenticio(Number(this.authService.getNutricionistaId())).subscribe({
      next: (planes) => (this.planAlimenticioOptions = planes),
      error: () => this.showSnackBar('Error al cargar los planes alimenticios disponibles')
    });
  }

  private loadRecompensa(): void {
    this.recompensaService.getRecompensaById(this.recompensaId).subscribe({
      next: (recompensa) => this.recompensaForm.patchValue(recompensa),
      error: () => this.showSnackBar('Error al cargar la recompensa')
    });
  }

  private validateSingleSelection(group: FormGroup): { [key: string]: boolean } | null {
    const contenidoId = group.get('contenidoId')?.value;
    const planAlimenticioId = group.get('planAlimenticioId')?.value;

    if ((contenidoId && planAlimenticioId) || (!contenidoId && !planAlimenticioId)) {
      return { invalidSelection: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.recompensaForm.invalid) {
      this.showSnackBar('Por favor, corrija los errores en el formulario');
      return;
    }

    const formData = { ...this.recompensaForm.value };
    if (!formData.contenidoId) {
      delete formData.contenidoId;
    }
    if (!formData.planAlimenticioId) {
      delete formData.planAlimenticioId;
    }

    if (this.isEditMode) {
      this.recompensaService.updateRecompensa(this.recompensaId, formData).subscribe({
        next: () => {
          this.showSnackBar('Recompensa actualizada correctamente');
          this.router.navigate(['/nutricionista/recompensa']);
        },
        error: () => this.showSnackBar('Error al actualizar la recompensa')
      });
    } else {
      this.recompensaService.createRecompensa(formData).subscribe({
        next: () => {
          this.showSnackBar('Recompensa añadida correctamente');
          this.router.navigate(['/nutricionista/recompensa']);
        },
        error: () => this.showSnackBar('Error al añadir la recompensa')
      });
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}
