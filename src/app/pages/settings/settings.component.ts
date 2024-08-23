import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { UserProfile, UserSettings } from '../../interfaces/user.interface';
import { Collections } from '../../enums/collections.enum';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { SharedService } from '../../services/shared.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    DividerModule,
    DropdownModule,
    InputTextModule,
    InputSwitchModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class SettingsComponent {
  authService = inject(AuthService);
  dataService = inject(DataService);
  sharedService = inject(SharedService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  user: UserProfile | null = null;

  settings: UserSettings = {
    darkMode: false,
    language: 'hr',
  };

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Croatian', value: 'hr' },
  ];

  ngOnInit() {
    this.authService.authStatus$.subscribe((user) => {
      if (!user) return;

      this.dataService
        .getData(Collections.USERS, user?.uid)
        .subscribe((userData) => {
          if (!userData) return;

          this.user = userData as UserProfile;
          this.settings = this.user.settings ?? {
            darkMode: false,
            language: 'hr',
          };
        });
    });
  }

  toggleDarkMode() {
    this.settings.darkMode = !this.settings.darkMode;
  }

  changeLanguage(event: any) {
    this.settings.language = event.value;
  }

  saveSettings() {
    if (!this.user) return;

    this.sharedService.showLoader();

    this.user.settings = this.settings;

    this.dataService.updateUser(this.user).subscribe({
      next: () => {
        this.sharedService.hideLoader();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Settings saved successfully.',
        });
      },
      error: (error) => {
        this.sharedService.hideLoader();
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: 'An error occurred while saving settings.',
        });
        console.error(error);
      },
    });
  }

  confirmDialog(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to confirm this settings change?',
      header: 'Settings change confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.saveSettings();
      },
      reject: () => {},
    });
  }
}
