import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SharedService } from '../../services/shared.service';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

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
  isLoggedIn = true;

  sharedService = inject(SharedService);
  authService = inject(AuthService);
  router = inject(Router);

  items = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
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
    this.isLoggedIn = this.authService.isLoggedIn();
  }

  toggleSidebar() {
    this.sharedService.changeSidebarState(true);
  }

  signOut() {
    this.authService.signOut().subscribe({
      next: () => {
        this.router.navigate(['/auth']);
        this.isLoggedIn = false;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
