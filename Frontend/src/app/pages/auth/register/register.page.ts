import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { getApiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-register.page',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder); private readonly auth = inject(AuthService); private readonly router = inject(Router);
  form = this.fb.nonNullable.group({ identificacion: [0, [Validators.required, Validators.min(1)]], nombre: ['', Validators.required], direccion: ['', Validators.required], email: ['', [Validators.required, Validators.email]], id_ciudad: [1, [Validators.required, Validators.min(1)]], password: ['', [Validators.required, Validators.minLength(6)]], confirmarPassword: ['', Validators.required] });
  errorMessage = ''; loading = false;
  submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } const value = this.form.getRawValue(); if (value.password !== value.confirmarPassword) { this.errorMessage = 'Las contraseñas no coinciden.'; return; } this.loading = true; this.auth.register(value).subscribe({ next: () => void this.router.navigate(['/client']), error: (e) => { this.errorMessage = getApiErrorMessage(e) ?? 'No se pudo crear la cuenta.'; this.loading = false; } }); }
}