import { Component } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButton } from '@angular/material/button';
import { AuthService } from '../../../services/auth-service';
import { firstValueFrom } from 'rxjs';
import { ImagesService } from '../../../services/images-service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, MatSidenavModule, MatButton, NgIf, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isOpen: boolean = false;
  isLogged: boolean = false;
  drawerMode: 'side' | 'over' = 'side';
  user!: User;

  constructor(
    private readonly authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    private imagesService: ImagesService,
  ) {}

  async ngOnInit() {
    this.isLogged = this.authService.isLoggedIn();
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      if (result.matches) {
        this.drawerMode = 'over';
        this.isOpen = false; // se cierra al cambiar a móvil
      } else {
        this.drawerMode = 'side';
      }
    });

    if (this.authService.getToken()) {
      if (this.authService.getToken()) {
        const userObservable = this.authService.getUserByToken();

        if (userObservable) {
          this.user = (await firstValueFrom(userObservable)) || null;
        }
      }
    } else {
    }
  }

  gotTo(url: string) {
    this.router.navigate([url]);
  }

  open() {
    this.isOpen = !this.isOpen;
  }

  onDrawerClosed() {
    this.isOpen = false;
  }

  async closeSession() {
    await this.authService.logout();
    window.location.reload();
    this.isOpen = false;
  }
}
