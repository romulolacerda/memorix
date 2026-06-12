import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/ui/page-header';
import { SelectComponent } from '../../shared/ui/select.component';
import { DeckRepository } from '../../core/repositories/deck.repository';
import { FlashcardRepository } from '../../core/repositories/flashcard.repository';
import { Deck } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [MatIconModule, CommonModule, FormsModule, PageHeaderComponent, SelectComponent],
  template: `
    <div>
      <!-- Header -->
      <app-page-header
          title="Importar Cartões"
          backLink="/decks">
      </app-page-header>

      <main class="px-4 py-8 flex flex-col">
          
        <!-- Passo 1 -->
        <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[14px]">1</div>
            <h2 class="text-[20px] font-bold text-on-surface">Selecionar Deck</h2>
        </div>
        
        <div class="mb-8 relative z-[60]">
            <app-select 
                [(ngModel)]="selectedDeckId" 
                [options]="deckOptions()" 
                placeholder="Selecione onde salvar...">
            </app-select>
        </div>

        <!-- Passo 2 -->
        <div class="flex items-center gap-3 mb-6">
            <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px]"
                 [ngClass]="selectedDeckId ? 'bg-primary text-white' : 'bg-primary-container text-primary'">2</div>
            <h2 class="text-[20px] font-bold text-on-surface">Enviar Arquivo</h2>
        </div>

        <label class="bg-surface border-2 border-dashed border-outline/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer active:scale-[0.98] transition-all mb-8 shadow-sm"
               [ngClass]="{'opacity-50 pointer-events-none': !selectedDeckId, 'border-primary bg-primary/5': file()}">
            
            <input type="file" accept=".csv" class="hidden" (change)="onFileSelected($event)" [disabled]="!selectedDeckId">
            
            <div class="w-16 h-16 bg-primary-container text-primary rounded-full flex items-center justify-center mb-4">
                <mat-icon class="text-[32px]">{{ file() ? 'task' : 'upload_file' }}</mat-icon>
            </div>
            
            <span class="text-on-surface font-bold text-[18px]">
                {{ file() ? file()!.name : 'Toque para selecionar' }}
            </span>
            <span class="text-on-surface-variant text-[14px] mt-2">
                {{ file() ? parsedCards().length + ' cartões identificados' : 'Formato: Pergunta | Resposta' }}
            </span>
        </label>

        <!-- Ação -->
        <div class="mt-8 pt-4 relative z-20">
            <button 
                class="w-full font-bold text-[18px] py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 mb-2 transition-all"
                [ngClass]="canImport() && !importing() ? 'bg-primary text-white active:scale-95' : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed'"
                [disabled]="!canImport() || importing()"
                (click)="importCards()">
                
                @if (importing()) {
                    <mat-icon class="animate-spin text-[22px]">sync</mat-icon> Importando...
                } @else {
                    <mat-icon class="text-[22px]">upload</mat-icon> Importar {{ parsedCards().length }} Cartões
                }
            </button>
        </div>

      </main>
    </div>
  `
})
export class ImportComponent implements OnInit {
  private router = inject(Router);
  private deckRepo = inject(DeckRepository);
  private flashcardRepo = inject(FlashcardRepository);
  private notification = inject(NotificationService);

  decks = signal<Deck[]>([]);
  deckOptions = computed(() => this.decks().map(d => ({ label: d.name, value: d.id })));
  selectedDeckId = '';
  
  file = signal<File | null>(null);
  parsedCards = signal<{front: string, back: string}[]>([]);
  
  importing = signal(false);

  async ngOnInit() {
    try {
      const data = await this.deckRepo.getDecks();
      this.decks.set(data);
    } catch (e) {
      console.error(e);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const selectedFile = input.files[0];
      this.file.set(selectedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        this.parseCSV(text);
      };
      reader.readAsText(selectedFile);
    }
  }

  parseCSV(text: string) {
    const lines = text.split('\n');
    const cards = [];
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Utiliza o pipe (|) como separador preferencial, com fallback para ; e ,
      let separator = ',';
      if (line.includes('|')) separator = '|';
      else if (line.includes(';')) separator = ';';
      
      const parts = line.split(separator);
      
      if (parts.length >= 2) {
        cards.push({
          front: parts[0].trim(),
          back: parts.slice(1).join(separator).trim() // join rest in case back has separator
        });
      }
    }
    this.parsedCards.set(cards);
    
    if (cards.length === 0) {
      this.notification.info('Nenhum cartão identificado no arquivo. Verifique o formato.');
    }
  }

  canImport(): boolean {
    return this.selectedDeckId !== '' && this.parsedCards().length > 0;
  }

  async importCards() {
    if (!this.canImport() || this.importing()) return;
    
    this.importing.set(true);
    const cards = this.parsedCards();
    
    try {
      // Import in sequence (for MVP, we could do Promise.all chunks for large sets)
      for (const card of cards) {
        await this.flashcardRepo.createFlashcard({
          deck_id: this.selectedDeckId,
          front: card.front,
          back: card.back
        });
      }
      
      this.notification.success(`Importação concluída! ${cards.length} cartões criados.`);
      this.router.navigate(['/decks', this.selectedDeckId]);
      
    } catch (error) {
      console.error('Erro na importação', error);
      this.notification.error('Falha ao importar o arquivo.');
    } finally {
      this.importing.set(false);
    }
  }
}
