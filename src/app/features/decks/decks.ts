import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DeckCardComponent } from '../../shared/ui/deck-card';
import { EmptyStateComponent } from '../../shared/ui/empty-state';
import { DeckRepository } from '../../core/repositories/deck.repository';
import { Deck } from '../../core/models/models';

@Component({
  selector: 'app-decks',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CommonModule, MatIconModule, DeckCardComponent, EmptyStateComponent],
  template: `
    <div class="px-4 py-6">
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-[28px] text-on-surface font-bold">Decks</h2>
        <a routerLink="/decks/new" class="w-10 h-10 flex items-center justify-center text-primary bg-primary-container rounded-full active:scale-95 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 5v14M5 12h14"/>
            </svg>
        </a>
      </div>
      
      <!-- List -->
      <div class="flex flex-col gap-3">
        
        @if (loading()) {
            <div class="flex items-center justify-center p-8 opacity-50">
                <mat-icon class="animate-spin mr-2">sync</mat-icon> Carregando...
            </div>
        } @else if (decks().length > 0) {
            @for (deck of decks(); track deck.id) {
                <app-deck-card
                    [deckId]="deck.id"
                    [title]="deck.name"
                    [description]="deck.description || ''"
                    [totalCards]="deck.totalCards"
                    [cardsToReview]="deck.cardsToReview">
                </app-deck-card>
            }
        } @else {
            <app-empty-state 
                icon="style" 
                title="Nenhum deck" 
                description="Você ainda não tem nenhum deck. Crie ou importe um para começar!">
            </app-empty-state>
        }

      </div>
    </div>
  `
})
export class DecksComponent implements OnInit {
  private deckRepo = inject(DeckRepository);
  
  decks = signal<(Deck & { totalCards: number, cardsToReview: number })[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      const data = await this.deckRepo.getDecksWithStats();
      this.decks.set(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      this.loading.set(false);
    }
  }
}
