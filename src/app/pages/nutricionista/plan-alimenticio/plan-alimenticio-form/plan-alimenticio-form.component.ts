import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PlanObjetivo } from '../../../../shared/models/plan-alimenticio-create-update-request.model';
import { PlanAlimenticioService } from '../../../../core/services/plan-alimenticio.service';
import { MatOptionModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { PlanAlimenticioResponse } from '../../../../shared/models/plan-alimenticio-response.model';

@Component({
    selector: 'app-plan-alimenticio-form-create-update',
    imports: [
        MatInputModule,
        MatCardModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatOptionModule,
        MatRadioModule,
        MatSelectModule
    ],
    templateUrl: './plan-alimenticio-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./plan-alimenticio-form.component.css']
})
export class PlanAlimenticioFormComponent {
  planAlimenticioForm: FormGroup;
  objetivos = Object.values(PlanObjetivo);
  isEditMode = false; // Para saber si estamos en modo edición

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private planAlimenticioService = inject(PlanAlimenticioService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.planAlimenticioForm = this.fb.group({
      id: [null],
      planObjetivo: ['', Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      duracionDias: ['', [Validators.required, Validators.min(1)]],
      esGratis: [null, Validators.required],
      nutricionistaId: [this.authService.getNutricionistaId()],
    });
  }

  ngOnInit(): void {
    const planId = this.route.snapshot.paramMap.get('id'); // Obtener el ID de la ruta
    
    if (planId) {
      this.isEditMode = true; // Estamos en modo edición
      this.loadPlanAlimenticio(Number(planId)); // Cargar el plan alimenticio para editar
    } else {
      this.isEditMode = false; // Estamos en modo creación
    }
  }

  controlHasError(controlName: string, errorName: string): boolean {
    return this.planAlimenticioForm.controls[controlName].hasError(errorName);
  }

  loadPlanAlimenticio(planId: number): void {
    const userId = this.authService.getNutricionistaId();

    this.planAlimenticioService.getPlanAlimenticioById(planId, userId).subscribe({
      next: (planAlimenticio) => {
        if (planAlimenticio) {
          this.planAlimenticioForm.patchValue(planAlimenticio); // Cargar los datos del plan al formulario
        } else {
          this.showSnackBar('No se encontró el plan alimenticio');
          this.router.navigate(['/nutricionista/plan-alimenticio/list']);
        }
      },
      error: () => {
        this.showSnackBar('Error al cargar el plan alimenticio');
      },
    });
  }

  onSubmit(): void {
    if (this.planAlimenticioForm.valid) {
      const planData = this.planAlimenticioForm.value;

      if (this.isEditMode) {
        const planId = planData.id;
        this.planAlimenticioService.updatePlanAlimenticio(planId, planData, this.authService.getNutricionistaId()).subscribe({
          next: () => {
            this.showSnackBar('Plan alimenticio actualizado correctamente');
            this.router.navigate(['/nutricionista/plan-alimenticio/list']);
          },
          error: () => {
            this.showSnackBar('Error al actualizar el plan alimenticio');
          },
        });
      } else {
        this.planAlimenticioService.createPlanAlimenticio(planData).subscribe({
          next: () => {
            this.showSnackBar('Plan alimenticio creado correctamente');
            this.router.navigate(['/nutricionista/plan-alimenticio/list']);
          },
          error: () => {
            this.showSnackBar('Error al crear el plan alimenticio');
          },
        });
      }
    } else {
      this.showSnackBar('Por favor, complete correctamente los campos.');
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}
