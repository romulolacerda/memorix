import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'decks', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [publicGuard],
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent) },
      { path: 'cadastro', loadComponent: () => import('./features/auth/register').then(m => m.RegisterComponent) },
      { path: 'esqueci-a-senha', loadComponent: () => import('./features/auth/forgot-password').then(m => m.ForgotPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  { 
    path: 'auth/reset-password', 
    loadComponent: () => import('./features/auth/reset-password').then(m => m.ResetPasswordComponent) 
  },
  { 
    path: '', 
    loadComponent: () => import('./layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
        { path: 'home', loadComponent: () => import('./features/dashboard/home').then(m => m.HomeComponent) },
        { path: 'decks', loadComponent: () => import('./features/decks/decks').then(m => m.DecksComponent) },
        { path: 'decks/new', loadComponent: () => import('./features/decks/create-deck').then(m => m.CreateDeckComponent) },
        { path: 'decks/:id', loadComponent: () => import('./features/decks/deck-details').then(m => m.DeckDetailsComponent) },
        { path: 'stats', loadComponent: () => import('./features/statistics/stats').then(m => m.StatsComponent) },
        { path: 'create', loadComponent: () => import('./features/flashcards/create-card').then(m => m.CreateCardComponent) },
        { path: 'cards/edit/:id', loadComponent: () => import('./features/flashcards/edit-card').then(m => m.EditCardComponent) },
        { path: 'import', loadComponent: () => import('./features/import/import').then(m => m.ImportComponent) }
    ]
  },
  { 
    path: 'study/:id', 
    loadComponent: () => import('./features/review/study').then(m => m.StudyComponent),
    canActivate: [authGuard]
  }
];

