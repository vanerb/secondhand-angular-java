import { ChangeDetectorRef, Component } from '@angular/core';
import { Container } from '../../general/container/container';
import { AuthService } from '../../../services/auth-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { getImage } from '../../../services/utilities-service';

@Component({
  selector: 'app-profile',
  imports: [Container, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user: any = null;
  previewImage = getImage(null);
  selectedImage: File | null = null;
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  readonly form: FormGroup;

  constructor(
    private readonly authService: AuthService,
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      cogname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.authService.getUserByToken()?.subscribe({
      next: (user) => {
        this.user = user;
        this.previewImage = getImage(user.profileImage);
        this.form.patchValue({
          name: user.name,
          cogname: user.cogname,
          username: user.username,
          email: user.email,
        });
        this.isLoading = false;
        this.cdr.detectChanges(); // Forzar la detección de cambios después de obtener el usuario
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los datos de tu cuenta.';
        this.isLoading = false;
      },
    });
  }

  onImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedImage = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewImage = reader.result as string);
    reader.readAsDataURL(file);
    this.cdr.detectChanges(); // Forzar la detección de cambios después de seleccionar la imagen
  }

  saveProfile(): void {
    if (this.form.invalid || this.isSaving) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const formData = new FormData();
    formData.append('name', values.name ?? '');
    formData.append('cogname', values.cogname ?? '');
    formData.append('username', values.username ?? '');
    formData.append('email', values.email ?? '');
    if (this.selectedImage) formData.append('image', this.selectedImage);

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.authService.update(formData)?.subscribe({
      next: (response) => {
        if (response?.token) localStorage.setItem('token', response.token);
        this.successMessage = 'Tu cuenta se ha actualizado correctamente.';
        this.isSaving = false;
        window.location.reload();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message ?? 'No se pudieron guardar los cambios. Comprueba el email y el nombre de usuario.';
        this.isSaving = false;
      },
    });
  }
}
