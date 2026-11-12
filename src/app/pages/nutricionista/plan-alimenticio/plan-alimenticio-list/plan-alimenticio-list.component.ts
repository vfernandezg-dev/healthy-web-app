import { Component, inject } from '@angular/core';
import { PlanAlimenticioResponse } from '../../../../shared/models/plan-alimenticio-response.model';
import { PlanAlimenticioService } from '../../../../core/services/plan-alimenticio.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../core/services/auth.service';
import { NutricionistaLayoutComponent } from '../../nutricionista-layout/nutricionista-layout.component';
import { FormatPlanObjetivoPipe } from '../../../../core/pipes/format-plan-objetivo.pipe';
import { ComidaService } from '../../../../core/services/comida.service';

@Component({
    selector: 'app-plan-alimenticio-list',
    imports: [
    MatTableModule,
    MatCardModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    FormatPlanObjetivoPipe
],
    templateUrl: './plan-alimenticio-list.component.html',
    styleUrl: './plan-alimenticio-list.component.css'
})
export class PlanAlimenticioListComponent {
  planAlimenticio: PlanAlimenticioResponse[] = [];
  filteredPlanAlimenticio: PlanAlimenticioResponse[] = [];

  private planAlimenticioService = inject(PlanAlimenticioService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);


  ngOnInit(): void {
    this.loadPlanAlimenticio();
  }

  loadPlanAlimenticio(): void {
    const userId = this.authService.getNutricionistaId();
    this.planAlimenticioService.getPlanAlimenticio(userId).subscribe({
      next: (planAlimenticio) => {
        this.planAlimenticio = planAlimenticio;
        this.filteredPlanAlimenticio = planAlimenticio;
        this.showSnackBar('Plan Alimenticio cargado con éxito');
      },
      error: (error) => {
        console.error('Error loading plan alimenticio', error);
        this.showSnackBar('Error al cargar el plan alimenticio');
      }
    });
    
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

  createNewPlanAlimenticio(): void {
    this.router.navigate(['/nutricionista/plan-alimenticio/create']);
  }

  editPlanAlimenticio(planId: number): void {
    this.router.navigate(['/nutricionista/plan-alimenticio/edit', planId]);
  }


  anadirComida(planId: number): void {
    this.router.navigate([`/nutricionista/plan-alimenticio/comida/${planId}/agregar`]);
  }

  calcularCaloriasTotales(planId: number): number {
    let totalCalorias = 0;
    this.planAlimenticioService.getPlanAlimenticio(planId).subscribe({
      next: (comidas) => {
        totalCalorias = comidas.reduce((sum, comida) => sum + comida.caloriasTotales, 0);
      },
      error: (error) => {
        console.error('Error calculating total calories', error);
        this.showSnackBar('Error al calcular las calorías totales');
      }
    });
    return totalCalorias;
  }
  

  deletePlanAlimenticio(planId: number): void {

    const userId = this.authService.getNutricionistaId();

    this.planAlimenticioService.deletePlanAlimenticio(planId, userId).subscribe({
      next: () => {
        this.loadPlanAlimenticio();
        this.showSnackBar('Plan Alimenticio eliminado con éxito');
      },
      error: (error) => {
        console.error('Error deleting plan alimenticio', error);
        this.showSnackBar('Error al eliminar el plan alimenticio');
      }
    });
  }

}
