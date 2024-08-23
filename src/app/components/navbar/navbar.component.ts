import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SharedService } from '../../services/shared.service';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserProfile } from '../../interfaces/user.interface';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @Input() user?: UserProfile | null = null;

  isLoggedIn = true;

  sharedService = inject(SharedService);
  authService = inject(AuthService);
  router = inject(Router);

  items = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => {
        this.redirectTo('profile');
      },
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => {
        this.redirectTo('settings');
      },
    },
    {
      label: 'Sign out',
      icon: 'pi pi-sign-out',
      command: () => {
        this.signOut();
      },
    },
  ];

  ngOnInit() {
    this.authService.authStatus$.subscribe((user) => {
      this.isLoggedIn = !!user;
    });
  }

  toggleSidebar() {
    this.sharedService.changeSidebarState(true);
  }

  redirectTo(route: string) {
    this.router.navigate([route]);
  }

  signOut() {
    this.sharedService.showLoader();
    this.authService.signOut().subscribe({
      next: () => {
        this.sharedService.hideLoader();
        this.router.navigate(['/auth']);
        this.isLoggedIn = false;
      },
      error: (error) => {
        this.sharedService.hideLoader();
        console.error(error);
      },
    });
  }
}
