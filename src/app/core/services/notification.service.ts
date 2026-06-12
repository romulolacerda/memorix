import { Injectable, inject, Component, Inject } from '@angular/core';
import { MatSnackBar, MAT_SNACK_BAR_DATA, MatSnackBarRef, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../shared/ui/icon.component';

export interface NotificationData {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border"
         [ngClass]="{
           'bg-emerald-50 border-emerald-200 text-emerald-800': data.type === 'success',
           'bg-red-50 border-red-200 text-red-800': data.type === 'error',
           'bg-blue-50 border-blue-200 text-blue-800': data.type === 'info'
         }">
      <app-icon 
        [name]="data.type === 'success' ? 'task_alt' : (data.type === 'error' ? 'close' : 'insights')"
        class="text-[24px] !w-[24px] !h-[24px] shrink-0"
        [ngClass]="{
           'text-emerald-600': data.type === 'success',
           'text-red-600': data.type === 'error',
           'text-blue-600': data.type === 'info'
        }"></app-icon>
      <span class="font-medium text-[15px] flex-1 leading-tight">{{ data.message }}</span>
      <button (click)="snackBarRef.dismiss()" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors shrink-0">
        <app-icon name="close" class="text-[16px] !w-[16px] !h-[16px] opacity-70"></app-icon>
      </button>
    </div>
  `
})
export class NotificationToastComponent {
  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: NotificationData,
    public snackBarRef: MatSnackBarRef<NotificationToastComponent>
  ) {}
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  private show(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.openFromComponent(NotificationToastComponent, {
      data: { message, type },
      duration: type === 'error' ? 5000 : 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['bg-transparent', 'shadow-none', 'p-0', 'mt-4']
    });
  }
}
