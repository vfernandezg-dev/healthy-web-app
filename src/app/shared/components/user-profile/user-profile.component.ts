
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserProfileService } from '../../../core/services/user-profile.service';
import { UserProfile } from '../../models/user-profile.model';
import { SuscripcionListComponent } from "../../../pages/cliente/suscripcion/suscripcion-list/suscripcion-list.component";

@Component({
    selector: 'app-user-profile',
    imports: [SuscripcionListComponent],
    templateUrl: './user-profile.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  profile!: UserProfile;

  private userProfileService = inject(UserProfileService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

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
          this.showSnackBar('Perfil cargado con éxito');
        },
        error: (error) => {

          this.showSnackBar('Error al cargar el perfil');
        }
      });
    } else {

      this.showSnackBar('Usuario no autenticado');
      this.router.navigate(['/auth/login']);
    }
  }

  navigateToUpdateProfile(): void {
    this.router.navigate(['/cliente/perfil/update']);
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
    });
  }
}
