import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-surface border border-outline/30 rounded-3xl w-full h-full shadow-sm flex flex-col p-6 overflow-y-auto">
        <!-- Front / Question -->
        <div class="flex-1 flex flex-col justify-center items-center text-center">
            <span *ngIf="deckName" class="text-primary font-bold text-[11px] tracking-wider uppercase mb-4">{{deckName}}</span>
            <h2 class="text-[26px] font-bold text-on-surface leading-tight">{{front}}</h2>
        </div>

        <!-- Back / Answer -->
        <div *ngIf="showBack" class="border-t border-outline/30 pt-6 mt-6 flex-1 flex flex-col justify-center items-center text-center animate-fade-in">
            <h2 *ngIf="backHeading" class="text-[32px] font-bold text-secondary mb-2">{{backHeading}}</h2>
            <p class="text-[17px] text-on-surface-variant leading-relaxed">
                {{backContent}}
            </p>
        </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
        animation: fadeIn 0.3s ease-out forwards;
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
  `]
})
export class ReviewCardComponent {
  @Input() front: string = '';
  @Input() backHeading?: string;
  @Input() backContent: string = '';
  @Input() deckName?: string;
  @Input() showBack: boolean = false;
}
