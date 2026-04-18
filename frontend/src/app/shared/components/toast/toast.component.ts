// src/app/shared/components/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {
  private toastService = inject(ToastService);
  
  toasts = this.toastService.toasts$;

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getToastClasses(toast: Toast): string {
    const baseClasses = 'flex items-start p-4 mb-3 rounded-lg shadow-lg border-l-4 max-w-sm transform transition-all duration-300 ease-in-out';
    
    switch (toast.type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-500 text-gray-800`;
    }
  }

  getIcon(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'M5 13l4 4L19 7';
      case 'error':
        return 'M6 18L18 6M6 6l12 12';
      case 'warning':
        return 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }
}