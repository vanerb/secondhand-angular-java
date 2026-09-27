import { Component, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Condition } from '../../../../enums/condition';
import { Availability } from '../../../../enums/availability';

import { Container } from '../../../general/container/container';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-create-product',
  imports: [
    ReactiveFormsModule,
    Container,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './create-product.html',
  styleUrl: './create-product.css',
})
export class CreateProduct {
  productForm: FormGroup;

  conditions = Object.values(Condition);
  availabilities = Object.values(Availability);

  categories = [
    'ELECTRONICS',
    'COMPUTERS',
    'VIDEO_GAMES',
    'MOBILE',
    'CLOTHING',
    'HOME',
    'SPORTS',
    'BOOKS',
    'OTHER',
  ];

  selectedImages: {
    id: number;
    file: File;
    preview: string;
  }[] = [];

  confirm!: (result?: any) => void;

  close!: () => void;

  constructor(
    private fb: FormBuilder,

  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      condition: ['', Validators.required],
      availability: [Availability.AVAILABLE, Validators.required],
    });
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const files = Array.from(input.files);

    const availableSlots = 8 - this.selectedImages.length;

    files.slice(0, availableSlots).forEach((file) => {
      const preview = URL.createObjectURL(file);

      this.selectedImages.push({
        id: Date.now() + Math.random(),
        file,
        preview,
      });
    });

    input.value = '';
  }

  removeImage(index: number): void {
    const image = this.selectedImages[index];

    URL.revokeObjectURL(image.preview);

    this.selectedImages.splice(index, 1);
  }

  saveProduct(): void {
    console.log(this.productForm.value)
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();

      return;
    }

    const formData = new FormData();

    formData.append('name', this.productForm.value.name);

    formData.append('category', this.productForm.value.category);

    formData.append('price', this.productForm.value.price.toString());

    formData.append('condition', this.productForm.value.condition);

    formData.append('description', this.productForm.value.description);

    if (this.productForm.value.availability) {
      formData.append('availability', this.productForm.value.availability);
    }

    // Añadir las imágenes
    for (const image of this.selectedImages) {
      formData.append('images', image.file);
    }

    this.confirm(formData)
    
  }

  closeModal(): void {
    this.close();
  }
}
