import { Component, signal } from '@angular/core';

import {
  form,
  FormField,
  required,
  min,
} from '@angular/forms/signals';

import { Condition } from '../../../../enums/condition';
import { Availability } from '../../../../enums/availability';

import { Container } from '../../../general/container/container';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

interface ProductFormModel {
  name: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  availability: string;
}

@Component({
  selector: 'app-create-product',
  imports: [
    Container,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormField,
  ],
  templateUrl: './create-product.html',
  styleUrl: './create-product.css',
})
export class CreateProduct {

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

  productModel = signal<ProductFormModel>({
    name: '',
    description: '',
    price: 0,
    category: '',
    condition: '',
    availability: Availability.AVAILABLE,
  });

  productForm = form(
    this.productModel,
    (schema) => {
      required(schema.name);
      required(schema.description);
      required(schema.price);
      min(schema.price, 0);
      required(schema.category);
      required(schema.condition);
      required(schema.availability);
    }
  );

  selectedImages = signal<
    {
      id: number;
      file: File;
      preview: string;
    }[]
  >([]);

  confirm!: (result?: any) => void;

  close!: () => void;

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const files = Array.from(input.files);

    const availableSlots = 8 - this.selectedImages().length;

    files.slice(0, availableSlots).forEach((file) => {
      const preview = URL.createObjectURL(file);

      this.selectedImages.update(images => [
        ...images,
        {
          id: Date.now() + Math.random(),
          file,
          preview,
        },
      ]);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    const image = this.selectedImages()[index];

    if (!image) {
      return;
    }

    URL.revokeObjectURL(image.preview);

    this.selectedImages.update(images =>
      images.filter((_, i) => i !== index)
    );
  }

  saveProduct(): void {
    if (this.productForm().invalid()) {
      return;
    }

    const product = this.productModel();

    console.log(product);

    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('price', product.price.toString());
    formData.append('condition', product.condition);
    formData.append('description', product.description);
    formData.append('availability', product.availability);

    for (const image of this.selectedImages()) {
      formData.append('images', image.file);
    }

    this.confirm(formData);
  }

  closeModal(): void {
    this.close();
  }
}