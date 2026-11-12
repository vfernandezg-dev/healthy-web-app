
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { GrupoResponse } from '../../../shared/models/grupo-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { UnirseService } from '../../../core/services/unirse.service';
import { GrupoListComponent } from "./grupo-list/grupo-list.component";

@Component({
    selector: 'app-grupo',
    imports: [
    RouterLink,
    MatListModule,
    MatMenuModule,
    MatIconModule,
    GrupoListComponent
],
    templateUrl: './grupo.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './grupo.component.css'
})
export class GrupoComponent {
  grupo: GrupoResponse[] = [];
  filteredGrupo: GrupoResponse[] = [];
  clientId!: number; // Cliente autenticado

  puedeCrearGrupo: boolean = true; // Inicialmente se puede crear un grupo

  private grupoService = inject(GrupoService);
  private unirseService = inject(UnirseService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  ngOnInit(): void {
    this.clientId = this.authService.getClienteId(); // Obtener el ID del cliente autenticado
    this.loadGrupo();
  }

  grupos: string[] = [
    'nombre',
  ]

  loadGrupo(): void {
    this.grupoService.getAllGrupos().subscribe({
      next: (grupo) => {
        this.grupo = grupo;
        this.filteredGrupo = grupo;
        console.log(grupo);
      },
      error: (error) => {
        this.showSnackBar('Error al cargar los grupos');
      }
    })
  }

  // Unirse a un grupo
  joinGroup(groupId: number): void {
    this.unirseService.addClientToGroup(this.clientId, groupId).subscribe({
      next: (grupo) => {
        this.showSnackBar(`Te has unido al grupo: ${grupo.nombre}`);
        this.loadGrupo();
      },
      error: () => {
        this.showSnackBar('Error al unirte al grupo');
      }
    });
  }

  // Salir de un grupo
  leaveGroup(groupId: number): void {
    this.unirseService.removeClientFromGroup(this.clientId, groupId).subscribe({
      next: () => {
        this.showSnackBar('Has salido del grupo');
        this.loadGrupo();
      },
      error: () => {
        this.showSnackBar('Error al salir del grupo');
      }
    });
  }

  // Editar un grupo
  editGroup(groupId: number): void {
    this.router.navigate(['/edit', groupId]);
  }

  // Eliminar un grupo
  deleteGroup(groupId: number): void {
    const clienteId = this.authService.getClienteId();
    this.grupoService.eliminarGrupo(groupId, clienteId).subscribe({
      next: () => {
        this.showSnackBar('Grupo eliminado');
        this.loadGrupo();
      },
      error: () => {
        this.showSnackBar('Error al eliminar el grupo');
      }
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}