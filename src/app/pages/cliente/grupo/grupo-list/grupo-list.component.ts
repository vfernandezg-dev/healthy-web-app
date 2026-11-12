
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { ApiImgPipe } from '../../../../core/pipes/api-img.pipe';
import { ComentarioResponse } from '../../../../shared/models/comentario-response.model';
import { PublicacionResponse } from '../../../../shared/models/publicacion-response.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ComentarioService } from '../../../../core/services/comentario.service';
import { PublicacionService } from '../../../../core/services/publicacion.service';

@Component({
    selector: 'app-grupo-list',
    imports: [
    MatCardModule,
    MatButtonModule,
    ApiImgPipe,
    FormsModule,
    MatMenuModule,
    MatIconModule
],
    templateUrl: './grupo-list.component.html',
    styleUrl: './grupo-list.component.css'
})
export class GrupoListComponent {
  publicaciones: PublicacionResponse[] = [];
  filteredPublicaciones: PublicacionResponse[] = [];

  comentarios: ComentarioResponse[] = [];
  filteredComentarios: ComentarioResponse[] = [];

  private publicacionService = inject(PublicacionService);
  private comentarioService = inject(ComentarioService);

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadPublicaciones();
  }

  loadPublicaciones() {
    this.publicacionService.getAllPublicaciones().subscribe({
      next: (publicaciones) => {
        this.publicaciones = publicaciones;
        this.filteredPublicaciones = publicaciones;
        console.log(publicaciones);
      },
      error: (error) => {
        this.snackBar.open('Error al cargar las publicaciones', 'Cerrar');
      }
    })
  }
}
