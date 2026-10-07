import { Component, OnInit, signal } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Container } from '../../general/container/container';
import { MatButtonModule } from '@angular/material/button';
import { getImage, sleep } from '../../../services/utilities-service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-register',
  imports: [
    Container,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  selectedImagesCover: File[] = [];

  previewCoverImage = signal('');

  form: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      username: [''],
      password: [''],
      email: [''],
      type: ['USER'],
      name: [''],
      cogname: [''],
      confirmPassword: [''],
    });
  }

  ngOnInit(): void {
    this.previewCoverImage.set(getImage(null));
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    this.selectedImagesCover = [input.files[0]];

    const reader = new FileReader();

    reader.onload = () => {
      this.previewCoverImage.set(reader.result as string);
    };

    reader.readAsDataURL(this.selectedImagesCover[0]);
  }

  register(): void {
    const formData = new FormData();

    console.log('Form values:', this.form.value);

    const password = this.form.value.password;

    const confirmPassword = this.form.value.confirmPassword;

    if (password !== confirmPassword) {
      console.error('Passwords do not match');

      console.log('Password:', password, confirmPassword);

      return;
    }

    formData.append('username', this.form.value.username);

    formData.append('type', this.form.value.type);

    formData.append('password', password);

    formData.append('email', this.form.value.email);

    formData.append('name', this.form.value.name);

    formData.append('cogname', this.form.value.cogname);

    // Añadir imagen si se ha seleccionado
    if (this.selectedImagesCover.length > 0) {
      formData.append('image', this.selectedImagesCover[0]);
    }

    this.authService.register(formData).subscribe({
      next: async (response) => {
        if (response && response.token) {
          window.location.href = '/login';
          await sleep(1000);
          window.location.reload();
        } else {
          console.error('Invalid response from register API');
        }
      },

      error: (error) => {
        console.error('Register failed:', error);
      },
    });
  }
}
