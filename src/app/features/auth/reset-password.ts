import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrimaryButtonComponent } from '../../shared/ui/primary-button';
import { AuthRepository } from '../../core/repositories/auth.repository';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimaryButtonComponent, IconComponent],
  template: `
    <div class="min-h-[100dvh] bg-surface-container flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      <!-- Decorative blobs -->
      <div class="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div class="bg-surface border border-outline/30 rounded-3xl p-8 shadow-sm w-full max-w-[400px] mx-auto relative z-10">
        
        <div class="text-center mb-8">
            <div class="w-16 h-16 bg-primary-container text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <app-icon name="style" [isFilled]="true" class="text-[32px] !w-[32px] !h-[32px]"></app-icon>
            </div>
            <h1 class="text-[26px] font-bold text-on-surface tracking-tight mb-2">Criar nova senha</h1>
            <p class="text-[15px] text-on-surface-variant">Quase lá! Digite a sua nova senha para proteger a sua conta.</p>
        </div>

        <form (ngSubmit)="onSubmit()" #resetForm="ngForm" class="flex flex-col gap-4">

          <div class="flex flex-col gap-1.5">
            <label class="text-[14px] font-bold text-on-surface ml-1">Nova senha</label>
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
            <app-primary-button type="submit" [disabled]="loading() || !resetForm.valid">
              @if(loading()) {
                Salvando...
              } @else {
                Salvar nova senha
              }
            </app-primary-button>
          </div>
        </form>

      </div>
    </div>
  `
})
export class ResetPasswordComponent {
  private authRepo = inject(AuthRepository);
  private notification = inject(NotificationService);
  private router = inject(Router);

  password = signal('');
  loading = signal(false);
  showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onSubmit() {
    if (!this.password() || this.password().length < 6) return;
    
    this.loading.set(true);
    try {
      await this.authRepo.updatePassword(this.password());

      this.notification.success('Senha atualizada com sucesso! Você já pode estudar.');
      this.router.navigate(['/decks']);
    } catch (error: any) {
      console.error(error);
      this.notification.error('Erro ao atualizar a senha. Tente novamente ou peça um novo link.');
    } finally {
      this.loading.set(false);
    }
  }
}
