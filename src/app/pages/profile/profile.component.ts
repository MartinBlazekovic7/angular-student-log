import { Collections } from './../../enums/collections.enum';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../interfaces/user.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AvatarModule,
    ButtonModule,
    ToastModule,
    RouterModule,
    FileUploadModule,
    DividerModule,
    HttpClientModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [MessageService],
})
export class ProfileComponent implements OnInit {
  messageService = inject(MessageService);
  dataService = inject(DataService);
  authService = inject(AuthService);

  user: UserProfile | null = null;

  ngOnInit() {
    this.authService.authStatus$.subscribe((user) => {
      if (!user) return;

      this.dataService
        .getData(Collections.USERS, user?.uid)
        .subscribe((userData) => {
          if (!userData) return;

          this.user = userData as UserProfile;
          console.log(this.user);
        });
    });
  }

  onUpload(event: any) {
    this.messageService.add({
      severity: 'info',
      summary: 'File Uploaded',
      detail: '',
    });
  }

  openEditDialog() {
    // Open dialog
  }
}
