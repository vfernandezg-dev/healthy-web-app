import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { ContenidoService } from '../../../../core/services/contenido.service';
import { MediaService } from '../../../../core/services/media.service';
import { ContenidoResponse } from '../../../../shared/models/contenido-response.model';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../../core/services/auth.service';
import { ContenidoRequest } from '../../../../shared/models/contenido-request.model';
import { MatOptionModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';

@Component({
    selector: 'app-contenido-form',
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
    templateUrl: './contenido-form.component.html',
    styleUrls: ['./contenido-form.component.css']
})
export class ContenidoFormComponent {
  private contenidoService = inject(ContenidoService);
  private mediaService = inject(MediaService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  fileAccept: string = '';
  errors: string[] = [];
  isEditMode: boolean = false;
  contenidoId: number | null = null;

  form: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]],
    descripcion: ['', [Validators.required]],
    slug: ['', [Validators.required, Validators.pattern('[a-z0-9-]+')]],
    tipoContenido: ['', Validators.required],
    categoriaContenido: ['', Validators.required],
    coverPath: [''],
    filePath: [''],
    esGratis: [null, Validators.required],
    nutricionistaId: [''],
  });

  ngOnInit(): void {
    // Determina si está en modo de edición
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      this.isEditMode = !!id;
      this.contenidoId = id ? Number(id) : null;

      if (this.isEditMode && id) {
        this.loadContenido(Number(id));
      }
    });

    this.form.get('tipoContenido')?.valueChanges.subscribe((tipo) => {
      this.updateFileAccept(tipo);
    });
  }

  loadContenido(id: number): void {
    this.contenidoService.getContentById(id).subscribe({
      next: (contenido) => {
        this.form.patchValue(contenido); // Carga los datos en el formulario
      },
      error: () => {
        this.snackBar.open('Error al cargar el contenido', 'Cerrar', {
          duration: 3000,
        });
        this.router.navigate(['/nutricionista/contenido']);
      },
    });
  }

  onTipoContenidoChange(event: MatSelectChange): void {
    const selectedTipoContenido = event.value;
    this.updateFileAccept(selectedTipoContenido);
  }

  updateFileAccept(tipoContenido: string): void {
    switch (tipoContenido) {
      case 'VIDEO':
        this.fileAccept = '.mp4';
        break;
      case 'ARTICULO':
        this.fileAccept = '.pdf';
        break;
      case 'GUIA':
        this.fileAccept = '.pdf,.doc,.docx,.txt';
        break;
      default:
        this.fileAccept = '';
        break;
    }
  }

  uploadFile(event: Event, control: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const allowedExtensions =
        control === 'coverPath'
          ? ['png', 'jpg', 'jpeg']
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

  createSlug(): void {
    const slug = this.form
      .get('titulo')
      ?.value.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
    this.form.get('slug')?.setValue(slug);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formData: ContenidoRequest = {
      ...this.form.value,
      nutricionistaId: this.authService.getUser()?.nutricionistaId,
    };

    if (this.isEditMode && this.contenidoId) {
      // Modo de edición
      this.contenidoService.updateContenido(this.contenidoId, formData).subscribe({
        next: () => {
          this.snackBar.open('Contenido actualizado exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/nutricionista/contenido']);
        },
        error: () => {
          this.snackBar.open('Error al actualizar el contenido', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    } else {
      // Modo de creación
      this.contenidoService.crearContenido(formData).subscribe({
        next: () => {
          this.snackBar.open('Contenido creado exitosamente', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate(['/nutricionista/contenido']);
        },
        error: () => {
          this.snackBar.open('Error al crear el contenido', 'Cerrar', {
            duration: 3000,
          });
        },
      });
    }
  }
}
