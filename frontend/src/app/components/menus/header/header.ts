import { Component } from '@angular/core';
import {NgClass, NgIf} from '@angular/common';
import { Router } from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatSidenavModule, MatButton, NgIf, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

  isOpen: boolean = false
  isLogged: boolean = false;
  drawerMode: 'side' | 'over' = 'side';
   user!: any

  constructor(private router: Router) {}
  

  gotTo(url: string) {

    this.router.navigate([url])
  }

  open() {
    this.isOpen = !this.isOpen
  }

  onDrawerClosed() {
    this.isOpen = false;
  }

   async closeSession() {
    //await this.authService.logout()
    window.location.reload();
    this.isOpen = false
  }
}
