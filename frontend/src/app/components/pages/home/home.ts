import { Component } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { Container } from "../../general/container/container";

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, MatCardModule, Container],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
