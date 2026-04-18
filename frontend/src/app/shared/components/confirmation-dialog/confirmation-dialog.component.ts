// src/app/shared/components/confirmation-dialog/confirmation-dialog.component.ts
import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.css']
})
export class ConfirmationDialogComponent {
  private confirmationService = inject(ConfirmationService);
  
  dialogs = this.confirmationService.dialogs$;

  confirm(id: string): void {
    this.confirmationService.confirmDialog(id);
  }

  cancel(id: string): void {
    this.confirmationService.cancelDialog(id);
  }

  // ESC key om dialog te sluiten
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    const dialogs = this.dialogs();
    if (dialogs.length > 0) {
      // Sluit de laatste (bovenste) dialog
      this.cancel(dialogs[dialogs.length - 1].id);
    }
  }

  // Prevent clicks op backdrop om dialog te sluiten
  onBackdropClick(event: MouseEvent, dialogId: string): void {
    if (event.target === event.currentTarget) {
      this.cancel(dialogId);
    }
  }

  getIconPath(type: string): string {
    switch (type) {
      case 'danger':
        return 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }

  getConfirmButtonClasses(type: string): string {
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';
    
    switch (type) {
      case 'danger':
        return `${baseClasses} bg-red-600 text-white hover:bg-red-700 focus:ring-red-500`;
      case 'warning':
        return `${baseClasses} bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500`;
      case 'info':
        return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
      default:
        return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500`;
    }
  }
}