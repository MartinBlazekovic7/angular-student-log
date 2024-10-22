import { Component, inject, OnInit } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [LoginComponent, RegistrationComponent],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
})
export class AuthenticationComponent implements OnInit {
  inRegistration = false;

  authService = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.authService.authStatus$.subscribe((user) => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  goToRegistration(event: any) {
    this.inRegistration = event;
  }

  goToLogin(event: any) {
    this.inRegistration = event;
  }
}
