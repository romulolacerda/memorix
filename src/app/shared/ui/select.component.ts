import { Component, Input, forwardRef, HostListener, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from './icon.component';

export interface SelectOption {
    label: string;
    value: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="relative w-full text-on-surface text-[16px]">
        <!-- Select Trigger -->
        <div 
            (click)="toggleOpen()"
            class="flex items-center justify-between w-full bg-transparent px-3 py-3 border border-outline/40 rounded-xl cursor-pointer hover:border-primary/50 transition-colors"
            [ngClass]="{'border-primary ring-1 ring-primary': isOpen()}">
            
            <span class="truncate font-bold" [ngClass]="{'text-on-surface-variant font-normal': !selectedOption()}">
                {{ selectedOption()?.label || placeholder }}
            </span>
            
            <app-icon 
                name="expand_more" 
                class="text-on-surface-variant transition-transform duration-200"
                [ngClass]="{'rotate-180': isOpen()}">
            </app-icon>
        </div>

        <!-- Dropdown Options -->
        @if (isOpen()) {
            <div class="absolute z-[100] w-full mt-2 bg-surface border border-outline/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div class="max-h-60 overflow-y-auto py-1">
                    @for (option of options; track option.value) {
                        <div 
                            (click)="selectOption(option)"
                            class="px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center justify-between"
                            [ngClass]="{'bg-primary/5 text-primary font-bold': value === option.value}">
                            <span class="truncate">{{ option.label }}</span>
                            @if (value === option.value) {
                                <app-icon name="task_alt" class="text-primary text-[18px]"></app-icon>
                            }
                        </div>
                    }
                    @if (options.length === 0) {
                        <div class="px-4 py-3 text-on-surface-variant text-center text-[14px]">
                            Nenhuma opção disponível
                        </div>
                    }
                </div>
            </div>
        }
    </div>
  `
})
export class SelectComponent implements ControlValueAccessor {
    @Input() options: SelectOption[] = [];
    @Input() placeholder: string = 'Selecione...';

    isOpen = signal(false);
    value: string | null = null;
    
    onChange: any = () => {};
    onTouch: any = () => {};

    constructor(private eRef: ElementRef) {}

    // Fechar ao clicar fora do componente
    @HostListener('document:click', ['$event'])
    clickout(event: Event) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isOpen.set(false);
        }
    }

    toggleOpen() {
        this.isOpen.update(v => !v);
        if (this.isOpen()) {
            this.onTouch();
        }
    }

    selectOption(option: SelectOption) {
        this.value = option.value;
        this.onChange(this.value);
        this.isOpen.set(false);
    }

    selectedOption(): SelectOption | undefined {
        return this.options.find(o => o.value === this.value);
    }

    // ControlValueAccessor methods
    writeValue(obj: any): void {
        this.value = obj;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
}
