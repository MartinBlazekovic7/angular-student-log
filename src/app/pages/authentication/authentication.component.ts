import { Component } from '@angular/core';
import { LoginComponent } from './components/login/login.component';
import { RegistrationComponent } from './components/registration/registration.component';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [LoginComponent, RegistrationComponent],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
})
export class AuthenticationComponent {
  inRegistration = false;

  goToRegistration(event: any) {
    this.inRegistration = event;
  }

  goToLogin(event: any) {
    this.inRegistration = event;
  }
}
