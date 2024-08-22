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

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  goToRegistrationCall() {
    this.goToRegistration.emit(true);
  }

  signInWIthGoogle() {
    this.sharedService.show();
    this.authService.signInWithGoogle().subscribe({
      next: () => {
        this.sharedService.hide();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.sharedService.hide();
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
    this.sharedService.show();
    const { email, password } = this.loginForm.value;

    if (!this.loginForm.valid || !email || !password) {
      this.sharedService.hide();
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.signInWithEmailAndPassword(email, password).subscribe({
      next: () => {
        this.sharedService.hide();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.sharedService.hide();
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
