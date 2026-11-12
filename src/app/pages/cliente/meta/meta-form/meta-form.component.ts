
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { MetaService } from '../../../../core/services/meta.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
    selector: 'app-meta-form',
    imports: [
    MatInputModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule
],
    templateUrl: './meta-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './meta-form.component.css'
})
export class MetaFormComponent {
  metaForm!: FormGroup;
  titulo!: string;
  textoBoton!: string;
  isEditMode = false;
  metaId!: number;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private metaService = inject(MetaService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const clienteId = this.authService.getClienteId(); // Obtén la ID del cliente
    this.metaId = Number(this.route.snapshot.paramMap.get('metaId')); // Obtén el metaId de la URL
    this.isEditMode = !!this.metaId;
  
    this.titulo = this.isEditMode ? 'Editar Meta' : 'Añadir Meta';
    this.textoBoton = this.isEditMode ? 'Actualizar Meta' : 'Añadir Meta';
  
    if (!clienteId) {
      this.showSnackBar('Usuario no autenticado.');
      this.router.navigate(['/auth/login']);
      return;
    }
  
    // Configuración inicial del formulario
    this.metaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      pesoObjetivo: ['', Validators.required], // Peso objetivo debe ser mayor a 0
      clienteId: [clienteId], // Asigna la ID del cliente
    });
  
    // Si es modo edición, cargar la meta existente
    if (this.isEditMode) {
      this.loadMeta(this.metaId);
    }
  }
  
  

  controlHasError(controlName: string, errorName: string): boolean {
    return this.metaForm.controls[controlName]?.hasError(errorName) ?? false;
  }

  loadMeta(metaId: number): void {
    const clienteId = this.authService.getClienteId();
  
    if (!clienteId) {
      this.showSnackBar('Usuario no autenticado.');
      this.router.navigate(['/auth/login']);
      return;
    }
  
    this.metaService.getMetaById(metaId, clienteId).subscribe({
      next: (meta) => {
        this.metaForm.patchValue({
          nombre: meta.nombre,
          descripcion: meta.descripcion,
          pesoObjetivo: meta.pesoObjetivo,
          clienteId: clienteId, // Usa el clienteId directamente
        });
      },
      error: () => this.showSnackBar('Error al cargar la meta.'),
    });
  }  

  onSubmit(): void {
    if (this.metaForm.invalid) {
      this.showSnackBar('Por favor, complete el formulario.');
      return;
    }
  
    const metaData = this.metaForm.value;
  
    if (this.isEditMode) {
      this.metaService.updateMeta(this.metaId, metaData.clienteId, metaData).subscribe({
        next: () => {
          this.showSnackBar('Meta actualizada correctamente.');
          this.router.navigate(['/cliente/meta']);
        },
        error: () => this.showSnackBar('Error al actualizar la meta.'),
      });
    } else {
      this.metaService.createMeta(metaData).subscribe({
        next: () => {
          this.showSnackBar('Meta creada correctamente.');
          this.router.navigate(['/cliente/meta']);
        },
        error: () => this.showSnackBar('Error al crear la meta.'),
      });
    }
  }
  
  

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}
