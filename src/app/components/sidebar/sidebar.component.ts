import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    AvatarModule,
    ButtonModule,
    RippleModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

  sidebarVisible: boolean = false;
}
