import { Component } from '@angular/core';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { Container } from "../../general/container/container";
import {MatButtonModule} from '@angular/material/button';
import { AuthService } from '../../../services/auth-service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [MatSelectModule, MatInputModule, MatFormFieldModule, Container, MatButtonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  form: FormGroup;

  constructor(private readonly authService: AuthService, private fb: FormBuilder) {
    this.form = this.fb.group({
      email: [''],
      password: ['']
    }); 
  }

  login(){
    console.log(this.form.value);
    this.authService.login({email: this.form.value.email, password: this.form.value.password}).subscribe({
      next: (response) => {
        if (response && response.token) {
          this.authService.setType(response.type);
          localStorage.setItem('token', response.token);
          window.location.reload();
        } else {
          console.error('Invalid response from login API');
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}
