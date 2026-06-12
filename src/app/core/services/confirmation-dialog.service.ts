import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/ui/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private dialog = inject(MatDialog);

  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar',
    type: 'danger' | 'warning' = 'danger'
  ): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { title, message, confirmText, cancelText, type } as ConfirmDialogData,
      width: 'auto',
      panelClass: 'memorix-dialog',
      backdropClass: 'bg-on-surface/40',
      disableClose: false
    });

    return new Promise((resolve) => {
      dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
        resolve(result === true);
      });
    });
  }
}
