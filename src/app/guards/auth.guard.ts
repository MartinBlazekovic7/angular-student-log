import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const user = await auth.currentUser;

  const isLoggedIn = !!user;
  return isLoggedIn ? true : router.createUrlTree(['/']);
};
