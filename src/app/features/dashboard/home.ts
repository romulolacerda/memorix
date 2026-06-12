import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PrimaryButtonComponent } from '../../shared/ui/primary-button';
import { MetricCardComponent } from '../../shared/ui/metric-card';
import { DeckCardComponent } from '../../shared/ui/deck-card';
import { DeckRepository } from '../../core/repositories/deck.repository';
import { FlashcardRepository } from '../../core/repositories/flashcard.repository';
import { StudyLogRepository } from '../../core/repositories/study-log.repository';
import { SessionService } from '../../core/services/session.service';
import { Deck } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, PrimaryButtonComponent, MetricCardComponent, DeckCardComponent],
  template: `
    <div class="px-4 py-6">
      
      <!-- Greeting & Primary Action -->
      <div class="mb-8">
        <h2 class="text-[28px] text-on-surface font-bold leading-tight">Olá, {{ session.userName() }}!</h2>
        <p class="text-[15px] text-on-surface-variant mt-1 mb-6">Pronto para manter a ofensiva?</p>
        
        <app-primary-button icon="school" (onClick)="studyDaily()">
          Estudar Agora
        </app-primary-button>
      </div>

      <!-- Compact Quick Stats -->
      <div class="flex gap-3 mb-8 h-24">
        <app-metric-card 
            [value]="dueCardsCount().toString()" 
            label="Para<br/>Revisar" 
            valueColorClass="text-on-surface">
        </app-metric-card>
        
        <app-metric-card 
            [value]="studiedTodayCount().toString()" 
            label="Estudados<br/>Hoje" 
            valueColorClass="text-primary">
        </app-metric-card>
        
        <app-metric-card 
            [value]="streakCount().toString()" 
            label="Dias<br/>Seguidos" 
            inlineIcon="local_fire_department"
            valueColorClass="text-orange-500">
        </app-metric-card>
      </div>

      <!-- Deck List (Compact) -->
      <div>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-[18px] font-bold text-on-surface">Meus Decks</h3>
          <a routerLink="/decks" class="text-primary font-bold text-[13px]">Ver todos</a>
        </div>

        <div class="flex flex-col gap-3">
          
          @if (loading()) {
            <div class="flex items-center justify-center p-8 opacity-50">
                <mat-icon class="animate-spin mr-2">sync</mat-icon> Carregando...
            </div>
          } @else if (topDecks().length > 0) {
            @for (deck of topDecks(); track deck.id) {
              <app-deck-card
                [deckId]="deck.id"
                [title]="deck.name"
                [subtitle]="deck.cardsToReview + ' cartões aguardando'"
                icon="style"
                [compact]="true"
                [totalCards]="deck.totalCards"
                [cardsToReview]="deck.cardsToReview">
              </app-deck-card>
            }
          } @else {
            <div class="text-center p-6 bg-surface border border-outline/30 rounded-2xl">
              <p class="text-on-surface-variant text-[14px]">Você ainda não tem decks.</p>
              <a routerLink="/decks/new" class="text-primary font-bold mt-2 inline-block">Criar meu primeiro deck</a>
            </div>
          }

        </div>
      </div>
      
    </div>
  `
})
export class HomeComponent implements OnInit {
  private router = inject(Router);
  private deckRepo = inject(DeckRepository);
  private flashcardRepo = inject(FlashcardRepository);
  private studyLogRepo = inject(StudyLogRepository);
  public session = inject(SessionService);

  dueCardsCount = signal<number>(0);
  studiedTodayCount = signal<number>(0);
  streakCount = signal<number>(0);
  topDecks = signal<(Deck & { totalCards: number, cardsToReview: number })[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    try {
      // Fetch stats for decks
      const decksWithStats = await this.deckRepo.getDecksWithStats();
      
      // Calculate global stats
      let due = 0;
      let newCards = 0; // We define new as repetition == 0, but since we don't have a direct global query for "new" without getting all cards, we might need a custom query. For MVP, we can estimate or fetch all due cards and filter.
      
      const allDue = await this.flashcardRepo.getDueFlashcards();
      due = allDue.length;
      
      const logsToday = await this.studyLogRepo.getLogsForToday();
      const streak = await this.studyLogRepo.getStreak();
      
      this.dueCardsCount.set(due);
      this.studiedTodayCount.set(logsToday.length);
      this.streakCount.set(streak);
      
      // Sort decks by cardsToReview desc, then take top 3
      const sortedDecks = decksWithStats.sort((a, b) => b.cardsToReview - a.cardsToReview).slice(0, 3);
      this.topDecks.set(sortedDecks);
      
    } catch (error) {
      console.error('Error loading home dashboard data', error);
    } finally {
      this.loading.set(false);
    }
  }

  studyDaily() {
    this.router.navigate(['/study/daily']);
  }
}

