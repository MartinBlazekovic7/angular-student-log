import { inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  UserCredential,
} from '@angular/fire/auth';
import { RegisterForm } from '../interfaces/forms.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth = inject(Auth);

  signInWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  signInWithEmailAndPassword(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signOut(): Observable<any> {
    return from(this.auth.signOut());
  }

  isLoggedIn(): boolean {
    return !!this.auth.currentUser;
  }

  registerWithEmail(
    registerFormModel: RegisterForm
  ): Observable<UserCredential> {
    return from(
      createUserWithEmailAndPassword(
        this.auth,
        registerFormModel.email,
        registerFormModel.password
      )
    );
  }
}
