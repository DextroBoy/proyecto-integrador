import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { getApiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-login.page',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService); private readonly router = inject(Router); private readonly fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]], password: ['', [Validators.required, Validators.minLength(6)]] });
  errorMessage = ''; loading = false;
  submit(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.loading = true; this.errorMessage = '';
    this.auth.login(this.form.getRawValue().email, this.form.getRawValue().password).subscribe({ next: ({ user }) => void this.router.navigate([user.rol === 'ADMIN' ? '/admin' : user.rol === 'AGENTE' ? '/agent' : '/client']), error: (e) => { this.errorMessage = getApiErrorMessage(e) ?? 'No se pudo iniciar sesión.'; this.loading = false; } }); }
}
