import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrimaryButtonComponent } from '../../shared/ui/primary-button';
import { AuthRepository } from '../../core/repositories/auth.repository';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PrimaryButtonComponent, IconComponent],
  template: `
    <div class="min-h-[100dvh] bg-surface-container flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      <!-- Decorative blobs -->
      <div class="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div class="bg-surface border border-outline/30 rounded-3xl p-8 shadow-sm w-full max-w-[400px] mx-auto relative z-10">
        
        <div class="text-center mb-8">
            <h1 class="text-[26px] font-bold text-on-surface tracking-tight mb-2">Criar conta</h1>
            <p class="text-[15px] text-on-surface-variant">Junte-se ao Memorix e alavanque seus estudos</p>
        </div>

        <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="flex flex-col gap-4">
          
          <div class="flex flex-col gap-1.5">
            <label class="text-[14px] font-bold text-on-surface ml-1">Nome de usuário</label>
            <input type="text" 
                   [(ngModel)]="name" 
                   name="name" 
                   required
                   placeholder="Como quer ser chamado?"
                   class="w-full bg-surface-container-low border border-outline/40 text-on-surface rounded-xl px-4 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50">
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[14px] font-bold text-on-surface ml-1">E-mail</label>
            <input type="email" 
                   [(ngModel)]="email" 
                   name="email" 
                   required
                   placeholder="seu@email.com"
                   class="w-full bg-surface-container-low border border-outline/40 text-on-surface rounded-xl px-4 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50">
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-[14px] font-bold text-on-surface ml-1">Senha</label>
            <div class="relative">
              <input [type]="showPassword() ? 'text' : 'password'" 
                     [(ngModel)]="password" 
                     name="password" 
                     required
                     minlength="6"
                     placeholder="No mínimo 6 caracteres"
                     class="w-full bg-surface-container-low border border-outline/40 text-on-surface rounded-xl pl-4 pr-12 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50">
              <button type="button" (click)="togglePassword()" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant p-1.5 rounded-full hover:bg-surface-container active:scale-95 transition-all">
                 <app-icon [name]="showPassword() ? 'visibility_off' : 'visibility'" class="text-[20px] !w-[20px] !h-[20px]"></app-icon>
              </button>
            </div>
          </div>

          <div class="mt-4">
            <app-primary-button type="submit" [disabled]="loading() || !registerForm.valid">
              @if(loading()) {
                Criando conta...
              } @else {
                Criar conta
              }
            </app-primary-button>
          </div>

        </form>

        <p class="text-center text-[14px] text-on-surface-variant mt-8">
          Já tem uma conta? 
          <a routerLink="/auth/login" class="font-bold text-primary hover:underline active:opacity-70 ml-1">Entrar</a>
        </p>

      </div>
    </div>
  `
})
export class RegisterComponent {
  private authRepo = inject(AuthRepository);
  private notification = inject(NotificationService);
  private router = inject(Router);

  name = signal('');
  email = signal('');
  password = signal('');
  loading = signal(false);
  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (!this.email() || !this.password() || !this.name()) return;
    
    this.loading.set(true);
    try {
      await this.authRepo.signUp({
        email: this.email(),
        password: this.password(),
        options: {
          data: {
            name: this.name()
          }
        }
      });
      this.notification.success('Conta criada com sucesso! Bem-vindo(a).');
      this.router.navigate(['/decks']);
    } catch (error: any) {
      console.error(error);
      this.notification.error('Ocorreu um erro ao criar a conta. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
