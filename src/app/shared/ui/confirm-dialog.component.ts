import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { IconComponent } from './icon.component';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type: 'danger' | 'warning';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, IconComponent],
  template: `
    <div class="bg-surface flex flex-col w-[90vw] max-w-[400px] rounded-3xl overflow-hidden">
      <div class="px-6 pt-8 pb-4 flex flex-col items-center text-center">
        <div class="w-14 h-14 rounded-full flex items-center justify-center mb-5"
             [ngClass]="{
               'bg-red-50 text-red-500': data.type === 'danger',
               'bg-orange-50 text-orange-500': data.type === 'warning'
             }">
          <app-icon [name]="data.type === 'danger' ? 'delete' : 'help'" class="text-[28px] !w-[28px] !h-[28px]"></app-icon>
        </div>
        <h2 class="text-[20px] font-bold text-on-surface mb-2">{{ data.title }}</h2>
        <p class="text-on-surface-variant text-[15px] leading-relaxed max-w-[280px]">
          {{ data.message }}
        </p>
      </div>
      
      <div class="px-6 pb-8 pt-2 flex flex-col gap-2 w-full">
        <button (click)="dialogRef.close(true)" 
                class="w-full text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-sm"
                [ngClass]="{
                  'bg-red-500 hover:bg-red-600': data.type === 'danger',
                  'bg-orange-500 hover:bg-orange-600': data.type === 'warning'
                }">
          {{ data.confirmText }}
        </button>
        <button (click)="dialogRef.close(false)" 
                class="w-full bg-transparent text-on-surface-variant font-bold py-3.5 rounded-2xl transition-colors hover:bg-surface-container active:scale-95">
          {{ data.cancelText }}
        </button>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}
}
