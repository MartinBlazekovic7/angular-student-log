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
    },
    { validators: passwordsMatchValidator() }
  );

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
            details: {
              dateOfBirth: '',
              address: '',
              university: '',
              degree: '',
              companyName: '',
              phoneNumber: '',
            },
          })
        )
      )
      .subscribe({
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
}
