import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { GestionarPerfilService } from '../../../../core/services/gestionar-perfil.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatInputModule } from '@angular/material/input';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ClienteResponse } from '../../../../shared/models/cliente-response.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: 'app-gestionar-clientes-list',
    imports: [
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    FormsModule
],
    templateUrl: './gestionar-clientes-list.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './gestionar-clientes-list.component.css'
})
export class GestionarClientesListComponent {

  clientes: ClienteResponse[] = [];
  filteredClientes: ClienteResponse[] = [];

  private gestionarPerfilService = inject(GestionarPerfilService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes(): void {
    this.gestionarPerfilService.getAllClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.filteredClientes = clientes;
        this.showSnackBar('Clientes cargados con éxito');
      },
      error: (error) => {
        console.error('Error loading clientes', error);
        this.showSnackBar('Error al cargar los clientes');
      }
    })
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}
