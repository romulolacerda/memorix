import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, MatIconModule, IconComponent],
  template: `
    <div class="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-70 mt-8">
        <div class="w-24 h-24 bg-surface-container-high rounded-full flex items-center justify-center mb-6 text-primary shadow-sm border border-outline/10">
            <app-icon [name]="icon" class="text-[48px] !w-[48px] !h-[48px]"></app-icon>
        </div>
        <h3 class="text-[20px] font-bold text-on-surface mb-2">{{title}}</h3>
        <p class="text-[15px] text-on-surface-variant">{{description}}</p>
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = 'style';
  @Input() title: string = 'Nenhum item encontrado';
  @Input() description: string = 'Não há dados para exibir no momento.';
}
