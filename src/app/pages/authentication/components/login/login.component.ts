import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { SharedService } from '../../../../services/shared.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FirebaseErrorHelper } from '../../../../helpers/firebase-error.helper';
import { of, switchMap } from 'rxjs';
import { Collections } from '../../../../enums/collections.enum';
import { DataService } from '../../../../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    RouterModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService],
})
export class LoginComponent {
  @Output() goToRegistration: EventEmitter<any> = new EventEmitter();

  authService = inject(AuthService);
  fb = inject(UntypedFormBuilder);
  router = inject(Router);
  sharedService = inject(SharedService);
  messageService = inject(MessageService);
  dataService = inject(DataService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  goToRegistrationCall() {
    this.goToRegistration.emit(true);
  }

  signInWIthGoogle() {
    this.sharedService.showLoader();
    this.authService
      .signInWithGoogle()
      .pipe(
        switchMap(({ user: { uid, displayName, email, photoURL } }) =>
          this.dataService.getDocument(Collections.USERS, uid).pipe(
            switchMap((existingUser) => {
              if (existingUser) {
                return of(existingUser);
              } else {
                return this.dataService.addData(Collections.USERS, {
                  uid,
                  firstName: displayName.split(' ')[0],
                  lastName: displayName.split(' ')[1],
                  email,
                  photoURL,
                  isAdmin: false,
                  isStudent: false,
                  isGoogle: true,
                  details: {
                    dateOfBirth: '',
                    address: '',
                    university: '',
                    degree: '',
                    companyName: '',
                    phoneNumber: '',
                  },
                  settings: {
                    darkMode: false,
                    language: 'en',
                  },
                });
              }
            })
          )
        )
      )
      .subscribe({
        next: (response) => {
          console.log(response);
          this.sharedService.hideLoader();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.sharedService.hideLoader();
          this.messageService.add({
            severity: 'danger',
            summary: 'Error',
            detail: FirebaseErrorHelper.getErrorMessage(error.message),
          });
          console.error(error);
        },
      });
  }

  signInWithEmailAndPassword() {
    this.sharedService.showLoader();
    const { email, password } = this.loginForm.value;

    if (!this.loginForm.valid || !email || !password) {
      this.sharedService.hideLoader();
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.signInWithEmailAndPassword(email, password).subscribe({
      next: () => {
        this.sharedService.hideLoader();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.sharedService.hideLoader();
        this.messageService.add({
          severity: 'danger',
          summary: 'Error',
          detail: FirebaseErrorHelper.getErrorMessage(error.message),
        });
        console.error(error);
      },
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
