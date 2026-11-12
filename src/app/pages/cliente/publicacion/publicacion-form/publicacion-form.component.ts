import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../../core/services/auth.service';
import { MediaService } from '../../../../core/services/media.service';
import { PublicacionService } from '../../../../core/services/publicacion.service';
import { PublicacionResponse } from '../../../../shared/models/publicacion-response.model';
import { PublicacionCreateRequest } from '../../../../shared/models/publicacion-create-request.model';
import { GrupoService } from '../../../../core/services/grupo.service';

@Component({
    selector: 'app-publicacion-form',
    imports: [
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        FormsModule,
        MatOptionModule,
        MatRadioModule,
        MatSelectModule,
        MatButtonModule,
        MatSelectModule,
        MatSnackBarModule,
    ],
    templateUrl: './publicacion-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './publicacion-form.component.css'
})
export class PublicacionFormComponent implements OnInit {
  private publicacionService = inject(PublicacionService);
  private mediaService = inject(MediaService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  fileAccept: string = '';
  errors: string[] = [];
  isEditMode: boolean = false;
  publicacionId: number | null = null;

  form: FormGroup = this.fb.group({
    titulo: [''],
    descripcion: [''],
    publicacionPath: [''],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('publicacionId');
      this.isEditMode = !!id;
      this.publicacionId = Number(this.route.snapshot.paramMap.get('publicacionId'));
  
      if (this.isEditMode && this.publicacionId) {
        this.loadPublicacion(this.publicacionId);
      }
    });
  }

  loadPublicacion(publicacionId: number): void {
    const clienteId = this.authService.getClienteId();
  
    this.publicacionService.getPublicacionById(publicacionId, clienteId).subscribe({
      next: (publicacion: PublicacionResponse) => {
        // Mapeamos PublicacionResponse a los campos esperados por el formulario
        this.form.patchValue({
          id: publicacion.id,
          titulo: publicacion.titulo,
          descripcion: publicacion.descripcion,
          publicacionPath: publicacion.publicacionPath,
        });
      },
      error: (error) => {
        this.errors = error.error;
      },
    });
  }

  uploadFile(event: Event, control: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowedExtensions =
        control === 'publicacionPath'
          ? ['png', 'jpg', 'jpeg', '.gif', '.mp4']
          : this.fileAccept.split(',').map((ext) => ext.replace('.', ''));

      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      if (fileExtension && !allowedExtensions.includes(fileExtension)) {
        this.errors.push(
          `Archivo no permitido. Extensiones válidas: ${allowedExtensions.join(', ')}`
        );
        return;
      }

      const formData = new FormData();
      formData.append('file', file);

      this.mediaService.upload(formData).subscribe({
        next: (response) => this.form.controls[control].setValue(response.path),
        error: () => this.errors.push('Error al cargar el archivo.'),
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
  
    const formData: PublicacionCreateRequest = {
      ...this.form.value, // Extrae directamente los valores del formulario
      clienteId: this.authService.getClienteId(),
      grupoId: this.route.snapshot.paramMap.get('IdGrupo'),
    };
  
    if (this.isEditMode && this.publicacionId) {
      this.publicacionService
        .actualizarPublicacion(this.publicacionId, this.authService.getClienteId(), formData)
        .subscribe({
          next: () => {
            this.snackBar.open('Publicación actualizada correctamente', 'Cerrar', {
              duration: 2000,
            });
            this.router.navigate(['/cliente/grupo', formData.grupoId]);
          },
          error: (error) => {
            this.errors = error.error;
          },
        });
    } else {
      this.publicacionService.crearPublicacion(formData).subscribe({
        next: () => {
          this.snackBar.open('Publicación creada correctamente', 'Cerrar', {
            duration: 2000,
          });
          this.router.navigate(['/cliente/grupo/', formData.grupoId]);
        },
        error: (error) => {
          this.errors = error.error;
        },
      });
    }
  }
}
