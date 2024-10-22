import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Sidebar, SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { SharedService } from '../../services/shared.service';
import { RouterModule } from '@angular/router';
import { UserProfile } from '../../interfaces/user.interface';

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
  @Input() user?: UserProfile | null = null;

  sidebarVisible: boolean = false;

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    this.sharedService.currentSidebarState.subscribe((state) => {
      this.sidebarVisible = state;
    });
  }

  closeSidebar(): void {
    this.sharedService.changeSidebarState(false);
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }
}
