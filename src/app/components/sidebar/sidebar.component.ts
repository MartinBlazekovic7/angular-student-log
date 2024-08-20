import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { SidebarService } from '../../services/sidebar.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    SidebarModule,
    AvatarModule,
    ButtonModule,
    RippleModule,
    RouterModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;

  sidebarVisible: boolean = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.currentSidebarState.subscribe((state) => {
      this.sidebarVisible = state;
    });
  }

  closeSidebar(): void {
    this.sidebarService.changeSidebarState(false);
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }
}
