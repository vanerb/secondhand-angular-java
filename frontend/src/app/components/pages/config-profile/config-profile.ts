import { Component, Input, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ModalService } from '../../../services/modal-service';
import { AuthService } from '../../../services/auth-service';
import { getImage } from '../../../services/utilities-service';

@Component({
  selector: 'app-config-profile',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './config-profile.html',
  styleUrl: './config-profile.css',
})
export class ConfigProfile implements OnInit {
  selectedImage = signal<File | null>(null);

  imagePreview = signal<string | null>(null);

  isSaving = signal(false);
  profileForm!: FormGroup;

  @Input() user!: any;

  confirm!: (result?: any) => void;

  close!: () => void;

  constructor(
    private readonly fb: FormBuilder,
    private readonly modalService: ModalService,
    private readonly authService: AuthService,
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      cogname: ['', [Validators.required, Validators.maxLength(50)]],
      username: ['', [Validators.required, Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.profileForm.patchValue({
      name: this.user.name ?? '',
      cogname: this.user.cogname ?? '',
      username: this.user.username ?? '',
      email: this.user.email ?? '',
    });

    if (this.user.profileImage) {
      this.imagePreview.set(this.getUserImage(this.user.profileImage));
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      return;
    }

    this.selectedImage.set(file);

    const reader = new FileReader();

    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
  }

  getUserImage(image: string): string {
    if (!image) {
      return 'assets/images/default-avatar.png';
    }

    if (image.startsWith('http')) {
      return image;
    }

    return getImage(image);
  }

  updateProfile(): void {
    if (this.profileForm.invalid || this.isSaving()) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const formData = new FormData();

    formData.append('name', this.profileForm.get('name')?.value ?? '');

    formData.append('cogname', this.profileForm.get('cogname')?.value ?? '');

    formData.append('username', this.profileForm.get('username')?.value ?? '');

    formData.append('email', this.profileForm.get('email')?.value ?? '');

    const image = this.selectedImage();

    if (image) {
      formData.append('image', image);
    }

    this.confirm(formData);
  }

  closeModal(): void {
    this.close();
  }
}
