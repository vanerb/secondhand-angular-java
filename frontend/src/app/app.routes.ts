import { Routes } from '@angular/router';
import { Home } from './components/pages/home/home';
import { Login } from './components/pages/login/login';
import { Register } from './components/pages/register/register';
import { Chat } from './components/pages/chat/chat';
import { Profile } from './components/pages/profile/profile';
import { Favorites } from './components/pages/favorites/favorites';
import { Products } from './components/pages/products/products';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'favorites', component: Favorites },
   { path: 'products', component: Products },
  { path: 'chats', component: Chat },
  { path: 'profile', component: Profile },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: '**', redirectTo: 'home' },
];
