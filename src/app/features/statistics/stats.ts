import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MetricCardComponent } from '../../shared/ui/metric-card';
import { FlashcardRepository } from '../../core/repositories/flashcard.repository';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, MetricCardComponent],
  template: `
    <div class="px-4 py-6">
      
      <!-- Header -->
      <div class="mb-8 block">
        <h2 class="text-[28px] text-on-surface font-bold leading-tight">Estatísticas</h2>
      </div>

      <!-- Main Overview Cards (2x2 Grid) -->
      <div class="grid grid-cols-2 gap-3 mb-8">
        
        <app-metric-card
            icon="style"
            iconColorClass="text-blue-500"
            [value]="totalCards().toString()"
            [valueSize]="32"
            label="Total de<br/>Cartões">
        </app-metric-card>
        
        <app-metric-card
            icon="done_all"
            iconColorClass="text-emerald-500"
            [value]="learnedCards().toString()"
            [valueSize]="32"
            label="Cartões<br/>Aprendidos">
        </app-metric-card>

        <app-metric-card
            icon="schedule"
            iconColorClass="text-orange-500"
            [value]="dueCards().toString()"
            [valueSize]="32"
            label="Na Fila<br/>Hoje">
        </app-metric-card>

        <app-metric-card
            icon="radar"
            iconColorClass="text-purple-500"
            [value]="avgRetention() + '%'"
            [valueSize]="32"
            label="Retenção<br/>Média">
        </app-metric-card>

      </div>
    </div>
  `
})
export class StatsComponent implements OnInit {
    private flashcardRepo = inject(FlashcardRepository);

    totalCards = signal<number>(0);
    learnedCards = signal<number>(0);
    dueCards = signal<number>(0);
    avgRetention = signal<number>(0);

    async ngOnInit() {
        await this.loadRealStats();
    }

    private async loadRealStats() {
        try {
            const allCards = await this.flashcardRepo.getAllFlashcards();
            
            this.totalCards.set(allCards.length);
            
            // Cartões que já passaram da fase inicial (intervalo >= 21 é considerado maduro no Anki)
            // Aqui vamos usar interval > 0 para simplificar se o banco estiver vazio, ou interval >= 21
            const learned = allCards.filter(c => c.interval > 0).length; 
            this.learnedCards.set(learned);

            // Cartões para hoje
            const now = new Date().toISOString();
            const due = allCards.filter(c => c.next_review_date <= now).length;
            this.dueCards.set(due);

            // Retenção média baseada no ease_factor (2.5 é o padrão = 100% como baseline bom, mínimo é 1.3)
            if (allCards.length > 0) {
                const totalEase = allCards.reduce((acc, c) => acc + c.ease_factor, 0);
                const avgEase = totalEase / allCards.length;
                
                // Normaliza: 2.5 = 100%, 1.3 = 50%
                let retention = Math.round((avgEase / 2.5) * 100);
                if (retention > 100) retention = 100;
                this.avgRetention.set(retention);
            } else {
                this.avgRetention.set(0);
            }

        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }
}
