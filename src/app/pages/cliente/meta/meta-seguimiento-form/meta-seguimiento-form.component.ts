import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { SeguimientoService } from '../../../../core/services/seguimiento.service';

@Component({
    selector: 'app-meta-seguimiento-form',
    imports: [
        CommonModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatOptionModule,
        MatSelectModule,
    ],
    templateUrl: './meta-seguimiento-form.component.html',
    styleUrl: './meta-seguimiento-form.component.css'
})
export class MetaSeguimientoFormComponent implements OnInit {
  seguimientoForm!: FormGroup;
  titulo!: string;
  textoBoton!: string;
  isEditMode = false; // Para saber si estamos en modo edición
  seguimientoId!: number; // Para guardar el ID en caso de edición

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private seguimientoService = inject(SeguimientoService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const clienteId = this.authService.getClienteId(); // Obtén la ID del cliente
    this.seguimientoId = Number(this.route.snapshot.paramMap.get('id')); // Obtén el seguimientoId de la URL
  
    this.isEditMode = !!this.seguimientoId;
  
    this.titulo = this.isEditMode ? 'Editar Seguimiento' : 'Añadir Seguimiento';
    this.textoBoton = this.isEditMode ? 'Actualizar Seguimiento' : 'Añadir Seguimiento';
  
    if (!clienteId) {
      this.showSnackBar('Usuario no autenticado.');
      this.router.navigate(['/auth/login']);
      return;
    }
  
    this.seguimientoForm = this.fb.group({
      fecha: [''],
      pesoDelDia: [''],
      observaciones: [''],
    });
  
    if (this.isEditMode) {
      this.loadSeguimiento(this.seguimientoId);
    }
  }

  private loadSeguimiento(seguimientoId: number): void {
    const metaId = Number(this.route.snapshot.paramMap.get('metaId'));
  
    this.seguimientoService.getSeguimientoById(metaId, seguimientoId).subscribe({
      next: (seguimiento) =>
        this.seguimientoForm.patchValue({
          fecha: seguimiento.fecha, // Esto permite reutilizar la fecha si no se cambia
          pesoDelDia: seguimiento.pesoDelDia,
          observaciones: seguimiento.observaciones,
        }),
      error: () => this.showSnackBar('Error al cargar el seguimiento'),
    });
  }
  
  

  onSubmit(): void {
    if (this.seguimientoForm.valid) {
      const formData = this.seguimientoForm.value;
      const metaId = Number(this.route.snapshot.paramMap.get('metaId'));
  
      let fechaTransformada = formData.fecha;
  
      // Si la fecha no se modificó, utiliza la existente
      if (!formData.fecha && this.isEditMode) {
        fechaTransformada = this.seguimientoForm.get('fecha')?.value; // Fecha actual del formulario cargado
      } else if (formData.fecha) {
        // Transformar la fecha al formato DD-MM-YYYY
        fechaTransformada = this.transformarFecha(formData.fecha);
      }
  
      const seguimientoData = {
        ...formData,
        fecha: fechaTransformada,
      };
  
      if (this.isEditMode) {
        const seguimientoId = this.route.snapshot.paramMap.get('id');
        this.seguimientoService
          .actualizarSeguimiento(metaId, Number(seguimientoId), seguimientoData)
          .subscribe({
            next: () => this.handleSuccess('Seguimiento actualizado correctamente'),
            error: () => this.showSnackBar('Error al actualizar el seguimiento'),
          });
      } else {
        this.seguimientoService.crearSeguimiento(metaId, seguimientoData).subscribe({
          next: () => this.handleSuccess('Seguimiento creado correctamente'),
          error: () => this.showSnackBar('Error al crear el seguimiento'),
        });
      }
    }
  }
  

  private transformarFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-'); // Divide el formato YYYY-MM-DD
    return `${day}-${month}-${year}`; // Retorna en formato DD-MM-YYYY
  }

  private handleSuccess(message: string): void {
    this.showSnackBar(message);
    this.router.navigate(['/cliente/meta']);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

  controlHasError(controlName: string, errorName: string): boolean {
    return this.seguimientoForm.controls[controlName]?.hasError(errorName) ?? false;
  }
}
