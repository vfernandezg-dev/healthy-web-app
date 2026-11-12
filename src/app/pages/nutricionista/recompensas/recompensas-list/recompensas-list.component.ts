
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FormatPlanObjetivoPipe } from '../../../../core/pipes/format-plan-objetivo.pipe';
import { RecompensaResponse } from '../../../../shared/models/recompensa-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RecompensaService } from '../../../../core/services/recompensa.service';

@Component({
    selector: 'app-recompensas-list',
    imports: [
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    FormatPlanObjetivoPipe
],
    templateUrl: './recompensas-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './recompensas-list.component.css'
})
export class RecompensasListComponent {
  recompensa: RecompensaResponse[] = [];
  filteredRecompensas: RecompensaResponse[] = [];

  contenidoRecompensas: RecompensaResponse[] = [];
  planAlimenticioRecompensas: RecompensaResponse[] = [];

  private recompensaService = inject(RecompensaService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  displayedColumnsContenido: string[] = [
    'id',
    'nombre',
    'descripcion',
    'diasRequeridos',
    'contenidoTitulo',
    'acciones',
  ];

  displayedColumnsPlanAlimenticio: string[] = [
    'id',
    'nombre',
    'descripcion',
    'diasRequeridos',
    'planAlimenticioTitulo',
    'acciones',
  ];

  ngOnInit(): void {
    this.loadRecompensa();
  }

  loadRecompensa(): void {
    this.recompensaService.getAllRecompensas().subscribe({
      next: (recompensa) => {
        this.contenidoRecompensas = recompensa.filter(r => r.contenidoTitulo);
        this.planAlimenticioRecompensas = recompensa.filter(r => r.planAlimenticioTitulo);
      },
      error: (error) => {
        this.showSnackBar('Error al cargar las recompensas');
      }
    })
  }

  createNewRecompensa(): void {
    this.router.navigate(['/nutricionista/recompensa/create']);
  }

  editarRecompensaNavigate(recompensaId: number): void {
    this.router.navigate([`/nutricionista/recompensa/edit/${recompensaId}`]);
  }

  deleteRecompensa(recompensaId: number): void {
    this.recompensaService.deleteRecompensa(recompensaId).subscribe({
      next: () => {
        this.loadRecompensa();
        this.showSnackBar('Recompensa eliminada');
      },
      error: () => {
        this.showSnackBar('Error al eliminar la recompensa');
      }
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}
