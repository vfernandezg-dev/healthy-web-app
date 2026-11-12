import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { HabitoResponse } from '../../../../shared/models/habito-response.model';
import { HabitoService } from '../../../../core/services/habito.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';

@Component({
    selector: 'app-habitos-list',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatTableModule
    ],
    templateUrl: './habitos-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './habitos-list.component.css'
})
export class HabitosListComponent {
  habito: HabitoResponse[] = [];
  filteredHabito: HabitoResponse[] = [];

  private habitoService = inject(HabitoService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  displayedColumns: string[] = [
    'id',
    'nombre',
    'fechaRegistro',
    'hidratacion',
    'alimentacion',
    'ejercicio',
    'calidadDeSueno',
    'acciones'
  ]

  ngOnInit(): void {
    this.loadHabitos();
  }

  // Cargo los hábitos del cliente
  loadHabitos(): void {
    const clienteId = this.authService.getClienteId();
  
    this.habitoService.getAllHabitosByClienteId(clienteId).subscribe({
      next: (habito) => {
        this.habito = habito;
        this.filteredHabito = habito;
        console.log(habito);
      },
      error: (error) => {
        console.error(error);
        this.showSnackBar('Error al cargar los hábitos');
      }
    });
  }

  crearHabito(): void {
    this.router.navigate(['/cliente/seguimiento/habitos/create']);
  }

  editarHabito(habitoId: number): void {
    this.router.navigate([`/cliente/seguimiento/habitos/update/${habitoId}`]);
  }

  eliminarHabito(habitoId: number): void {
    this.habitoService.eliminarHabito(habitoId).subscribe({
      next: () => {
        this.loadHabitos();
        this.showSnackBar('Hábito eliminado con éxito');
      },
      error: (error) => {
        console.error('Error deleting habit', error);
        this.showSnackBar('Error al eliminar el hábito');
      }
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}
