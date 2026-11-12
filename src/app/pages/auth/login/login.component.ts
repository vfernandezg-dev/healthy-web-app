import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthRequest } from '../../../shared/models/auth-request.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatCardModule,
        MatSnackBarModule, MatButtonModule, RouterLink],
    templateUrl: './login.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './login.component.css'
})

export class LoginComponent {

  loginForm: FormGroup;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  constructor(){
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['',[Validators.required]]
    });
  }

  controlHasError(control: string, error: string){
    return this.loginForm.controls[control].hasError(error);
  }

  onSubmit(){
    if(this.loginForm.invalid){
      return;
    };

    const credentials: AuthRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.showSnackBar('Inicio de sesión exitoso');
        void this.router.navigateByUrl(this.destination());
      },
      error: (error: HttpErrorResponse) => {
        this.showSnackBar(error.status === 429
          ? 'Demasiados intentos. Espera unos minutos antes de volver a probar.'
          : 'Correo o contraseña incorrectos.');
      },
    });

  }

  /**
   * Vuelve a la página que pidió el usuario antes de iniciar sesión, si es una ruta interna de la app
   * (nunca una URL externa: evita redirecciones abiertas). Si no, a la página de inicio de su rol.
   */
  private destination(): string {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const home = this.authService.homeUrl();
    if (!returnUrl || !returnUrl.startsWith('/') || returnUrl.startsWith('//') || returnUrl.startsWith('/auth')) {
      return home;
    }
    // Solo si pertenece al área de su rol (un cliente no vuelve a /nutricionista/...).
    const area = home.split('/')[1];
    return returnUrl.split('/')[1] === area ? returnUrl : home;
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top'
    });
  }
}
