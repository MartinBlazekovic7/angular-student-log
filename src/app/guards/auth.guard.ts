import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const authService = inject(AuthService);

  let isLoggedIn: boolean | null = null;

  authService.authStatus$.subscribe((user) => {
    isLoggedIn = !!user;
  });

  return isLoggedIn ? true : router.createUrlTree(['/']);
};
