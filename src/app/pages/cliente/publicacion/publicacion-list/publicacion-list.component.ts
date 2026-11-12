import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PublicacionService } from '../../../../core/services/publicacion.service';
import { PublicacionResponse } from '../../../../shared/models/publicacion-response.model';

import { ApiImgPipe } from '../../../../core/pipes/api-img.pipe';
import { ComentarioResponse } from '../../../../shared/models/comentario-response.model';
import { ComentarioService } from '../../../../core/services/comentario.service';
import { ComentarioRequest } from '../../../../shared/models/comentario-request.model';
import { FormsModule } from '@angular/forms';
import { GrupoResponse } from '../../../../shared/models/grupo-response.model';
import { GrupoService } from '../../../../core/services/grupo.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-publicacion-list',
    imports: [
    MatCardModule,
    MatButtonModule,
    ApiImgPipe,
    FormsModule,
    MatMenuModule,
    MatIconModule
],
    templateUrl: './publicacion-list.component.html',
    styleUrl: './publicacion-list.component.css'
})
export class PublicacionListComponent {
  publicaciones: PublicacionResponse[] = [];
  filteredPublicaciones: PublicacionResponse[] = [];

  grupo: GrupoResponse[] = [];
  filteredGrupo: GrupoResponse[] = [];
  grupoNombre: string | null = null; // Propiedad para almacenar el nombre del grupo seleccionado

  selectedPublicacionId: number | null = null;

  comentarios: ComentarioResponse[] = [];
  filteredComentarios: ComentarioResponse[] = [];

  nuevoComentario: { [key: number]: string } = {}; // Almacena el texto del nuevo comentario por ID de publicación

  private grupoService = inject(GrupoService);
  private publicacionService = inject(PublicacionService);
  private comentarioService = inject(ComentarioService);

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clienteId: number = this.authService.getClienteId(); // Almacena el ID del cliente autenticado

  ngOnInit(): void {
    this.loadPublicaciones();
    this.loadGrupo();
  }

  loadPublicaciones(): void {
    const grupoId = Number(this.route.snapshot.paramMap.get('IdGrupo'));

    this.publicacionService.getPublicacionByGrupoId(grupoId).subscribe({
      next: (publicaciones) => {
        this.publicaciones = publicaciones;
        this.filteredPublicaciones = publicaciones;
        this.showSnackBar('Publicaciones cargadas con éxito');
      },
      error: (error) => {
        console.error('Error loading publicaciones', error);
        this.showSnackBar('Error al cargar las publicaciones');
      }
    });
  }

  loadGrupo(): void {
    const grupoId = Number(this.route.snapshot.paramMap.get('IdGrupo'));

    this.grupoService.getGrupoById(grupoId).subscribe({
      next: (grupo) => {
        this.grupoNombre = grupo.nombre; // Almacena el nombre del grupo seleccionado
        this.showSnackBar('Grupo cargado con éxito');
      },
      error: (error) => {
        console.error('Error loading grupo', error);
        this.showSnackBar('Error al cargar el grupo');
      }
    });
  }

  nuevaPublicacion(): void {
    const grupoId = Number(this.route.snapshot.paramMap.get('IdGrupo'));
    this.router.navigate([`/cliente/grupo/${grupoId}/publicacion/create`]);
  }

  editarPublicacion(publicacionId: number): void {
    const grupoId = Number(this.route.snapshot.paramMap.get('IdGrupo'));
    this.router.navigate([`/cliente/grupo/${grupoId}/publicacion/update/${publicacionId}`]);
  }

  eliminarPublicacion(publicacionId: number): void {
    const clienteId = this.authService.getClienteId();
    const grupoId = Number(this.route.snapshot.paramMap.get('IdGrupo'));

    this.publicacionService.eliminarPublicacion(publicacionId, clienteId).subscribe({
      next: () => {
        this.publicaciones = this.publicaciones.filter((p) => p.id !== publicacionId);
        this.filteredPublicaciones = this.filteredPublicaciones.filter((p) => p.id !== publicacionId);
        this.showSnackBar('Publicación eliminada con éxito');
      },
      error: (error) => {
        console.error('Error deleting publicacion', error);
        this.showSnackBar('Error al eliminar la publicación');
      }
    });
  }

  loadComentarios(publicacionId: number): void {
    console.log('Cargando comentarios para el ID de publicación:', publicacionId);
  
    if (!publicacionId || isNaN(publicacionId)) {
      console.error('ID de publicación inválido en loadComentarios:', publicacionId);
      return;
    }
  
    this.comentarioService.getAllComentariosByPublicacionId(publicacionId).subscribe({
      next: (comentarios) => {
        this.comentarios = comentarios;
        this.filteredComentarios = comentarios;
        this.showSnackBar('Comentarios cargados con éxito');
      },
      error: (error) => {
        this.showSnackBar('Error al cargar los comentarios');
      }
    });
  }
  
  verComentarios(publicacionId: number): void {
    console.log('Publicación seleccionada con ID:', publicacionId);
    this.selectedPublicacionId = publicacionId; // Establece la publicación seleccionada
    this.loadComentarios(publicacionId); // Carga los comentarios de la publicación seleccionada
  }

  isComentariosVisible(publicacionId: number): boolean {
    return this.selectedPublicacionId === publicacionId;
  }
  
  agregarComentario(publicacionId: number): void {
    const mensaje = this.nuevoComentario[publicacionId]?.trim();
    const clienteId = this.authService.getClienteId(); // Obtener el ID del cliente autenticado
  
    if (!mensaje) {
      this.showSnackBar('El comentario no puede estar vacío');
      return;
    }
  
    const comentarioRequest: ComentarioRequest = { mensaje, clienteId };
  
    this.comentarioService.crearComentario(publicacionId, comentarioRequest).subscribe({
      next: (nuevoComentario) => {
        this.comentarios.push(nuevoComentario); // Agregar el nuevo comentario a la lista local
        this.filteredComentarios.push(nuevoComentario);
        this.nuevoComentario[publicacionId] = ''; // Limpiar el campo de texto
        this.showSnackBar('Comentario agregado con éxito');
      },
      error: (error) => {
        console.error('Error al agregar el comentario', error);
        this.showSnackBar('Error al agregar el comentario');
      }
    });
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 2000
    });
  }
}