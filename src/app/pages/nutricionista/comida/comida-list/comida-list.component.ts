import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ComidaResponse } from '../../../../shared/models/comida-response.model';
import { ComidaService } from '../../../../core/services/comida.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

import { PlanAlimenticioService } from '../../../../core/services/plan-alimenticio.service';
import { PlanAlimenticioResponse } from '../../../../shared/models/plan-alimenticio-response.model';
import { FormatPlanObjetivoPipe } from '../../../../core/pipes/format-plan-objetivo.pipe';
import { FormatCategoriaComida } from '../../../../core/pipes/format-categoria-comida.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-comida-list',
    imports: [
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    FormatPlanObjetivoPipe,
    FormatCategoriaComida
],
    templateUrl: './comida-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./comida-list.component.css']
})
export class ComidaListComponent {
  comida: ComidaResponse[] = [];
  filteredComidas: ComidaResponse[] = [];
  
  selectedPlanId: number | null = null;
  uniquePlans: { planAlimenticioId: number;}[] = [];


  private comidaService = inject(ComidaService);
  private snackBar = inject(MatSnackBar);
  private planId = inject(PlanAlimenticioService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private planAlimenticioService = inject(PlanAlimenticioService)
  
  displayedColumns: string[] =[
    'id',
    'nombreComida',
    'calorias',
    'categoria',
    'nombrePlanAlimenticio',
    'acciones'
  ]

  ngOnInit(): void {
    this.loadComida();
  }

  loadComida(): void {
    const userId = this.authService.getNutricionistaId();
  
    this.comidaService.getAllByNutricionistaId(userId).subscribe({
      next: (comida) => {
        this.comida = comida;
        this.filteredComidas = comida; // Inicializa el filtro con todos los datos.
        this.extractUniquePlans(); // Extrae los planes únicos.
        this.showSnackBar('Comida cargada con éxito');
      },
      error: (error) => {
        console.error('Error loading comida', error);
        this.showSnackBar('Error al cargar la comida');
      }
    });
  }  

  deleteComida(planId: number, comidaId: number): void {
    this.comidaService.deleteComida(planId, comidaId).subscribe({
      next: () => {
        this.loadComida();
        this.showSnackBar('Comida eliminada con éxito');
      },
      error: (error) => {
        console.error('Error deleting comida', error);
        this.showSnackBar('Error al eliminar la comida');
      }
    });
  }

  editarComidaNavigate(planId: number, comidaId: number): void {
    this.router.navigate([`/nutricionista/plan-alimenticio/comida/${planId}/editar/${comidaId}`]);
  }

  private extractUniquePlans(): void {
    const seen = new Set<number>();
    this.uniquePlans = this.comida
      .filter((comida) => {
        if (seen.has(comida.planAlimenticioId)) {
          return false;
        }
        seen.add(comida.planAlimenticioId);
        return true;
      })
      .map((comida) => ({
        planAlimenticioId: comida.planAlimenticioId,
        nombrePlanAlimenticio: comida.nombrePlanAlimenticio,
      }));
  }
  
  filterComidas(): void {
    if (this.selectedPlanId === null) {
      // Si no hay un plan seleccionado, muestra todas las comidas.
      this.filteredComidas = this.comida;
    } else {
      // Filtra las comidas según el plan seleccionado.
      this.filteredComidas = this.comida.filter(
        (comida) => comida.planAlimenticioId === this.selectedPlanId
      );
    }
  }
  

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

}
