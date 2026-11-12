import { Component, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { ContenidoService } from '../../../../core/services/contenido.service';
import { MediaService } from '../../../../core/services/media.service';
import { ContenidoResponse } from '../../../../shared/models/contenido-response.model';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiImgPipe } from '../../../../core/pipes/api-img.pipe';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-contenido-list',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ApiImgPipe,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSelectModule,
        MatSnackBarModule,
        MatCardModule
    ],
    templateUrl: './contenido-list.component.html',
    styleUrl: './contenido-list.component.css'
})
export class ContenidoListComponent {
  contenido: ContenidoResponse[] = [];
  filteredContenido: ContenidoResponse[] = [];

  selectTipoContenido: string | null = null;
  uniqueContenido: { tipoContenido: string ;}[] = [];

  selectCategoriaContenido: string | null = null;
  uniqueCategoriaContenido: { categoriaContenido: string ;}[] = [];

  private contenidoService = inject(ContenidoService);
  private mediaService = inject(MediaService);

  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  
  ngOnInit(): void {
    this.loadContenido();
  }

  loadContenido(): void {

    const nutricionistaId = this.authService.getNutricionistaId();

    this.contenidoService.getAllContenidosByNutricionistaId(nutricionistaId).subscribe({
      next: (contenido) => {
        this.contenido = contenido;
        this.filteredContenido = contenido;
  
        // Extraer tipos únicos de contenido
        const tiposUnicos = Array.from(new Set(contenido.map(c => c.tipoContenido)));
        this.uniqueContenido = tiposUnicos.map(tipo => ({ tipoContenido: tipo }));
  
        // 
        const tiposCategoria = Array.from(new Set(contenido.map(cc => cc.categoriaContenido)));
        this.uniqueCategoriaContenido = tiposCategoria.map(tipoCont => ({ categoriaContenido: tipoCont }))

        console.log(contenido);
        this.showSnackBar('Contenido cargado con éxito');
      },
      error: (error) => {
        console.error('Error loading contenido', error);
        this.showSnackBar('Error al cargar el contenido');
      }
    });
  }
  
  filterContenido(): void {
    this.filteredContenido = this.contenido.filter((c) => {
      const tipoMatch = this.selectTipoContenido
        ? c.tipoContenido === this.selectTipoContenido
        : true;
      const categoriaMatch = this.selectCategoriaContenido
        ? c.categoriaContenido === this.selectCategoriaContenido
        : true;
      return tipoMatch && categoriaMatch;
    });
  }
  

  createContenido(): void {
    this.router.navigate(['/nutricionista/contenido/create']);
  }

  editContenido(contenidoId: number): void {
    this.router.navigate(['/nutricionista/contenido/edit', contenidoId]);
  }

  deleteContenido(contenidoId: number): void {
    this.contenidoService.deleteContenido(contenidoId).subscribe({
      next: () => {
        this.loadContenido();
        this.showSnackBar('Contenido eliminado con éxito');
      },
      error: (error) => {
        console.error('Error deleting contenido', error);
        this.showSnackBar('Error al eliminar el contenido');
      }
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}
