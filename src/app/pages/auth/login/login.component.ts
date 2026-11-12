import { Component, inject, ChangeDetectionStrategy } from '@angular/core';

import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
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
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  private readonly CLIENTE_ROL = 'CLIENTE';
  private readonly NUTRICIONISTA_ROL = 'NUTRICIONISTA';
  private readonly CLIENTE_ROUTE = '/cliente/perfil';
  private readonly NUTRICIONISTA_ROUTE = '/nutricionista/gestionar-perfiles/list';
  private readonly DEFAULT_ROUTE = '/home';

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
        this.redirectUserBasedOnRole();
      },
      error: () => {
        this.showSnackBar('Error en el inicio de sesión. Por favor, intenta de nuevo.');
      },
    });

  }

  private redirectUserBasedOnRole(): void {
    const userRole = this.authService.getUserRole();

    if (userRole === this.CLIENTE_ROL) {
      this.router.navigate([this.CLIENTE_ROUTE]);
    } else if (userRole === this.NUTRICIONISTA_ROL) {
      this.router.navigate([this.NUTRICIONISTA_ROUTE]);
    } else {
      this.router.navigate([this.DEFAULT_ROUTE]);
    }
  }

  private showSnackBar(message:string): void {
    this.snackBar.open('Login Successful', 'Close', {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
