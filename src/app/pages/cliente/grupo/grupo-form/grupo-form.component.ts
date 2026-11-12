import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { GrupoService } from '../../../../core/services/grupo.service';

@Component({
    selector: 'app-grupo-form',
    imports: [
        ReactiveFormsModule,
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
    templateUrl: './grupo-form.component.html',
    styleUrl: './grupo-form.component.css'
})
export class GrupoFormComponent {

  grupoForm!: FormGroup;
  titulo!: string;
  textoBoton!: string;
  isEditMode = false;
  grupoId!: number;

  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);

  form: FormGroup = this.fb.group({
    nombre: [''],
    esPrivado: [''],
  })

  ngOnInit() {
    const grupoId = this.route.snapshot.paramMap.get('grupoId');
    this.isEditMode = !!grupoId;
    this.titulo = this.isEditMode ? 'Editar Grupo' : 'Crear Grupo';
    this.textoBoton = this.isEditMode ? 'Actualizar Grupo' : 'Crear Grupo';

    this.grupoForm = this.fb.group({
      nombre: [''],
      esPrivado: [false],
      clienteId: [this.authService.getClienteId()],
    });

    if (this.isEditMode) {
      this.grupoId = Number(grupoId);
      this.loadGrupo(this.grupoId);
    }
  }

  loadGrupo(grupoId: number): void {
    const userId = this.authService.getNutricionistaId();
    if (!userId) {
      this.showSnackBar('Usuario no autenticado.');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.grupoService.getGrupoById(this.grupoId).subscribe({
      next: (grupo) => this.grupoForm.patchValue(grupo),
      error: () => this.showSnackBar('Error al cargar el grupo.'),
    });

    
  }

  onSubmit(): void {
    const userId = this.authService.getNutricionistaId();
    if (this.grupoForm.invalid) {
      this.showSnackBar('Por favor, completa correctamente todos los campos.');
      return;
    }

    if(this.isEditMode) {
      this.grupoService.editarGrupo(this.grupoForm.value, this.grupoId, userId).subscribe({
        next: () => {
          this.showSnackBar('Grupo actualizado correctamente.');
          this.router.navigate(['/cliente/grupo']);
        },
        error: () => this.showSnackBar('Error al actualizar el grupo.'),
      });
    } else {
      this.grupoService.createGrupo(this.grupoForm.value).subscribe({
        next: () => {
          this.showSnackBar('Grupo creado correctamente.');
          this.router.navigate(['/cliente/grupo']);
        },
        error: () => this.showSnackBar('Error al crear el grupo.'),
      });
    }
  }

  controlHasError(controlName: string, errorName: string): boolean {
    return this.grupoForm.controls[controlName]?.hasError(errorName) ?? false;
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}
