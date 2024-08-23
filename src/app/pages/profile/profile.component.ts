import { setDoc } from '@angular/fire/firestore';
import { Collections } from './../../enums/collections.enum';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { HttpClientModule } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { UserProfile } from '../../interfaces/user.interface';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { SharedService } from '../../services/shared.service';
import { ImageUploadService } from '../../services/image-upload.service';
import { switchMap } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RippleModule } from 'primeng/ripple';

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
    DialogModule,
    InputTextModule,
    TooltipModule,
    ConfirmDialogModule,
    RippleModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  providers: [MessageService, ConfirmationService],
})
export class ProfileComponent implements OnInit {
  messageService = inject(MessageService);
  dataService = inject(DataService);
  authService = inject(AuthService);
  fb = inject(UntypedFormBuilder);
  sharedService = inject(SharedService);
  imageUploadService = inject(ImageUploadService);
  confirmationService = inject(ConfirmationService);

  userForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [''],
    university: [''],
    degree: [''],
    companyName: [''],
    hourlyRate: [''],
  });

  user: UserProfile | null = null;

  dialogVisible = false;

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

  onUpload(event: any) {
    this.sharedService.showLoader();

    const uid = this.user?.uid ?? '';

    if (!uid) {
      return;
    }

    this.imageUploadService
      .uploadImage(event.files[0], `images/profile/${uid}`)
      .pipe(
        switchMap((photoURL: string) => {
          this.user = { ...(this.user as UserProfile), photoURL: photoURL };
          return this.dataService.updateUser(this.user as UserProfile);
        })
      )
      .subscribe({
        next: () => {
          this.sharedService.hideLoader();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Successfully uploaded profile image.',
          });
        },
        error: (error) => {
          this.sharedService.hideLoader();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'There was an error in uploading the profile image.',
          });
          console.error(error);
        },
      });
  }

  confirmDialog(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to remove this image?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.removeImage();
      },
      reject: () => {},
    });
  }

  removeImage() {
    this.sharedService.showLoader();
    this.dataService
      .removeImage(this.user?.uid ?? '')
      .pipe(
        switchMap(() => {
          return this.imageUploadService.deleteImage(
            `images/profile/${this.user?.uid}`
          );
        })
      )
      .subscribe({
        next: () => {
          this.sharedService.hideLoader();
          this.user = { ...(this.user as UserProfile), photoURL: '' };
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Profile image removed.',
          });
        },
        error: (error) => {
          this.sharedService.hideLoader();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'There was an error in removing the profile image.',
          });
          console.error(error);
        },
      });
  }

  openEditDialog() {
    this.dialogVisible = true;
    this.userForm.patchValue({
      firstName: this.user?.firstName ?? '',
      lastName: this.user?.lastName ?? '',
      email: this.user?.email ?? '',
      university: this.user?.details.university ?? '',
      degree: this.user?.details.degree ?? '',
      companyName: this.user?.details.companyName ?? '',
      hourlyRate: this.user?.details.hourlyRate ?? '',
    });
  }

  closeEditDialog() {
    this.userForm.reset();
    this.dialogVisible = false;
  }

  updateUser() {
    if (!this.userForm.valid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'First and last name are required fields.',
      });
      return;
    }

    this.sharedService.showLoader();

    const updatedUser: UserProfile = {
      uid: this.user?.uid ?? '',
      firstName: this.firstName.value ?? '',
      lastName: this.lastName.value,
      email: this.user?.email ?? '',
      photoURL: this.user?.photoURL ?? '',
      details: {
        university: this.university.value,
        degree: this.degree.value,
        companyName: this.companyName.value,
        hourlyRate: this.hourlyRate.value,
      },
      settings: this.user?.settings ?? {
        darkMode: false,
        language: 'en',
      },
    };

    this.dataService.updateUser(updatedUser).subscribe({
      next: () => {
        this.sharedService.hideLoader();
        this.userForm.reset();
        this.dialogVisible = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User updated successfully.',
        });
      },
      error: (error) => {
        this.sharedService.hideLoader();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'There was an error in updating the user.',
        });
        console.error(error);
      },
    });
  }

  get firstName() {
    return this.userForm.get('firstName')!;
  }

  get lastName() {
    return this.userForm.get('lastName')!;
  }

  get university() {
    return this.userForm.get('university')!;
  }

  get degree() {
    return this.userForm.get('degree')!;
  }

  get companyName() {
    return this.userForm.get('companyName')!;
  }

  get hourlyRate() {
    return this.userForm.get('hourlyRate')!;
  }
}
