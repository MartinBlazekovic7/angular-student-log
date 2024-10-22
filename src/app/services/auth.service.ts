import { AngularFireAuth } from '@angular/fire/compat/auth';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import {
  Auth,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { RegisterForm } from '../interfaces/forms.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  auth = inject(Auth);
  fireAuth = inject(AngularFireAuth);

  private authStatusSubject = new BehaviorSubject<User | null>(null);
  authStatus$: Observable<User | null> = this.authStatusSubject.asObservable();

  constructor() {
    this.authStatusListener();
  }

  authStatusListener() {
    this.fireAuth.onAuthStateChanged((user) => {
      this.authStatusSubject.next((user as User) || null);
      /* if (user) {
        console.log(user);
        console.log('User is logged in');
      } else {
        console.log('User is logged out');
      } */
    });
  }

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
