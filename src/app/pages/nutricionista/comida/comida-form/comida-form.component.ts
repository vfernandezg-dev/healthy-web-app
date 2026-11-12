
import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ComidaService } from '../../../../core/services/comida.service';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-comida-form',
    imports: [
    MatInputModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatOptionModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule
],
    templateUrl: './comida-form.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./comida-form.component.css']
})
export class ComidaFormComponent implements OnInit {
  comidaForm!: FormGroup;
  titulo!: string;
  textoBoton!: string;
  isEditMode = false;
  planAlimenticioId!: number;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private comidaService = inject(ComidaService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.planAlimenticioId = Number(this.route.snapshot.paramMap.get('planId'));
    const comidaId = this.route.snapshot.paramMap.get('comidaId');

    this.isEditMode = !!comidaId;
    this.titulo = this.isEditMode ? 'Editar Comida' : 'Añadir Comida';
    this.textoBoton = this.isEditMode ? 'Actualizar Comida' : 'Añadir Comida';

    this.comidaForm = this.fb.group({
      nombreComida: ['', Validators.required],
      calorias: ['', [Validators.required, Validators.min(0)]],
      categoria: ['', Validators.required],
      planAlimenticioId: [this.planAlimenticioId, Validators.required],
    });

    if (this.isEditMode) {
      this.loadComida(Number(comidaId));
    }
  }

  controlHasError(controlName: string, errorName: string): boolean {
    return this.comidaForm.controls[controlName]?.hasError(errorName) ?? false;
  }

  loadComida(comidaId: number): void {
    const userId = this.authService.getNutricionistaId();
    if (!userId) {
      this.showSnackBar('Usuario no autenticado.');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.comidaService.getComidaById(this.planAlimenticioId, comidaId).subscribe({
      next: (comida) => this.comidaForm.patchValue(comida),
      error: () => this.showSnackBar('Error al cargar la comida.'),
    });
  }

  onSubmit(): void {
    if (this.comidaForm.invalid) {
      this.showSnackBar('Por favor, completa correctamente todos los campos.');
      return;
    }

    const comidaData = this.comidaForm.value;

    if (this.isEditMode) {
      const comidaId = Number(this.route.snapshot.paramMap.get('comidaId'));
      this.comidaService.editComida(this.planAlimenticioId, comidaId, comidaData).subscribe({
        next: () => {
          this.showSnackBar('Comida actualizada correctamente.');
          this.router.navigate(['/nutricionista/comida/list']);
        },
        error: () => this.showSnackBar('Error al actualizar la comida.'),
      });
    } else {
      this.comidaService.createComida(this.planAlimenticioId, comidaData).subscribe({
        next: () => {
          this.showSnackBar('Comida añadida correctamente.');
          this.router.navigate(['/nutricionista/plan-alimenticio/list']);
        },
        error: () => this.showSnackBar('Error al añadir la comida.'),
      });
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}
