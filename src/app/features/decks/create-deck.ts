import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/ui/page-header';
import { DeckRepository } from '../../core/repositories/deck.repository';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-create-deck',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, PageHeaderComponent],
  template: `
    <div class="h-full bg-surface-container flex flex-col">
      <!-- Header -->
      <app-page-header
          title="Novo Deck"
          backLink="/decks"
          backIcon="arrow_back"
          actionText="Criar"
          [actionDisabled]="!deckForm.valid || saving()"
          (actionClick)="saveDeck()">
      </app-page-header>

      <!-- Main Form -->
      <main class="flex-1 px-4 pb-6 pt-6 overflow-y-auto flex flex-col">
        <form [formGroup]="deckForm" class="flex flex-col flex-1">
            
            <!-- Nome -->
            <div class="mb-5">
                <label class="block text-on-surface-variant text-[13px] font-bold uppercase tracking-wider mb-2">Nome do Deck</label>
                <input 
                    type="text" 
                    formControlName="name"
                    placeholder="Ex: Inglês Básico"
                    class="w-full bg-surface border border-outline/40 text-on-surface text-[18px] rounded-xl px-4 py-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                >
            </div>

            <!-- Descrição -->
            <div class="mb-5 flex-1 flex flex-col">
                <label class="block text-on-surface-variant text-[13px] font-bold uppercase tracking-wider mb-2">Descrição (Opcional)</label>
                <textarea 
                    formControlName="description"
                    placeholder="Sobre o que é este deck?"
                    class="w-full flex-1 bg-surface border border-outline/40 text-on-surface text-[16px] rounded-xl px-4 py-4 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                ></textarea>
            </div>

        </form>
      </main>
    </div>
  `
})
export class CreateDeckComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private deckRepo = inject(DeckRepository);
  private notification = inject(NotificationService);

  deckForm: FormGroup;
  saving = signal<boolean>(false);

  constructor() {
    this.deckForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  async saveDeck() {
    if (this.deckForm.valid && !this.saving()) {
      this.saving.set(true);
      try {
        await this.deckRepo.createDeck({
          name: this.deckForm.value.name,
          description: this.deckForm.value.description
        });
        
        this.notification.success('Deck criado com sucesso!');
        
        // Voltar para a lista de decks
        this.router.navigate(['/decks']);
        
      } catch (error) {
        console.error('Failed to create deck', error);
        this.notification.error('Erro ao criar o deck. Tente novamente.');
      } finally {
        this.saving.set(false);
      }
    }
  }
}
