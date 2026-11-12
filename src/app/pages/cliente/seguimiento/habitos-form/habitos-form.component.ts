
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { HabitoService } from '../../../../core/services/habito.service';
import { FormatTimePipe } from '../../../../core/pipes/format-time.pipe';

@Component({
    selector: 'app-habitos-form',
    imports: [
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatOptionModule,
    MatSelectModule
],
    templateUrl: './habitos-form.component.html',
    styleUrl: './habitos-form.component.css'
})
export class HabitosFormComponent {
  habitosForm!: FormGroup;
  titulo!: string;
  textoBoton!: string;
  isEditMode = false; // Para saber si estamos en modo edición
  habitosId!: number; // Para guardar el ID en caso de edición

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);
  private habitosService = inject(HabitoService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    const clienteId = this.authService.getClienteId(); // Obtén la ID del cliente
    this.habitosId = Number(this.route.snapshot.paramMap.get('habitoId')); // Obtén el habitosId de la URL
  
    this.isEditMode = !!this.habitosId;
  
    this.titulo = this.isEditMode ? 'Editar Habitos' : 'Añadir Habitos';
    this.textoBoton = this.isEditMode ? 'Actualizar Habitos' : 'Añadir Habitos';
  

    
    if (!clienteId) {
      this.showSnackBar('Usuario no autenticado.');
      this.router.navigate(['/auth/login']);
      return;
    }
  
    this.habitosForm = this.fb.group({
      nombre: [''],
      fechaRegistro: [''],
      hidratacion: [''],
      alimentacion: [''],
      ejercicio: [''],
      calidadDeSueno: [''],
      clienteId: [clienteId],
    });

    if (this.isEditMode) {
      this.loadHabitos(this.habitosId);
    }
  }

  private loadHabitos(habitosId: number): void {
    
    this.habitosService.getHabitoById(habitosId).subscribe({
      next: (habitos) =>
        this.habitosForm.patchValue({
          nombre: habitos.nombre,
          fechaRegistro: habitos.fechaRegistro,
          hidratacion: habitos.hidratacion,
          alimentacion: habitos.alimentacion,
          ejercicio: habitos.ejercicio,
          calidadDeSueno: habitos.calidadDeSueno,
        }),
      error: () => this.showSnackBar('Error al cargar los habitos')
    })

  }

  onSubmit(): void {
    if (this.habitosForm.valid) {
      const formData = this.habitosForm.value;
  
      let fechaTransformada = formData.fechaRegistro;
  
      if (this.isEditMode && !formData.fechaRegistro) {
        // Si estamos en modo edición y la fecha no se modificó
        fechaTransformada = this.habitosForm.get('fechaRegistro')?.value;
      } else if (formData.fechaRegistro) {
        // Transformar la fecha al formato DD-MM-YYYY
        fechaTransformada = this.transformarFecha(formData.fechaRegistro);
      }
  
      const habitoData = {
        ...formData,
        fechaRegistro: fechaTransformada,
      };
  
      if (this.isEditMode) {
        const habitoId = Number(this.route.snapshot.paramMap.get('habitoId'));
        this.habitosService.actualizarHabito(habitoId, habitoData).subscribe({
          next: () => {
            this.showSnackBar('Hábitos actualizados');
            this.router.navigate(['/cliente/seguimiento']);
          },
          error: () => this.showSnackBar('Error al actualizar los hábitos'),
        });
      } else {
        this.habitosService.crearHabito(habitoData).subscribe({
          next: () => {
            this.showSnackBar('Hábitos creados');
            this.router.navigate(['/cliente/seguimiento']);
          },
          error: () => this.showSnackBar('Error al crear los hábitos'),
        });
      }
    }
  }
  

  private transformarFecha(fecha: string): string {
    const [year, month, day] = fecha.split('-'); // Divide el formato YYYY-MM-DD
    return `${day}-${month}-${year}`; // Retorna en formato DD-MM-YYYY
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

  controlHasError(controlName: string, errorName: string): boolean {
    return this.habitosForm.controls[controlName]?.hasError(errorName) ?? false;
  }
}
