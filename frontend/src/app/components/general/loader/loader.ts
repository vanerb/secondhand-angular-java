import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader',
  imports: [
    NgIf,
    MatProgressSpinner,
  ],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
  standalone: true,
})
export class Loader {
  @Input() text: string = '';
}