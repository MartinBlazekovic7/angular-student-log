import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../../services/auth.service';
import { switchMap } from 'rxjs';
import { RegisterForm } from '../../../../interfaces/forms.interface';
import { DataService } from '../../../../services/data.service';
import { Collections } from '../../../../enums/collections.enum';
import { passwordsMatchValidator } from '../../../../utils/validators';
import { SharedService } from '../../../../services/shared.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FirebaseErrorHelper } from '../../../../helpers/firebase-error.helper';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RippleModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    SelectButtonModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
  providers: [MessageService],
})
export class RegistrationComponent {
  @Output() goToLogin: EventEmitter<any> = new EventEmitter();

  authService = inject(AuthService);
  fb = inject(UntypedFormBuilder);
  router = inject(Router);
  dataService = inject(DataService);
  sharedService = inject(SharedService);
  messageService = inject(MessageService);

  registerForm = this.fb.group(
    {
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      userType: ['student', Validators.required],
    },
    { validators: passwordsMatchValidator() }
  );

  stateOptions: any[] = [
    { label: 'Student', value: 'student' },
    { label: 'Administrator', value: 'administrator' },
  ];

  goToLoginCall() {
    this.goToLogin.emit(false);
  }

  registerWithEmail() {
    this.sharedService.showLoader();
    const registerFormModel: RegisterForm = this.registerForm.value;
    const { email, firstName, lastName } = registerFormModel;

    if (
      !this.registerForm.valid ||
      !registerFormModel.email ||
      !registerFormModel.password ||
      !registerFormModel.firstName ||
      !registerFormModel.lastName
    ) {
      this.sharedService.hideLoader();
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService
      .registerWithEmail(registerFormModel)
      .pipe(
        switchMap(({ user: { uid, photoURL } }) =>
          this.dataService.addData(Collections.USERS, {
            uid,
            email,
            firstName,
            lastName,
            photoURL,
            isAdmin: this.userType === 'administrator',
            isStudent: this.userType === 'student',
            isGoogle: false,
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
          })
        )
      )
      .subscribe({
        next: () => {
          this.sharedService.hideLoader();
          if (this.userType === 'administrator') {
            this.router.navigate(['/teams']);
            return;
          }

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

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get userType() {
    return this.registerForm.get('userType')!.value;
  }
}
