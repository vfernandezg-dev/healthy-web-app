import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfile } from '../../models/user-profile.model';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { StorageService } from '../../../core/services/storage.service';
import { MatRadioButton, MatRadioModule } from '@angular/material/radio';

@Component({
    selector: 'app-update-profile',
    imports: [MatRadioModule, MatButtonModule, MatInputModule, MatCardModule, MatSnackBarModule,
        FormsModule, ReactiveFormsModule],
    templateUrl: './update-profile.component.html',
    styleUrl: './update-profile.component.css'
})
export class UpdateProfileComponent {

  profileForm: FormGroup;
  profile!: UserProfile;

  private fb = inject(FormBuilder);
  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: [''],
      sexo: [''],
      edad: [''],
      altura: [''],
      peso: [''],
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const authData = this.authService.getUser();
    const userId = authData?.id;

    if (userId) {
      this.userProfileService.getUserProfile(userId).subscribe({
        next: (profile) => {
          this.profile = profile;
          this.profileForm.patchValue(profile);
        },
        error: () => {
          this.showSnackBar('Error al cargar el perfil del usuario.');
        }
      });
    } else {
      this.showSnackBar('Usuario no autenticado.');
      this.router.navigate(['/auth/login']);
    }
  }

  controlHasError(controlName: string, errorName: string): boolean {
    return this.profileForm.controls[controlName].hasError(errorName);
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      const authData = this.authService.getUser();
      const userId = authData?.id;
      const updatedData = { ...this.profile, ...this.profileForm.value };
      console.log('Datos enviados:', updatedData); // Agrega esta línea para depurar los datos enviados
      this.userProfileService.updateUserProfile(Number(userId), updatedData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response); // Agrega esta línea para depurar la respuesta del servidor
          this.showSnackBar('Perfil actualizado exitosamente.');
          this.router.navigate(['/cliente/perfil']);
        },
        error: (error) => {
          console.error('Error al actualizar el perfil:', error); // Agrega esta línea para depurar el error
          this.showSnackBar(error.error?.message || 'Error al actualizar el perfil.');
        }
      });
    } else {
      this.showSnackBar('Formulario no válido.');
    }
  }


  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }

}
