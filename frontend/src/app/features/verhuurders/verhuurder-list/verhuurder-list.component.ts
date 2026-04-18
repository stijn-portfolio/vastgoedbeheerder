import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VerhuurderService } from '../../../core/services/verhuurder.service';
import { Verhuurder } from '../../../core/models/verhuurder';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

@Component({
  selector: 'app-verhuurder-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verhuurder-list.component.html',
  styleUrls: ['./verhuurder-list.component.css']
})
export class VerhuurderListComponent implements OnInit {
  verhuurders: Verhuurder[] = [];
  errorMessage: string = '';
  isLoading: boolean = true; // Variabele voor de spinner

  constructor(
    private verhuurderService: VerhuurderService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadVerhuurders();
  }

  loadVerhuurders(): void {
    this.isLoading = true; // Start de spinner
    this.verhuurderService.getVerhuurders().subscribe({
      next: (data) => {
        this.verhuurders = data;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van syndici: ' + error.message;
      },
      complete: () => {
        this.isLoading = false; // Stop de spinner na het laden
      }
    });
  }

deleteVerhuurder(id: number): void {
  const verhuurder = this.verhuurders.find(v => v.id === id);
  const verhuurderNaam = verhuurder ? verhuurder.naam : 'deze syndicus';
  
  this.confirmationService.confirm({
    title: 'Syndicus verwijderen',
    message: `Weet je zeker dat je "${verhuurderNaam}" wilt verwijderen?`,
    warning: 'Dit verwijdert ook alle gerelateerde vastgoed! Deze actie kan niet ongedaan worden gemaakt.',
    confirmText: 'Verwijderen',
    cancelText: 'Annuleren',
    type: 'danger'
  }).subscribe(confirmed => {
    if (confirmed) {
      this.verhuurderService.deleteVerhuurder(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Syndicus succesvol verwijderd');
          this.loadVerhuurders();
        },
        error: (error) => {
          this.toastService.showError('Fout bij verwijderen van syndicus', error.message);
        }
      });
    }
  });
}
}