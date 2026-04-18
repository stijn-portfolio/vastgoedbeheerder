import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HuurderService } from '../../../core/services/huurder.service';
import { Huurder } from '../../../core/models/huurder';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-huurder-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './huurder-form.component.html',
  styleUrls: ['./huurder-form.component.css']
})
export class HuurderFormComponent implements OnInit {
  huurder: Huurder = {
    id: 0,
    naam: '',
    email: '',
    telefoon: ''
  };
  isEditMode = false;
  errorMessage: string = '';
  isSubmitted = false;
  isLoading: boolean = true; // Variabele voor de spinner

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private huurderService: HuurderService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadHuurder(+id);
    } else {
      this.isLoading = false; // Stop de spinner als er geen ID is
    }
  }

  loadHuurder(id: number): void {
    this.huurderService.getHuurderById(id).subscribe({
      next: (data) => {
        this.huurder = data;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van de huurder: ' + error.message;
      },
      complete: () => {
        this.isLoading = false; // Stop de spinner na het laden
      }
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.isEditMode) {
      this.huurderService.updateHuurder(this.huurder.id, this.huurder).subscribe({
        next: () => {
          this.toastService.showSuccess('Huurder succesvol bijgewerkt.');
          this.router.navigate(['/huurders']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het bijwerken: ' + error.message;}
      });
    } else {
      this.huurderService.createHuurder(this.huurder).subscribe({
        next: () => {
          this.toastService.showSuccess('Huurder succesvol toegevoegd.');
          this.router.navigate(['/huurders']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het toevoegen: ' + error.message;}
      });
    }
  }
}