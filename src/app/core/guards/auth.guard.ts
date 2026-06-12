import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  // Aguarda até que a inicialização termine para evitar redirecionamentos em falso (flickering)
  return toObservable(sessionService.isInitializing).pipe(
    filter(isInit => !isInit),
    take(1),
    map(() => {
      if (!sessionService.isLoggedIn()) {
        return router.createUrlTree(['/auth/login']);
      }
      return true;
    })
  );
};
