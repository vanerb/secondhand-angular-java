import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-warning-modal',
  imports: [
    NgIf,
    NgClass,
    MatButton,
  ],
  templateUrl: './warning-modal.html',
  styleUrl: './warning-modal.css',
  standalone: true,
})
export class WarningModal {
  props: any = {
    title: '',
    message: '',
    type: 'info',
  };

  confirm!: (result?: any) => void;
  close!: () => void;
}