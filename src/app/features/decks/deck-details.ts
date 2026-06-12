import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/ui/page-header';
import { EmptyStateComponent } from '../../shared/ui/empty-state';
import { IconComponent } from '../../shared/ui/icon.component';
import { DeckRepository } from '../../core/repositories/deck.repository';
import { FlashcardRepository } from '../../core/repositories/flashcard.repository';
import { Deck, Flashcard } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmationDialogService } from '../../core/services/confirmation-dialog.service';

@Component({
  selector: 'app-deck-details',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, PageHeaderComponent, EmptyStateComponent, IconComponent],
  template: `
    <div class="h-full bg-surface-container flex flex-col">
      <!-- Header -->
      <app-page-header
          [title]="deck()?.name || 'Carregando...'"
          backLink="/decks"
          backIcon="arrow_back">
      </app-page-header>

      @if (loading()) {
        <div class="flex-1 flex items-center justify-center">
            <mat-icon class="animate-spin text-primary mr-2">sync</mat-icon> Carregando...
        </div>
      } @else if (deck()) {
        
        <!-- Controls & Info -->
        <div class="px-4 py-4 bg-surface border-b border-outline/20">
            
            <div class="flex gap-2">
                <a [routerLink]="['/study', deck()!.id]" class="flex-1 bg-primary text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors active:scale-95">
                    <app-icon name="play_arrow" [isFilled]="true" class="text-[20px] !w-[20px] !h-[20px]"></app-icon> Estudar Deck
                </a>
                
                <button (click)="deleteDeck()" class="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-200 transition-colors active:scale-95">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Cards List -->
        <main class="flex-1 px-4 py-4 overflow-y-auto">
            <h3 class="text-[16px] font-bold text-on-surface mb-4">Cartões ({{ cards().length }})</h3>
            
            <div class="flex flex-col gap-3">
                @for (card of cards(); track card.id) {
                    <div class="bg-surface border border-outline/30 p-4 rounded-2xl flex items-start justify-between gap-4">
                        <a [routerLink]="['/cards/edit', card.id]" class="flex-1 min-w-0 block cursor-pointer hover:opacity-70 transition-opacity">
                            <p class="text-[15px] font-bold text-on-surface truncate">{{ card.front }}</p>
                            <p class="text-[13px] text-on-surface-variant truncate mt-1">{{ card.back }}</p>
                            <div class="flex items-center gap-2 mt-2">
                                @if (getCardStatus(card); as status) {
                                    <span class="text-[11px] font-bold px-2 py-0.5 rounded-md" [ngClass]="status.classes">
                                        {{ status.label }}
                                    </span>
                                }
                            </div>
                        </a>
                        <button (click)="deleteCard(card.id)" class="w-8 h-8 flex items-center justify-center text-on-surface-variant bg-surface-container hover:bg-red-100 hover:text-red-600 rounded-full shrink-0 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"></path>
                            </svg>
                        </button>
                    </div>
                }
                
                @if (cards().length === 0) {
                    <app-empty-state 
                        icon="style" 
                        title="Deck vazio" 
                        description="Você não tem nenhum cartão neste deck.">
                    </app-empty-state>
                }
            </div>
        </main>
      }
    </div>
  `
})
export class DeckDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private deckRepo = inject(DeckRepository);
  private flashcardRepo = inject(FlashcardRepository);
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmationDialogService);

  deck = signal<Deck | null>(null);
  cards = signal<Flashcard[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/decks']);
      return;
    }
    
    try {
      const [deckData, cardsData] = await Promise.all([
        this.deckRepo.getDeckById(id),
        this.flashcardRepo.getFlashcardsByDeck(id)
      ]);
      
      this.deck.set(deckData);
      this.cards.set(cardsData);
      
    } catch (error) {
      console.error('Error fetching deck details', error);
      this.notification.error('Erro ao carregar o deck.');
      this.router.navigate(['/decks']);
    } finally {
      this.loading.set(false);
    }
  }

  getCardStatus(card: Flashcard): { label: string, classes: string } | null {
    if (card.interval === 0) {
      return { label: 'Novo', classes: 'bg-blue-100 text-blue-700' };
    }
    
    if (card.interval >= 21) {
      return { label: 'Memorizado', classes: 'bg-emerald-100 text-emerald-700' };
    }

    const now = new Date();
    const reviewDate = new Date(card.next_review_date);
    
    if (reviewDate <= now) {
      // Overdue by more than 24 hours
      const hoursDiff = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        return { label: 'Atrasado', classes: 'bg-red-100 text-red-700' };
      } else {
        return { label: 'Revisar Hoje', classes: 'bg-orange-100 text-orange-700' };
      }
    }
    
    return null;
  }

  async deleteDeck() {
    const d = this.deck();
    if (!d) return;
    
    const confirmed = await this.confirmDialog.confirm(
      'Excluir Deck',
      `Tem certeza que deseja excluir o deck "${d.name}" e todos os seus cartões? Esta ação é irreversível.`,
      'Excluir',
      'Cancelar',
      'danger'
    );

    if (confirmed) {
      try {
        await this.deckRepo.deleteDeck(d.id);
        this.notification.success('Deck excluído com sucesso.');
        this.router.navigate(['/decks']);
      } catch (error) {
        console.error('Error deleting deck', error);
        this.notification.error('Erro ao excluir o deck.');
      }
    }
  }

  async deleteCard(cardId: string) {
    const confirmed = await this.confirmDialog.confirm(
      'Excluir cartão',
      'Tem certeza que deseja excluir este cartão? Esta ação é irreversível.',
      'Excluir',
      'Cancelar',
      'danger'
    );

    if (confirmed) {
      try {
        await this.flashcardRepo.deleteFlashcard(cardId);
        // Remove da lista atual
        this.cards.update(cards => cards.filter(c => c.id !== cardId));
        this.notification.success('Cartão excluído com sucesso.');
      } catch (error) {
        console.error('Error deleting card', error);
        this.notification.error('Erro ao excluir o cartão.');
      }
    }
  }
}
