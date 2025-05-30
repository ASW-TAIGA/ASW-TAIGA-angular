import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs/operators'; // if using observables from authService
import { toObservable } from '@angular/core/rxjs-interop'; // to convert signal to observable

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If isAuthenticated is a signal:
  if (authService.isAuthenticated()) {
    return true;
  } else {
    router.navigate(['/users']); // Redirect to user selection if not authenticated
    return false;
  }

  // If isAuthenticated were an Observable<boolean>:
  // return toObservable(authService.isAuthenticated).pipe( // Convert signal to observable
  //   map(isAuthenticated => {
  //     if (isAuthenticated) {
  //       return true;
  //     } else {
  //       router.navigate(['/users']);
  //       return false;
  //     }
  //   })
  // );
};
