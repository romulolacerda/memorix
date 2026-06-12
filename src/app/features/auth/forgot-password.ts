import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PrimaryButtonComponent } from '../../shared/ui/primary-button';
import { AuthRepository } from '../../core/repositories/auth.repository';
import { NotificationService } from '../../core/services/notification.service';
import { IconComponent } from '../../shared/ui/icon.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PrimaryButtonComponent, IconComponent],
  template: `
    <div class="min-h-[100dvh] bg-surface-container flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      <!-- Decorative blobs -->
      <div class="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div class="bg-surface border border-outline/30 rounded-3xl p-8 shadow-sm w-full max-w-[400px] mx-auto relative z-10">
        
        <!-- Back Button -->
        <a routerLink="/auth/login" class="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors active:scale-95 mb-6">
            <app-icon name="arrow_back" class="text-[20px] !w-[20px] !h-[20px]"></app-icon>
        </a>

        <div class="mb-8">
            <h1 class="text-[26px] font-bold text-on-surface tracking-tight mb-2">Esqueceu a senha?</h1>
            <p class="text-[15px] text-on-surface-variant">Digite o e-mail cadastrado e enviaremos um link para você redefinir sua senha.</p>
        </div>

        @if(emailSent()) {
          <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
             <div class="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                 <app-icon name="mark_email_read" class="text-[24px] !w-[24px] !h-[24px]"></app-icon>
             </div>
             <h3 class="text-[16px] font-bold text-emerald-800 mb-1">E-mail enviado!</h3>
             <p class="text-[14px] text-emerald-700">Verifique sua caixa de entrada e siga as instruções para criar uma nova senha.</p>
          </div>
        } @else {
          <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" class="flex flex-col gap-4">
            
            <div class="flex flex-col gap-1.5">
              <label class="text-[14px] font-bold text-on-surface ml-1">E-mail</label>
              <input type="email" 
                     [(ngModel)]="email" 
                     name="email" 
                     required
                     placeholder="seu@email.com"
                     class="w-full bg-surface-container-low border border-outline/40 text-on-surface rounded-xl px-4 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/50">
            </div>

            <div class="mt-4">
              <app-primary-button type="submit" [disabled]="loading() || !forgotForm.valid">
                @if(loading()) {
                  Enviando...
                } @else {
                  Enviar link
                }
              </app-primary-button>
            </div>
          </form>
        }

      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private authRepo = inject(AuthRepository);
  private notification = inject(NotificationService);

  email = signal('');
  loading = signal(false);
  emailSent = signal(false);

  async onSubmit() {
    if (!this.email()) return;
    
    this.loading.set(true);
    try {
      await this.authRepo.sendPasswordResetEmail(this.email());
      this.emailSent.set(true);
      this.notification.success('Link de recuperação enviado com sucesso.');
    } catch (error: any) {
      console.error(error);
      this.notification.error('Ocorreu um erro ao enviar o e-mail. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
