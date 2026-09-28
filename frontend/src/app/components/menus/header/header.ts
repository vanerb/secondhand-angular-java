import { Component, OnInit, signal } from '@angular/core';
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
export class Header implements OnInit {

  isOpen = signal(false);

  isLogged = signal(false);

  drawerMode = signal<'side' | 'over'>('side');

  user = signal<any | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly breakpointObserver: BreakpointObserver,
  ) {}

  async ngOnInit(): Promise<void> {

    this.isLogged.set(
      this.authService.isLoggedIn()
    );

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => {

        if (result.matches) {

          this.drawerMode.set('over');
          this.isOpen.set(false);

        } else {

          this.drawerMode.set('side');

        }

      });

    if (this.authService.getToken()) {

      const userObservable =
        this.authService.getUserByToken();

      if (userObservable) {

        const user =
          (await firstValueFrom(userObservable)) || null;

        this.user.set(user);

      }

    }
  }

  navigate(url: string): void {

    this.router.navigate([url]);

    if (this.drawerMode() === 'over') {
      this.isOpen.set(false);
    }
  }

  open(): void {
    this.isOpen.update(value => !value);
  }

  onDrawerClosed(): void {
    this.isOpen.set(false);
  }

  async closeSession(): Promise<void> {

    await this.authService.logout();

    await this.router.navigate(['login']);

    await sleep(500);

    window.location.reload();

    this.isOpen.set(false);
  }
}