import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VerhuurderService } from '../../../core/services/verhuurder.service';
import { Verhuurder } from '../../../core/models/verhuurder';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-verhuurder-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verhuurder-form.component.html',
  styleUrls: ['./verhuurder-form.component.css']
})
export class VerhuurderFormComponent implements OnInit {
  verhuurderForm!: FormGroup;
  isEditMode = false;
  verhuurderID: number | null = null;
  errorMessage: string = '';
  isLoading: boolean = true; // Variabele voor de spinner

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private verhuurderService: VerhuurderService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.createForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.verhuurderID = +id;
      this.loadVerhuurder(+id);
    } else {
      this.isLoading = false; // Stop de spinner als er geen ID is
    }
  }

  createForm(): void {
    this.verhuurderForm = this.formBuilder.group({
      naam: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
telefoon: ['', [Validators.required, Validators.pattern('^(0[1-9][0-9]{7}|04[0-9]{8})$')]]    });
  }

  loadVerhuurder(id: number): void {
    this.verhuurderService.getVerhuurderById(id).subscribe({
      next: (data) => {
        this.verhuurderForm.patchValue(data);
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van de verhuurder: ' + error.message;
      },
      complete: () => {
        this.isLoading = false; // Stop de spinner na het laden
      }
    });
  }

  onSubmit(): void {
    if (this.verhuurderForm.invalid) {
      return;
    }

    const verhuurder: Verhuurder = this.verhuurderForm.value;

    if (this.isEditMode && this.verhuurderID) {
      this.verhuurderService.updateVerhuurder(this.verhuurderID, verhuurder).subscribe({
        next: () => {
          this.toastService.showSuccess('Verhuurder succesvol bijgewerkt.');
          this.router.navigate(['/syndici']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het bijwerken: ' + error.message;}
      });
    } else {
      this.verhuurderService.createVerhuurder(verhuurder).subscribe({
        next: () => {
          this.toastService.showSuccess('Verhuurder succesvol toegevoegd.');
          this.router.navigate(['/syndici']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het toevoegen: ' + error.message;}
      });
    }
  }
}