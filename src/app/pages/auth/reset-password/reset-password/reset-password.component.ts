import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatError, MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatAnchor, MatButton } from '@angular/material/button';
import { PasswordResetService, tokenFromFragment } from '../../../../core/services/password-reset.service';

/** Las dos contraseñas coinciden. */
function samePassword(group: AbstractControl): ValidationErrors | null {
  return group.get('password')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, MatFormField, MatLabel, MatHint, MatInput, MatError, MatButton, MatAnchor],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly snackBar = inject(MatSnackBar);
  private readonly passwordResetService = inject(PasswordResetService);

  /** Token del enlace; null si falta, no es válido o la API lo ha rechazado. */
  token: string | null = null;
  /** La API ha dicho que el enlace caducó o ya se usó. */
  linkRejected = false;
  submitting = false;

  // Misma política que la API: entre 10 y 64 caracteres.
  readonly resetForm = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(64)]],
      confirm: ['', [Validators.required]],
    },
    { validators: samePassword },
  );

  ngOnInit(): void {
    this.token = tokenFromFragment(this.route.snapshot.fragment);
    // Fuera de la barra de direcciones y del historial en cuanto se ha leído.
    if (this.route.snapshot.fragment) {
      this.location.replaceState('/auth/reset-password');
    }
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token || this.submitting) {
      return;
    }
    this.submitting = true;
    this.passwordResetService.resetPassword(this.token, this.resetForm.getRawValue().password).subscribe({
      next: () => {
        this.snackBar.open('Contraseña cambiada. Inicia sesión con la nueva.', 'Cerrar', { duration: 4000 });
        this.router.navigate(['/auth/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.submitting = false;
        if (error.status === 400) {
          this.linkRejected = true;
          this.token = null;
          return;
        }
        this.snackBar.open(error.error?.message ?? 'No se pudo cambiar la contraseña. Inténtalo de nuevo.', 'Cerrar', {
          duration: 4000,
        });
      },
    });
  }
}
