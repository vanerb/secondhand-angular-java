import { Component, Input, OnInit } from '@angular/core';
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
  isSaving: boolean = false;
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

  existingImages: string[] = [];

  selectedImages: {
    id: number;
    file: File;
    preview: string;
  }[] = [];

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
    this.productForm.patchValue({
      name: this.item.name,
      description: this.item.description,
      price: this.item.price,
      category: this.item.category,
      condition: this.item.condition,
      availability: this.item.availability,
    });

    this.existingImages = this.item.images ?? [];
  }

  updateProduct(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const formData = new FormData();

    formData.append('name', this.productForm.value.name);
    formData.append('category', this.productForm.value.category);
    formData.append('price', this.productForm.value.price.toString());
    formData.append('condition', this.productForm.value.condition);
    formData.append('description', this.productForm.value.description);
    formData.append('availability', this.productForm.value.availability);

    // =========================================================
    // IMÁGENES ANTIGUAS QUE SE CONSERVAN
    // =========================================================

    for (const image of this.existingImages) {
      formData.append('existingImages', image);
    }

    // =========================================================
    // IMÁGENES NUEVAS
    // =========================================================

    for (const image of this.selectedImages) {
      formData.append('images', image.file);
    }

    this.confirm(formData);

    this.isSaving = false;
  }

  closeModal() {
    this.close();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files) {
      return;
    }

    const currentImages = this.existingImages.length + this.selectedImages.length;

    const availableSlots = 8 - currentImages;

    const files = Array.from(input.files).slice(0, availableSlots);

    files.forEach((file) => {
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

 removeExistingImage(image: string): void {
  this.existingImages = this.existingImages.filter(
    (item) => item !== image
  );
}

  getNewImage(name: string) {
    return getImage(name);
  }
}
