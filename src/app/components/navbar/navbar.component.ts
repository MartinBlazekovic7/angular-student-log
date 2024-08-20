import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenubarModule } from 'primeng/menubar';
import { SidebarService } from '../../services/sidebar.service';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MenubarModule, ButtonModule, AvatarModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(private sidebarService: SidebarService) {}

  toggleSidebar() {
    this.sidebarService.changeSidebarState(true); // or false depending on what you need
  }
}
