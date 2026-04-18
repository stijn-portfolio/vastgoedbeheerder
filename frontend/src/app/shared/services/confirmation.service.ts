// src/app/shared/services/confirmation.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ConfirmationOptions {
  title: string;
  message: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

interface ConfirmationDialog extends ConfirmationOptions {
  id: string;
  result: Subject<boolean>;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private dialogs = signal<ConfirmationDialog[]>([]);
  
  // Public readonly signal voor components
  public readonly dialogs$ = this.dialogs.asReadonly();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  confirm(options: ConfirmationOptions): Observable<boolean> {
    const result = new Subject<boolean>();
    
    const dialog: ConfirmationDialog = {
      id: this.generateId(),
      title: options.title,
      message: options.message,
      warning: options.warning,
      confirmText: options.confirmText || 'Bevestigen',
      cancelText: options.cancelText || 'Annuleren',
      type: options.type || 'danger',
      icon: options.icon,
      result
    };

    this.dialogs.update(current => [...current, dialog]);

    return result.asObservable();
  }

  confirmDialog(id: string): void {
    const dialog = this.dialogs().find(d => d.id === id);
    if (dialog) {
      dialog.result.next(true);
      dialog.result.complete();
      this.removeDialog(id);
    }
  }

  cancelDialog(id: string): void {
    const dialog = this.dialogs().find(d => d.id === id);
    if (dialog) {
      dialog.result.next(false);
      dialog.result.complete();
      this.removeDialog(id);
    }
  }

  private removeDialog(id: string): void {
    this.dialogs.update(current => current.filter(d => d.id !== id));
  }

  // Convenience methods voor veel voorkomende scenarios
  confirmDelete(itemName: string, additionalWarning?: string): Observable<boolean> {
    return this.confirm({
      title: 'Item verwijderen',
      message: `Weet je zeker dat je "${itemName}" wilt verwijderen?`,
      warning: additionalWarning || 'Deze actie kan niet ongedaan worden gemaakt.',
      confirmText: 'Verwijderen',
      cancelText: 'Annuleren',
      type: 'danger'
    });
  }

  confirmSave(message?: string): Observable<boolean> {
    return this.confirm({
      title: 'Wijzigingen opslaan',
      message: message || 'Wil je de wijzigingen opslaan?',
      confirmText: 'Opslaan',
      cancelText: 'Annuleren',
      type: 'info'
    });
  }
}