import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

export interface ConfirmDialogData {
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslatePipe],
  templateUrl: './confirm-dialog.html',
  styleUrls: ['./confirm-dialog.scss'],
})
export class ConfirmDialog {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA as any);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

/**
 * Helper to show the confirmation dialog and return result as a Promise<boolean>.
 */
// export as a mutable variable so tests can override the implementation if needed
export let openConfirmDialog: (
  dialog: import('@angular/material/dialog').MatDialog,
  message: string,
) => Promise<boolean> = (dialog, message) => {
  const ref = dialog.open(ConfirmDialog, {
    data: { message },
  });
  return ref.afterClosed().toPromise() as Promise<boolean>;
};

/**
 * Testing helper to swap out the confirmation dialog implementation.
 * Useful in specs for stubbing without needing to stub MatDialog directly.
 */
export function setConfirmDialogHandler(handler: typeof openConfirmDialog): void {
  openConfirmDialog = handler;
}
