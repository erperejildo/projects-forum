import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '../services/auth';

export const authRequiredGuard: CanActivateFn = () => {
  const auth = inject(Auth);

  if (auth.isAuthenticated()) {
    return true;
  }

  return inject(Router).createUrlTree(['/'], {
    queryParams: { auth: 'required' },
  });
};
