import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VastgoedService } from '../../../core/services/vastgoed.service';
import { VerhuurderService } from '../../../core/services/verhuurder.service';
import { Vastgoed } from '../../../core/models/vastgoed';
import { Verhuurder } from '../../../core/models/verhuurder';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-vastgoed-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vastgoed-form.component.html',
  styleUrls: ['./vastgoed-form.component.css']
})
export class VastgoedFormComponent implements OnInit {
  vastgoedForm!: FormGroup;
  verhuurders: Verhuurder[] = [];
  isEditMode = false;
  vastgoedId: number | null = null;
  errorMessage: string = '';
  isLoading: boolean = true; // Variabele voor de spinner

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private vastgoedService: VastgoedService,
    private verhuurderService: VerhuurderService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadVerhuurders();

    // Check of we in edit mode zijn
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.vastgoedId = +id;
      this.loadVastgoed(+id);
    } else {
      this.isLoading = false; // Stop de spinner als er geen ID is
    }
  }

  createForm(): void {
    this.vastgoedForm = this.formBuilder.group({
      naam: ['', [Validators.required, Validators.minLength(3)]],
      adres: ['', Validators.required],
      type: ['', Validators.required],
      kamers: [0, [Validators.required, Validators.min(1)]],
      oppervlakte: [0, [Validators.required, Validators.min(1)]],
      verhuurderID: [null, Validators.required]
    });
  }

  loadVerhuurders(): void {
    this.verhuurderService.getVerhuurders().subscribe({
      next: (data) => {
        this.verhuurders = data;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van verhuurders: ' + error.message;
      },
      complete: () => {
        if (!this.isEditMode) {
          this.isLoading = false; // Stop de spinner als we niet in edit-modus zijn
        }
      }
    });
  }

  loadVastgoed(id: number): void {
    this.vastgoedService.getVastgoedById(id).subscribe({
      next: (data) => {
        this.vastgoedForm.patchValue(data);
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van vastgoed: ' + error.message;
      },
      complete: () => {
        this.isLoading = false; // Stop de spinner na het laden van vastgoed
      }
    });
  }

  onSubmit(): void {
    if (this.vastgoedForm.invalid) {
      return;
    }

    const vastgoed: Vastgoed = this.vastgoedForm.value;

    if (this.isEditMode && this.vastgoedId) {
      this.vastgoedService.updateVastgoed(this.vastgoedId, vastgoed).subscribe({
        next: () => {
          this.toastService.showSuccess('Vastgoed succesvol bijgewerkt.');
          this.router.navigate(['/vastgoed']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het bijwerken: ' + error.message;}
      });
    } else {
      this.vastgoedService.createVastgoed(vastgoed).subscribe({
        next: () => {
          this.toastService.showSuccess('Vastgoed succesvol toegevoegd.');
          this.router.navigate(['/vastgoed']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het toevoegen: ' + error.message;}
      });
    }
  }
}