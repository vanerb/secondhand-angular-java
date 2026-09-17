import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  url = 'http://localhost:8080/api/auth/';

  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  isLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined') {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  getToken() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  setType(type: string) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('type', type);
    }
  }

  deleteToken() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  deleteType() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('type');
    }
  }

  getType() {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('type');
    }
    return null;
  }

  login(data: any) {
    return this.http.post<any>(this.url + 'login', data, {});
  }

  register(data: any) {
    return this.http.post<any>(this.url + 'register', data, {});
  }

  logout() {
    if (typeof localStorage !== 'undefined') {
      this.deleteToken();
      this.deleteType();
    }
    this.router.navigate(['/login']);
  }

  getUserByToken() {
    const token = this.getToken();
    if (token) {
      return this.http.get<any>(this.url + 'user', {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return null;
  }

  update(formData: FormData) {
    const token = this.getToken();
    if (token) {
      return this.http.put<any>(this.url + 'update', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return null;
  }
}
