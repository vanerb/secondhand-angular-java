import {Injectable, Type} from '@angular/core';
import {Modal} from '../components/general/modal/modal';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalRef?: Modal;

  register(modal: Modal) {
    this.modalRef = modal;
  }

  open<T>(
    component: Type<T>,
    styles: { [key: string]: string } = {},
    data: Partial<T> = {}
  ): Promise<any> {
    return this.modalRef!.open(component, styles, data);
  }

  close() {
    this.modalRef?.close();
  }
}