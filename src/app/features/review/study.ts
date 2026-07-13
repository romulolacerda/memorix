import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReviewCardComponent } from '../../shared/ui/review-card';
import { PrimaryButtonComponent } from '../../shared/ui/primary-button';
import { IconComponent } from '../../shared/ui/icon.component';
import { ReviewActionsComponent } from '../../shared/ui/review-actions';
import { FlashcardRepository } from '../../core/repositories/flashcard.repository';
import { Flashcard } from '../../core/models/models';
import { SM2SchedulerService, ReviewGrade } from '../../core/services/sm2-scheduler.service';
import { StudyLogRepository } from '../../core/repositories/study-log.repository';
import { NotificationService } from '../../core/services/notification.service';
import { PdfExportService } from '../../core/services/pdf-export.service';

type StudyState = 'front' | 'back' | 'finished' | 'empty';

@Component({
  selector: 'app-study',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, ReviewCardComponent, PrimaryButtonComponent, ReviewActionsComponent, IconComponent],
  template: `
    <div class="mx-auto w-full max-w-[412px] h-[100dvh] bg-surface-container flex flex-col relative overflow-hidden sm:border-x sm:border-outline/20">
      <!-- Top Bar -->
      <header class="w-full px-4 pt-6 pb-2 flex items-center justify-between shrink-0">
        <a routerLink="/decks" class="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors active:scale-95">
            <mat-icon>close</mat-icon>
        </a>
        @if (state() !== 'empty' && state() !== 'finished') {
            <div class="flex-1 px-4">
                <div class="w-full h-2 bg-outline/20 rounded-full overflow-hidden">
                    <div class="h-full bg-primary rounded-full transition-all duration-300" [style.width.%]="progressPercentage()"></div>
                </div>
            </div>
            <div class="w-10 h-10 flex items-center justify-center text-primary font-bold text-[14px]">
                {{ remainingCards() }}
            </div>
        }
      </header>

      <!-- Loading State -->
      @if (loading()) {
          <div class="flex-1 flex items-center justify-center">
              <mat-icon class="animate-spin text-primary">sync</mat-icon>
          </div>
      }

      <!-- Card Area -->
      @if (!loading() && state() !== 'finished' && currentCard()) {
          <main class="flex-1 px-4 pb-4 flex flex-col min-h-0"
                [ngClass]="{'cursor-pointer': state() === 'front'}"
                (click)="state() === 'front' && flipCard()">
              <app-review-card
                  deckName="Deck"
                  [front]="currentCard()!.front"
                  backHeading="Resposta"
                  [backContent]="currentCard()!.back"
                  [showBack]="state() === 'back'">
              </app-review-card>
          </main>

          <!-- Bottom Actions -->
          <footer class="p-4 shrink-0 bg-surface-container">
              @if (state() === 'front') {
                  <app-primary-button (onClick)="flipCard()">
                      Mostrar Resposta
                  </app-primary-button>
              } @else {
                  <app-review-actions (onAction)="submitGrade($event)"></app-review-actions>
              }
          </footer>
      }

      <!-- Empty State -->
      @if (state() === 'empty') {
          <div class="flex-1 px-6 flex flex-col items-center justify-center text-center animate-fade-in-up">
              <div class="w-32 h-32 mb-8 bg-surface border border-outline/20 text-secondary rounded-full flex items-center justify-center shadow-sm">
                  <app-icon name="task_alt" class="text-[64px] !w-[64px] !h-[64px]"></app-icon>
              </div>
              <h2 class="text-[32px] font-bold text-on-surface mb-2">Tudo em dia!</h2>
              <p class="text-on-surface-variant text-[16px] mb-8">
                  Você não tem nenhum cartão pendente para revisar neste deck no momento. Volte mais tarde!
              </p>

              <button routerLink="/decks" class="w-full bg-primary text-white font-bold text-[18px] py-4 rounded-2xl active:scale-95 transition-all shadow-md">
                  Voltar para Meus Decks
              </button>
          </div>
      }

      <!-- Finished State -->
      @if (state() === 'finished') {
          <div class="flex-1 px-6 flex flex-col items-center justify-center text-center animate-fade-in-up overflow-y-auto py-8">
              <div class="w-32 h-32 mb-8 bg-primary-container text-primary rounded-full flex items-center justify-center shadow-md shrink-0 mx-auto">
                  <app-icon name="emoji_events" [isFilled]="true" class="text-[64px] !w-[64px] !h-[64px]"></app-icon>
              </div>
              <h2 class="text-[32px] font-bold text-on-surface mb-2 shrink-0">Sessão Concluída!</h2>
              <p class="text-on-surface-variant text-[16px] mb-6 shrink-0">
                  Você revisou {{ totalCards() }} cartões. Excelente trabalho!
              </p>

              <button (click)="sharePdf()" [disabled]="isGeneratingPdf()" class="w-full bg-[#25D366] text-white font-bold text-[16px] py-4 rounded-2xl active:scale-95 transition-all shadow-md mb-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100">
                  @if (isGeneratingPdf()) {
                      <mat-icon class="animate-spin">sync</mat-icon> Gerando PDF...
                  } @else {
                      <app-icon name="share" [isFilled]="true"></app-icon> Compartilhar PDF no WhatsApp
                  }
              </button>

              <button routerLink="/home" class="w-full bg-primary text-white font-bold text-[18px] py-4 rounded-2xl active:scale-95 transition-all shadow-md mb-3">
                  Voltar ao Início
              </button>
              <button routerLink="/decks" class="w-full bg-transparent text-primary font-bold text-[16px] py-4 rounded-2xl active:scale-95 transition-all">
                  Ver outros Decks
              </button>
          </div>
      }
    </div>
  `,
  styles: [`
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-fade-in-up {
        animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class StudyComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private flashcardRepo = inject(FlashcardRepository);
    private sm2 = inject(SM2SchedulerService);
    private studyLogRepo = inject(StudyLogRepository);
    private notification = inject(NotificationService);
    private pdfExport = inject(PdfExportService);

    state = signal<StudyState>('front');
    loading = signal<boolean>(true);
    isGeneratingPdf = signal<boolean>(false);
    
    cards = signal<Flashcard[]>([]);
    currentIndex = signal<number>(0);
    
    totalCards = computed(() => this.cards().length);
    remainingCards = computed(() => Math.max(0, this.totalCards() - this.currentIndex()));
    progressPercentage = computed(() => {
        if (this.totalCards() === 0) return 100;
        return (this.currentIndex() / this.totalCards()) * 100;
    });
    
    currentCard = computed(() => {
        const cards = this.cards();
        const index = this.currentIndex();
        return index < cards.length ? cards[index] : null;
    });

    async ngOnInit() {
        const deckId = this.route.snapshot.paramMap.get('id');
        try {
            let data: Flashcard[] = [];
            if (deckId === 'daily') {
                data = await this.flashcardRepo.getDueFlashcards();
            } else if (deckId) {
                // To keep it simple, if entering a specific deck, we just study due cards of that deck.
                // Or we can just fetch all due cards and filter. Let's fetch all cards of that deck for now (MVP).
                const allDeckCards = await this.flashcardRepo.getFlashcardsByDeck(deckId);
                // Filter due
                const now = new Date().toISOString();
                data = allDeckCards.filter(c => c.next_review_date <= now);
            }
            this.cards.set(data);
            if (data.length === 0) {
                this.state.set('empty');
            }
        } catch (error) {
            console.error('Error fetching cards for study', error);
        } finally {
            this.loading.set(false);
        }
    }

    flipCard() {
        this.state.set('back');
    }

    async submitGrade(grade: ReviewGrade) {
        const card = this.currentCard();
        if (!card) return;
        
        // Calcular novo estado SM-2
        const nextState = this.sm2.calculateNextReview(grade, {
            interval: card.interval,
            repetition: card.repetition,
            ease_factor: card.ease_factor,
            next_review_date: card.next_review_date
        });
        
        try {
            // Atualizar no banco
            await this.flashcardRepo.updateFlashcard(card.id, nextState);
            const numericGrade = grade === 'again' ? 1 : grade === 'good' ? 4 : 5;
            await this.studyLogRepo.logStudy(card.id, card.deck_id, numericGrade);
        } catch(error) {
            console.error('Error updating flashcard or logging study', error);
        }
        
        // Passar para o próximo
        this.currentIndex.update(i => i + 1);
        if (this.currentIndex() >= this.totalCards()) {
            this.state.set('finished');
            this.notification.success('Sessão concluída! Excelente trabalho.');
        } else {
            this.state.set('front');
        }
    }

    async sharePdf() {
        this.isGeneratingPdf.set(true);
        try {
            await this.pdfExport.generateAndShareStudyPdf(this.cards());
        } finally {
            this.isGeneratingPdf.set(false);
        }
    }
}

