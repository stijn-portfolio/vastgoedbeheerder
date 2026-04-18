// src/app/shared/services/toast.service.ts
import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  
  // Public readonly signal voor components
  public readonly toasts$ = this.toasts.asReadonly();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private addToast(toast: Omit<Toast, 'id' | 'timestamp'>): void {
    const newToast: Toast = {
      ...toast,
      id: this.generateId(),
      timestamp: new Date(),
      duration: toast.duration ?? 5000 // Default 5 seconden
    };

    this.toasts.update(current => [...current, newToast]);

    // Auto-remove na duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(newToast.id);
      }, newToast.duration);
    }
  }

  showSuccess(message: string, title?: string, duration?: number): void {
    this.addToast({
      type: 'success',
      message,
      title,
      duration
    });
  }

  showError(message: string, title?: string, duration?: number): void {
    this.addToast({
      type: 'error',
      message,
      title,
      duration: duration ?? 8000 // Errors blijven langer staan
    });
  }

  showInfo(message: string, title?: string, duration?: number): void {
    this.addToast({
      type: 'info',
      message,
      title,
      duration
    });
  }

  showWarning(message: string, title?: string, duration?: number): void {
    this.addToast({
      type: 'warning',
      message,
      title,
      duration
    });
  }

  removeToast(id: string): void {
    this.toasts.update(current => current.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toasts.set([]);
  }
}