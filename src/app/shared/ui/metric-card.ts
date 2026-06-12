import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="bg-surface rounded-2xl p-4 shadow-sm border border-outline/40 flex-1 flex flex-col items-center justify-center h-full">
        <app-icon *ngIf="icon" [name]="icon" [isFilled]="true" class="mb-2" [ngClass]="iconColorClass" [style.font-size.px]="iconSize"></app-icon>
        
        <span class="font-bold leading-none mb-1 flex items-center gap-1" [ngClass]="valueColorClass" [style.font-size.px]="valueSize" [style.margin-top.px]="icon ? 8 : 0">
            <app-icon *ngIf="inlineIcon" [name]="inlineIcon" [isFilled]="true" class="text-[20px]"></app-icon>
            {{value}}
        </span>
        
        <span class="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-1 text-center" [innerHTML]="label"></span>
    </div>
  `
})
export class MetricCardComponent {
  @Input() value: string | number = '';
  @Input() label: string = '';
  @Input() icon?: string;
  @Input() inlineIcon?: string;
  @Input() valueColorClass: string = 'text-on-surface';
  @Input() iconColorClass: string = 'text-primary';
  @Input() valueSize: number = 24;
  @Input() iconSize: number = 32;
}
