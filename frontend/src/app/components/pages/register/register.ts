import { ChangeDetectorRef, Component } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Container } from '../../general/container/container';
import { MatButtonModule } from '@angular/material/button';
import { getImage } from '../../../services/utilities-service';

@Component({
  selector: 'app-register',
  imports: [Container, MatSelectModule, MatInputModule, MatFormFieldModule, MatButtonModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  selectedImagesCover: File[] = [];
  previewCoverImage!: string;

  constructor(private cd: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.previewCoverImage = getImage(null)
  }


  async onImageChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedImagesCover = [input.files[0]]; // reemplaza la anterior
    }

    // Generar vista previa
    const reader = new FileReader();
    reader.onload = () => {
      this.previewCoverImage = reader.result as string; // base64
    };
    reader.readAsDataURL(this.selectedImagesCover[0]);
    this.cd.detectChanges()
  }
}
