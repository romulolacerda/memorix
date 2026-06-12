import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <button [type]="type" (click)="onClick.emit()" [disabled]="disabled" 
            class="w-full bg-primary text-white rounded-2xl py-4 px-6 font-bold text-[18px] flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
            [ngClass]="shadow ? 'shadow-[0_8px_20px_rgba(37,99,235,0.25)]' : ''">
        <mat-icon *ngIf="icon" class="icon-filled text-[24px]">{{icon}}</mat-icon> 
        <ng-content></ng-content>
    </button>
  `
})
export class PrimaryButtonComponent {
  @Input() disabled: boolean = false;
  @Input() icon?: string;
  @Input() shadow: boolean = true;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() onClick = new EventEmitter<void>();
}
