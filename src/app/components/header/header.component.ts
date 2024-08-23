import { Component, inject, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { Collections } from '../../enums/collections.enum';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { UserProfile } from '../../interfaces/user.interface';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  authService = inject(AuthService);
  dataService = inject(DataService);

  user: UserProfile | null = null;

  ngOnInit() {
    this.authService.authStatus$.subscribe((user) => {
      if (!user) return;

      this.dataService
        .getData(Collections.USERS, user?.uid)
        .subscribe((userData) => {
          if (!userData) return;

          this.user = userData as UserProfile;
        });
    });
  }
}
