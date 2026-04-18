import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TransactionService } from '../../../core/services/transaction.service';
import { VastgoedService } from '../../../core/services/vastgoed.service';
import { Transaction } from '../../../core/models/transaction';
import { Vastgoed } from '../../../core/models/vastgoed';
import { ToastService } from '../../../shared/services/toast.service'; // Toast service toegevoegd

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
  transactionForm!: FormGroup;
  isEdit = false;
  transactionId?: number;
  vastgoedId?: number;
  errorMessage = '';
  transactionTypes = ['INKOMST', 'UITGAVE'];
  categories = ['Huur', 'Onderhoud', 'Belastingen', 'Verzekeringen', 'Hypotheek', 'Overig'];
  vastgoedOptions: Vastgoed[] = [];
  isLoading: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private transactionService: TransactionService,
    private vastgoedService: VastgoedService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService // Toast service toegevoegd aan constructor
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadVastgoedOptions();

    // Check if we're editing an existing transaction
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.transactionId = +id;
      this.isEdit = true;
      this.loadTransaction(this.transactionId);
    } else {
      this.isLoading = false;
    }

    // Check if vastgoedId is provided in query params
    const vastgoedId = this.route.snapshot.queryParamMap.get('vastgoedId');
    if (vastgoedId) {
      this.vastgoedId = +vastgoedId;
      this.transactionForm.get('vastgoedId')?.setValue(this.vastgoedId);
    }
  }

  initForm(): void {
    this.transactionForm = this.formBuilder.group({
      vastgoedId: [null, [Validators.required]],
      datum: [new Date().toISOString().split('T')[0], [Validators.required]],
      bedrag: [null, [Validators.required, Validators.min(0.01)]],
      type: ['INKOMST', [Validators.required]],
      categorie: ['', [Validators.required]],
      omschrijving: ['', [Validators.required, Validators.maxLength(200)]]
    });
  }

  loadVastgoedOptions(): void {
    this.vastgoedService.getVastgoed().subscribe({
      next: (vastgoed) => {
        this.vastgoedOptions = vastgoed;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van vastgoed: ' + error.message;
        this.toastService.showError('Fout bij laden van vastgoed', error.message); // Toast toegevoegd
      },
      complete: () => {
        if (!this.isEdit) {
          this.isLoading = false;
        }
      }
    });
  }

 loadTransaction(id: number): void {
  this.transactionService.getTransactionById(id).subscribe({
    next: (transaction) => {
      this.transactionForm.patchValue({
        vastgoedId: transaction.vastgoedId,
        datum: this.formatDateForInput(transaction.datum), // Datum formatteren
        bedrag: transaction.bedrag,
        type: transaction.type,
        categorie: transaction.categorie,
        omschrijving: transaction.omschrijving
      });
      this.vastgoedId = transaction.vastgoedId;
    },
    error: (err) => this.errorMessage = err.message,
    complete: () => {
      this.isLoading = false; // Stop de spinner na het laden van de transactie
    }
  });
}

// Helper methode om datum te formatteren voor HTML date input
private formatDateForInput(dateValue: string | Date): string {
  if (!dateValue) return '';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return '';
  
  // Formatteer naar YYYY-MM-DD formaat
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      // Markeer alle velden als touched om validatiefouten te tonen
      Object.keys(this.transactionForm.controls).forEach(key => {
        const control = this.transactionForm.get(key);
        control?.markAsTouched();
      });
      this.toastService.showWarning('Vul alle verplichte velden correct in'); // Warning toast toegevoegd
      return;
    }

    const transaction: Transaction = {
      id: this.isEdit && this.transactionId ? this.transactionId : 0,
      ...this.transactionForm.value
    };

    if (this.isEdit && this.transactionId) {
      // Update bestaande transactie
      this.transactionService.updateTransaction(this.transactionId, transaction).subscribe({
        next: () => {
          this.toastService.showSuccess('Transactie succesvol bijgewerkt'); // Success toast toegevoegd
          this.navigateBack();
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het bijwerken: ' + error.message;
          this.toastService.showError('Fout bij bijwerken van transactie', error.message); // Error toast toegevoegd
        }
      });
    } else {
      // Nieuwe transactie toevoegen
      this.transactionService.addTransaction(transaction).subscribe({
        next: () => {
          this.toastService.showSuccess('Transactie succesvol toegevoegd'); // Success toast toegevoegd
          this.navigateBack();
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het toevoegen: ' + error.message;
          this.toastService.showError('Fout bij toevoegen van transactie', error.message); // Error toast toegevoegd
        }
      });
    }
  }

  navigateBack(): void {
    if (this.vastgoedId) {
      this.router.navigate(['/vastgoed', this.vastgoedId]);
    } else {
      this.router.navigate(['/transactions']);
    }
  }
}