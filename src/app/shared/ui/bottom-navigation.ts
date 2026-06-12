import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bottom-navigation',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="bg-surface absolute bottom-0 w-full z-50 rounded-t-[24px] shadow-[0_-4px_30px_rgba(0,0,0,0.08)] flex justify-around items-center px-2 pt-3 border-t border-outline/30" style="padding-bottom: calc(1.25rem + env(safe-area-inset-bottom));">
        <a routerLink="/home" routerLinkActive="text-primary font-bold" [routerLinkActiveOptions]="{exact: true}" class="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-2 transition-all active:scale-95 duration-200">
            <mat-icon class="mb-1 text-[28px] !w-[28px] !h-[28px]">home</mat-icon>
            <span class="text-[11px]">Início</span>
        </a>
        <a routerLink="/decks" routerLinkActive="text-primary font-bold" class="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-2 transition-all active:scale-95 duration-200">
            <mat-icon class="mb-1 text-[28px] !w-[28px] !h-[28px]">style</mat-icon>
            <span class="text-[11px]">Decks</span>
        </a>
        <a routerLink="/create" class="flex-1 flex flex-col items-center justify-center -mt-8 relative z-10 transition-transform active:scale-95">
            <div class="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center border-4 border-surface">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
            </div>
        </a>
        <a routerLink="/import" routerLinkActive="text-primary font-bold" class="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-2 transition-all active:scale-95 duration-200">
            <mat-icon class="mb-1 text-[28px] !w-[28px] !h-[28px]">upload</mat-icon>
            <span class="text-[11px]">Importar</span>
        </a>
        <a routerLink="/stats" routerLinkActive="text-primary font-bold" class="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-2 transition-all active:scale-95 duration-200">
            <mat-icon class="mb-1 text-[28px] !w-[28px] !h-[28px]">insights</mat-icon>
            <span class="text-[11px]">Stats</span>
        </a>
    </nav>
  `
})
export class BottomNavigationComponent {}
