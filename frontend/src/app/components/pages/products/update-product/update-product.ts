import { Component, Input, OnInit, signal } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Condition } from '../../../../enums/condition';
import { Availability } from '../../../../enums/availability';

import { Container } from '../../../general/container/container';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { getImage } from '../../../../services/utilities-service';

@Component({
  selector: 'app-update-product',
  imports: [
    ReactiveFormsModule,
    Container,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './update-product.html',
  styleUrl: './update-product.css',
})
export class UpdateProduct implements OnInit {

  @Input() item: any;

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

  isSaving = signal(false);

  existingImages = signal<string[]>([]);

  selectedImages = signal<
    {
      id: number;
      file: File;
      preview: string;
    }[]
  >([]);

  confirm!: (result?: any) => void;

  close!: () => void;

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      condition: ['', Validators.required],
      availability: [Availability.AVAILABLE, Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.item) {
      return;
    }

    this.productForm.patchValue({
      name: this.item.name,
      description: this.item.description,
      price: this.item.price,
      category: this.item.category,
      condition: this.item.condition,
      availability: this.item.availability,
    });

    this.existingImages.set(this.item.images ?? []);
  }

  updateProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);

    const product = this.productForm.value;

    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('category', product.category);
    formData.append('price', product.price.toString());
    formData.append('condition', product.condition);
    formData.append('description', product.description);
    formData.append('availability', product.availability);

    // Imágenes existentes que se conservan
    for (const image of this.existingImages()) {
      formData.append('existingImages', image);
    }

    // Imágenes nuevas
    for (const image of this.selectedImages()) {
      formData.append('images', image.file);
    }

    this.confirm(formData);

    this.isSaving.set(false);
  }

  closeModal(): void {
    this.close();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const currentImages =
      this.existingImages().length +
      this.selectedImages().length;

    const availableSlots = 8 - currentImages;

    const files = Array.from(input.files).slice(0, availableSlots);

    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
    }));

    this.selectedImages.update(images => [
      ...images,
      ...newImages,
    ]);

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

  removeExistingImage(image: string): void {
    this.existingImages.update(images =>
      images.filter(item => item !== image)
    );
  }

  getNewImage(name: string): string {
    return getImage(name);
  }
}