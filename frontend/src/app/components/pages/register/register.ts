import { ChangeDetectorRef, Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Container } from '../../general/container/container';
import { MatButtonModule } from '@angular/material/button';
import { getImage } from '../../../services/utilities-service';
import { FormBuilder, FormGroup, ReactiveFormsModule  } from '@angular/forms';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-register',
  imports: [Container, MatSelectModule, MatInputModule, MatFormFieldModule, MatButtonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  selectedImagesCover: File[] = [];
  previewCoverImage!: string;
  form: FormGroup;

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef,
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

  ngOnInit() {
    this.previewCoverImage = getImage(null);
  }

  async onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.selectedImagesCover = [input.files[0]];

      const reader = new FileReader();

      reader.onload = () => {
        this.previewCoverImage = reader.result as string;
        this.cd.detectChanges();
      };

      reader.readAsDataURL(this.selectedImagesCover[0]);
    }
  }

  register() {
    const formData = new FormData();

    console.log('Form values:', this.form.value);

   
    formData.append('username', this.form.value.username);

    if(this.form.value.password !== this.form.value.confirmPassword) {
      console.error('Passwords do not match');
      console.log('Password:', this.form.value.password, this.form.value.confirmPassword);

      return;
    }

    formData.append('type', this.form.value.type);

    formData.append('password', this.form.value.password);

    formData.append('email', this.form.value.email);

    formData.append('name', this.form.value.name);

    formData.append('cogname', this.form.value.cogname);

    // Añadir imagen si se ha seleccionado
    if (this.selectedImagesCover.length > 0) {
      formData.append('image', this.selectedImagesCover[0]);
    }

    this.authService.register(formData).subscribe({
      next: (response) => {
        if (response && response.token) {
         // window.location.reload();
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
