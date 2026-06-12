import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { SessionService } from '../services/session.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';

export const publicGuard: CanActivateFn = () => {
  const sessionService = inject(SessionService);
  const router = inject(Router);

  // Aguarda até que a inicialização termine
  return toObservable(sessionService.isInitializing).pipe(
    filter(isInit => !isInit),
    take(1),
    map(() => {
      if (sessionService.isLoggedIn()) {
        // Se já está logado, não tem por que ver tela de Login/Register
        return router.createUrlTree(['/decks']);
      }
      return true;
    })
  );
};
