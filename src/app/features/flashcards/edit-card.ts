import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/ui/page-header';
import { SelectComponent } from '../../shared/ui/select.component';
import { DeckRepository } from '../../core/repositories/deck.repository';
import { FlashcardRepository } from '../../core/repositories/flashcard.repository';
import { Deck, Flashcard } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-edit-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, PageHeaderComponent, SelectComponent],
  template: `
    <div class="h-full bg-surface-container flex flex-col">
      <!-- Header -->
      <app-page-header
          title="Editar Cartão"
          [backLink]="backUrl()"
          backIcon="arrow_back"
          actionText="Salvar"
          [actionDisabled]="!cardForm.valid || saving() || loading()"
          (actionClick)="saveCard()">
      </app-page-header>

      @if (loading()) {
          <div class="flex-1 flex items-center justify-center">
              <mat-icon class="animate-spin text-primary mr-2">sync</mat-icon> Carregando...
          </div>
      } @else {
          <!-- Main Form -->
          <main class="flex-1 px-4 pb-6 overflow-y-auto flex flex-col gap-4 pt-4">
            <form [formGroup]="cardForm" class="flex flex-col gap-4 flex-1 h-full">

                <!-- Seleção de Deck -->
                <div class="mb-1 relative z-[60]">
                    <label class="block text-on-surface-variant text-[13px] font-bold uppercase tracking-wider mb-2">Deck</label>
                    <app-select 
                        formControlName="deckId" 
                        [options]="deckOptions()" 
                        placeholder="Selecione um deck...">
                    </app-select>
                </div>

                <!-- Frente -->
                <div class="bg-surface border border-outline/30 rounded-3xl p-5 flex-1 shadow-sm flex flex-col focus-within:border-primary/50 focus-within:shadow-md transition-all">
                    <label class="text-primary font-bold text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <mat-icon class="text-[14px]">visibility</mat-icon>Frente (Pergunta)
                    </label>
                    <textarea
                        formControlName="front"
                        placeholder="O que você deseja aprender?"
                        class="w-full bg-transparent flex-1 resize-none outline-none text-on-surface text-[20px] font-medium placeholder:text-on-surface-variant/40"
                    ></textarea>
                </div>

                <!-- Verso -->
                <div class="bg-surface border border-outline/30 rounded-3xl p-5 flex-1 shadow-sm flex flex-col focus-within:border-primary/50 focus-within:shadow-md transition-all">
                    <label class="text-secondary font-bold text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1">
                        <mat-icon class="text-[14px]">visibility_off</mat-icon>Verso (Resposta)
                    </label>
                    <textarea
                        formControlName="back"
                        placeholder="A resposta correta..."
                        class="w-full bg-transparent flex-1 resize-none outline-none text-on-surface text-[20px] font-medium placeholder:text-on-surface-variant/40"
                    ></textarea>
                </div>

            </form>
          </main>
      }
    </div>
  `
})
export class EditCardComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deckRepo = inject(DeckRepository);
  private flashcardRepo = inject(FlashcardRepository);
  private notification = inject(NotificationService);

  cardForm: FormGroup;
  decks = signal<Deck[]>([]);
  deckOptions = computed(() => this.decks().map(d => ({ label: d.name, value: d.id })));
  saving = signal<boolean>(false);
  loading = signal<boolean>(true);
  
  cardId = '';
  backUrl = signal<string>('/decks');

  constructor() {
    this.cardForm = this.fb.group({
      deckId: ['', Validators.required],
      front: ['', Validators.required],
      back: ['', Validators.required]
    });
  }

  async ngOnInit() {
    this.cardId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.cardId) {
      this.router.navigate(['/decks']);
      return;
    }

    try {
      const [decksData, cardData] = await Promise.all([
        this.deckRepo.getDecks(),
        this.flashcardRepo.getFlashcardById(this.cardId)
      ]);
      
      this.decks.set(decksData);
      
      this.cardForm.patchValue({
        deckId: cardData.deck_id,
        front: cardData.front,
        back: cardData.back
      });
      
      this.backUrl.set('/decks/' + cardData.deck_id);

    } catch (error) {
      console.error('Failed to load card for edit', error);
      this.notification.error('Erro ao carregar os dados do cartão.');
      this.router.navigate(['/decks']);
    } finally {
      this.loading.set(false);
    }
  }

  async saveCard() {
    if (this.cardForm.valid && !this.saving()) {
      this.saving.set(true);
      try {
        const { deckId, front, back } = this.cardForm.value;
        await this.flashcardRepo.updateFlashcard(this.cardId, {
          deck_id: deckId,
          front: front,
          back: back
        });

        this.notification.success('Cartão atualizado com sucesso!');
        this.router.navigate(['/decks', deckId]);

      } catch (error) {
        console.error('Failed to update card', error);
        this.notification.error('Erro ao salvar o cartão.');
      } finally {
        this.saving.set(false);
      }
    }
  }
}
