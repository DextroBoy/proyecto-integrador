import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LocationSelection } from '../../../interfaces/location.interface';
import { LocationSelectorComponent } from '../../../components/location-selector/location-selector.component';
import { AuthService } from '../../../services/auth/auth.service';
import { getApiErrorMessage } from '../../../services/api-error';

@Component({
  selector: 'app-register.page',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LocationSelectorComponent],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    identificacion: [0, [Validators.required, Validators.min(1)]],
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmarPassword: ['', Validators.required],
  });
  selectedCityId: number | null = null;
  locationTouched = false;
  errorMessage = '';
  loading = false;

  onLocationChange(selection: LocationSelection): void {
    this.selectedCityId = selection.id_ciudad;
    if (this.selectedCityId !== null) {
      this.locationTouched = true;
      this.errorMessage = '';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.password !== value.confirmarPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.selectedCityId === null) {
      this.locationTouched = true;
      this.errorMessage = 'Selecciona el país, departamento y ciudad.';
      return;
    }

    const account = {
      identificacion: value.identificacion,
      nombre: value.nombre,
      direccion: value.direccion,
      email: value.email,
      password: value.password,
      id_ciudad: this.selectedCityId,
    };
    this.loading = true;
    this.errorMessage = '';
    this.auth.register(account).subscribe({
      next: () => void this.router.navigate(['/client']),
      error: (error: unknown) => {
        this.errorMessage = getApiErrorMessage(error) ?? 'No se pudo crear la cuenta.';
        this.loading = false;
      },
    });
  }
}