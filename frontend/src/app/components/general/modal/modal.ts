import {
  Component,
  ComponentRef,
  Type,
  ViewChild,
  ViewContainerRef,
  signal
} from '@angular/core';
import { NgIf, NgStyle } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [
    NgStyle,
    NgIf
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  standalone: true
})
export class Modal {

  @ViewChild('modalContent', {
    read: ViewContainerRef,
    static: false
  })
  modalContent!: ViewContainerRef;

  show = signal(false);

  styles = signal<{ [key: string]: string }>({});

  private componentRef?: ComponentRef<any>;

  open<T>(
    component: Type<T>,
    styles: { [key: string]: string } = {},
    data: Partial<T> = {}
  ): Promise<any> {

    this.styles.set(styles);
    this.show.set(true);

    return new Promise((resolve, reject) => {

      setTimeout(() => {

        if (!this.modalContent) {
          reject();
          return;
        }

        // Limpia el contenido anterior
        this.modalContent.clear();

        // Crea el nuevo componente dinámicamente
        this.componentRef =
          this.modalContent.createComponent(component);

        // Inyecta los datos iniciales
        Object.assign(
          this.componentRef.instance,
          data
        );

        // Inyecta las funciones de control del modal
        this.componentRef.instance.close = () => {
          this.close();
          reject();
        };

        this.componentRef.instance.confirm = (result?: any) => {
          this.close();
          resolve(result);
        };

      });

    });
  }

  close(): void {

    if (this.modalContent) {
      this.modalContent.clear();
    }

    this.componentRef = undefined;

    this.show.set(false);
  }
}