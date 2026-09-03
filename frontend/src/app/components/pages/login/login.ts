import { Component } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Container } from "../../general/container/container";
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-login',
  imports: [MatSelectModule, MatInputModule, MatFormFieldModule, Container, MatButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {}
