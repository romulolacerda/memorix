import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-review-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex gap-2 w-full">
        <button (click)="onAction.emit('again')" class="flex-1 bg-red-100 text-red-700 font-bold text-[16px] py-5 rounded-2xl active:scale-95 transition-all flex flex-col justify-center items-center gap-1">
            Errei
        </button>
        <button (click)="onAction.emit('good')" class="flex-1 bg-blue-100 text-blue-700 font-bold text-[16px] py-5 rounded-2xl active:scale-95 transition-all flex flex-col justify-center items-center gap-1">
            Bom
        </button>
        <button (click)="onAction.emit('easy')" class="flex-1 bg-emerald-100 text-emerald-700 font-bold text-[16px] py-5 rounded-2xl active:scale-95 transition-all flex flex-col justify-center items-center gap-1">
            Fácil
        </button>
    </div>
  `
})
export class ReviewActionsComponent {
  @Output() onAction = new EventEmitter<'again' | 'good' | 'easy'>();
}
