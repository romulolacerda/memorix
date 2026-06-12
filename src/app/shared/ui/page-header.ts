import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <header class="bg-surface/80 backdrop-blur-md px-2 py-3 flex items-center justify-between sticky top-0 z-10 w-full shrink-0">
        <a *ngIf="backLink" [routerLink]="backLink" class="w-12 h-12 flex items-center justify-center text-on-surface hover:bg-surface-container-low rounded-full transition-colors active:scale-95">
            <mat-icon>{{backIcon}}</mat-icon>
        </a>
        <div *ngIf="!backLink" class="w-12"></div>
        
        <h1 class="text-on-surface font-bold text-[18px]">{{title}}</h1>
        
        <button *ngIf="actionText" [disabled]="actionDisabled" (click)="actionClick.emit()" class="text-primary font-bold text-[16px] px-4 py-2 disabled:opacity-50 active:scale-95 transition-transform">
            {{actionText}}
        </button>
        <div *ngIf="!actionText" class="w-12"></div>
    </header>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() backLink?: string | any[];
  @Input() backIcon: string = 'arrow_back';
  @Input() actionText?: string;
  @Input() actionDisabled: boolean = false;
  @Output() actionClick = new EventEmitter<void>();
}
