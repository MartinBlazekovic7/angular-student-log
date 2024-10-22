import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SharedService } from '../../services/shared.service';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserProfile } from '../../interfaces/user.interface';
import { filter, map } from 'rxjs';
import { Title } from '@angular/platform-browser';

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
  activatedRoute = inject(ActivatedRoute);
  titleService = inject(Title);

  pageTitle = '';

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

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        map((route) => route.snapshot.data['title'])
      )
      .subscribe((pageTitle: string) => {
        if (pageTitle) {
          this.pageTitle = pageTitle;
          this.titleService.setTitle(`StudentLog - ${pageTitle}`);
        }
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
