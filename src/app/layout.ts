import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { IconComponent } from './shared/ui/icon.component';
import { BottomNavigationComponent } from './shared/ui/bottom-navigation';
import { StudyLogRepository } from './core/repositories/study-log.repository';
import { AuthRepository } from './core/repositories/auth.repository';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, IconComponent, BottomNavigationComponent],
  template: `
    <div class="mx-auto w-full max-w-[412px] h-[100dvh] bg-background shadow-2xl flex flex-col relative overflow-hidden sm:border-x sm:border-outline/20">
        
        <!-- Header -->
        <header class="bg-surface/80 backdrop-blur-md w-full sticky top-0 z-40 border-b border-outline/30 px-4 py-3 flex justify-between items-center">
            <h1 class="font-bold text-[22px] text-primary tracking-[-0.05em] uppercase">Memorix</h1>
            <div class="flex items-center gap-3">
                <div aria-label="Sua ofensiva" class="bg-orange-100 text-orange-600 font-bold text-[13px] px-2 py-1 rounded-md flex items-center justify-center gap-1 cursor-default">
                    <app-icon name="local_fire_department" [isFilled]="true" class="text-[16px]"></app-icon> {{ streak() }}
                </div>
                <button (click)="logout()" aria-label="Sair" class="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95" title="Sair">
                    <app-icon name="logout" class="text-[20px] !w-[20px] !h-[20px]"></app-icon>
                </button>
            </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto w-full hide-scrollbar pb-24">
            <router-outlet></router-outlet>
        </main>

        <!-- Bottom Navigation -->
        <app-bottom-navigation></app-bottom-navigation>
    </div>
  `
})
export class LayoutComponent implements OnInit {
    private studyLogRepo = inject(StudyLogRepository);
    private authRepo = inject(AuthRepository);
    private router = inject(Router);

    streak = signal<number>(0);

    async ngOnInit() {
        try {
            const currentStreak = await this.studyLogRepo.getStreak();
            this.streak.set(currentStreak);
        } catch (e) {
            console.error('Failed to load streak', e);
        }
    }

    async logout() {
        try {
            await this.authRepo.signOut();
            this.router.navigate(['/auth/login']);
        } catch (e) {
            console.error('Erro ao deslogar', e);
        }
    }
}

