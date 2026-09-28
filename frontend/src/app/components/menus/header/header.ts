import { ChangeDetectorRef, Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButton } from '@angular/material/button';
import { AuthService } from '../../../services/auth-service';
import { firstValueFrom } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { sleep } from '../../../services/utilities-service';

@Component({
  selector: 'app-header',
  imports: [MatSidenavModule, MatButton, NgIf],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  isOpen: boolean = false;
  isLogged: boolean = false;
  drawerMode: 'side' | 'over' = 'side';
  user!: any;

  constructor(
    private readonly authService: AuthService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,

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

  navigate(url: string) {
    this.router.navigate([url]);
    if (this.drawerMode === 'over') this.isOpen = false;
  }

  open() {
    this.isOpen = !this.isOpen;
  }

  onDrawerClosed() {
    this.isOpen = false;
  }

  async closeSession() {
    await this.authService.logout();
    await this.router.navigate(['login']);
    await sleep(500);
    window.location.reload();
    this.isOpen = false;
  }
}
