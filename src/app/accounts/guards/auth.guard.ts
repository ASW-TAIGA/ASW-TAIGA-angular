import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AccountService } from '../data-access/account.service';
import { ToastrService } from 'ngx-toastr'; // Assuming ngx-toastr

/**
 * Functional route guard to check if a user is "authenticated" (has an API key selected).
 * If not authenticated, it redirects to the user selection page.
 * @param route The activated route snapshot.
 * @param state The router state snapshot.
 * @returns An Observable<boolean | UrlTree>, a Promise<boolean | UrlTree>, or boolean | UrlTree.
 */
export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
  const accountService = inject(AccountService);
  const router = inject(Router);
  const toastrService = inject(ToastrService);

  return accountService.isAuthenticated$.pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        toastrService.info('Please select a user to continue.', 'Authentication Required');
        return router.createUrlTree(['/accounts/select-user']);
      }
    })
  );
};
