import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {PasswordResetService} from '../../../../core/services/password-reset.service';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

@Component({
    selector: 'app-reset-password',
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatButton
    ],
    templateUrl: './request-password-reset.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: './request-password-reset.component.css'
})
export class RequestPasswordResetComponent {
  resetForm: FormGroup;
  sending = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private passwordResetService = inject(PasswordResetService);

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  controlHasError(control: string, error: string) {
    return this.resetForm.controls[control].hasError(error);
  }

  onSubmit() {
    if (this.resetForm.invalid || this.sending) {
      return;
    }

    this.sending = true;
    this.passwordResetService.requestReset(this.resetForm.value.email).subscribe({
      next: () => {
        this.sending = false;
        // Mismo mensaje exista o no la cuenta: la API tampoco lo revela.
        this.showSnackBar('Si el correo está registrado, recibirás un enlace que caduca en 30 minutos.');
      },
      error: (error: HttpErrorResponse) => {
        this.sending = false;
        this.showSnackBar(error.status === 429
          ? 'Demasiadas solicitudes. Inténtalo más tarde.'
          : 'No pudimos procesar la solicitud. Inténtalo nuevamente.');
      },
    });
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
