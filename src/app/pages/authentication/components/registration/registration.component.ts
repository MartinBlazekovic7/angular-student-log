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

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RippleModule,
    InputTextModule,
    ButtonModule,
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  @Output() goToLogin: EventEmitter<any> = new EventEmitter();

  authService = inject(AuthService);
  fb = inject(UntypedFormBuilder);
  router = inject(Router);
  dataService = inject(DataService);
  sharedService = inject(SharedService);

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
    this.sharedService.show();
    const registerFormModel: RegisterForm = this.registerForm.value;
    const { email, firstName, lastName } = registerFormModel;

    if (
      !this.registerForm.valid ||
      !registerFormModel.email ||
      !registerFormModel.password ||
      !registerFormModel.firstName ||
      !registerFormModel.lastName
    ) {
      this.sharedService.hide();
      this.registerForm.markAllAsTouched();
      return;
    }

    this.authService
      .registerWithEmail(registerFormModel)
      .pipe(
        switchMap(({ user: { uid } }) =>
          this.dataService.addData(Collections.USERS, {
            uid,
            email,
            firstName,
            lastName,
          })
        )
      )
      .subscribe({
        next: () => {
          this.sharedService.hide();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.sharedService.hide();
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
