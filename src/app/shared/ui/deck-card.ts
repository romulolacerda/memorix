import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-deck-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, IconComponent],
  template: `
    <a [routerLink]="['/decks', deckId]" class="bg-surface rounded-2xl shadow-sm border border-outline/40 hover:bg-surface-container-low transition-colors active:scale-[0.98] block"
       [ngClass]="compact ? 'p-3 flex items-center gap-4' : 'p-4 flex flex-col'">
       
       <!-- Compact Layout -->
       <ng-container *ngIf="compact">
           <div class="w-12 h-12 shrink-0 rounded-full flex items-center justify-center" [ngClass]="iconBgClass + ' ' + iconTextClass">
             <app-icon [name]="icon" class="text-[24px] !w-[24px] !h-[24px]"></app-icon>
           </div>
           <div class="flex-1 min-w-0">
              <h4 class="text-[16px] font-bold text-on-surface truncate">{{title}}</h4>
              <p class="text-[13px] text-on-surface-variant truncate mt-0.5" *ngIf="!completed">{{subtitle}}</p>
              <p class="text-[13px] text-secondary font-semibold truncate mt-0.5 flex items-center gap-1" *ngIf="completed">
                  <app-icon name="done_all" class="text-[14px] !w-[14px] !h-[14px]"></app-icon> Tudo revisado
              </p>
           </div>
           <div class="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0" *ngIf="!completed">
              <app-icon name="play_arrow" class="text-[18px] !w-[18px] !h-[18px]"></app-icon>
           </div>
       </ng-container>

       <!-- Full Layout (Matching Prototype) -->
       <ng-container *ngIf="!compact">
            <h3 class="text-[22px] text-on-surface font-bold" [class.mb-1]="description" [class.mb-3]="!description">{{title}}</h3>
            
            <p *ngIf="description" class="text-[14px] text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
                {{description}}
            </p>
            
            <div class="flex items-center gap-4 text-[14px] font-medium mb-6">
                <span class="flex items-center gap-1.5 text-on-surface-variant">
                    <app-icon name="style" class="text-[18px] !w-[18px] !h-[18px]"></app-icon> {{totalCards}} cards
                </span>
                <span class="flex items-center gap-1.5" [ngClass]="completed ? 'text-on-surface-variant' : 'text-primary'">
                    <app-icon name="schedule" class="text-[18px] !w-[18px] !h-[18px]"></app-icon> 
                    {{completed ? 'Tudo revisado' : cardsToReview + ' para revisar'}}
                </span>
            </div>
            
            <button class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-[0.98]">
                <app-icon name="play_arrow" [isFilled]="true" class="text-[20px] !w-[20px] !h-[20px]"></app-icon> Começar Estudos
            </button>
       </ng-container>

    </a>
  `
})
export class DeckCardComponent {
  @Input() deckId: string = '';
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() description: string = '';
  @Input() icon: string = 'style';
  @Input() iconBgClass: string = 'bg-blue-100';
  @Input() iconTextClass: string = 'text-blue-600';
  @Input() totalCards: number = 0;
  @Input() cardsToReview: number = 0;
  @Input() compact: boolean = false;
  
  get completed(): boolean {
    return this.cardsToReview === 0;
  }
}
