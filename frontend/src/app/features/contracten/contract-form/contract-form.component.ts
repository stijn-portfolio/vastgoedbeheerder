import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ContractService } from '../../../core/services/contract.service';
import { VastgoedService } from '../../../core/services/vastgoed.service';
import { HuurderService } from '../../../core/services/huurder.service';
import { Contract } from '../../../core/models/contract';
import { Vastgoed } from '../../../core/models/vastgoed';
import { Huurder } from '../../../core/models/huurder';
import { ToastService } from '../../../shared/services/toast.service';


@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.css']
})
export class ContractFormComponent implements OnInit {
  contract: Contract = {
    id: 0,
    vastgoedID: 0,
    huurderID: 0,
    startDatum: '',
    eindDatum: '',
    huurprijs: 0,
  };
  vastgoedLijst: Vastgoed[] = [];
  huurderLijst: Huurder[] = [];
  isEditMode = false;
  isSubmitted = false;
  errorMessage: string = '';
  isLoading: boolean = true; // Variabele voor de spinner

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private contractService: ContractService,
    private vastgoedService: VastgoedService,
    private huurderService: HuurderService,
    private toastService: ToastService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true; // Start de spinner
    this.loadVastgoed();
    this.loadHuurders();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.loadContract(+id);
    } else {
      this.isLoading = false; // Stop de spinner als er geen ID is
    }
  }

loadContract(id: number): void {
  this.contractService.getContractById(id).subscribe({
    next: (data) => {
      // Converteer datums naar het juiste formaat voor HTML date inputs
      this.contract = {
        ...data,
        startDatum: this.formatDateForInput(data.startDatum),
        eindDatum: this.formatDateForInput(data.eindDatum)
      };
    },
    error: (error) => {
      this.errorMessage = 'Er is een fout opgetreden bij het laden van het contract: ' + error.message;
    },
    complete: () => {
      this.isLoading = false;
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

  loadVastgoed(): void {
    this.vastgoedService.getVastgoed().subscribe({
      next: (data) => {
        this.vastgoedLijst = data;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van vastgoed: ' + error.message;
      }
    });
  }

  loadHuurders(): void {
    this.huurderService.getHuurders().subscribe({
      next: (data) => {
        this.huurderLijst = data;
      },
      error: (error) => {
        this.errorMessage = 'Er is een fout opgetreden bij het laden van huurders: ' + error.message;
      }
    });
  }

  onSubmit(): void {
    this.isSubmitted = true;

    // Valideer dat eindDatum na startDatum komt
    if (new Date(this.contract.eindDatum) <= new Date(this.contract.startDatum)) {
      this.errorMessage = 'Einddatum moet na startdatum liggen';
      return;
    }

    if (this.isEditMode) {
      this.contractService.updateContract(this.contract.id, this.contract).subscribe({
        next: () => {
          this.toastService.showSuccess('Contract succesvol bijgewerkt');
          this.router.navigate(['/contracten']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het bijwerken: ' + error.message;}
      });
    } else {
      this.contractService.createContract(this.contract).subscribe({
        next: () => {
          this.toastService.showSuccess('Contract succesvol toegevoegd');
          this.router.navigate(['/contracten']);
        },
        error: (error) => {
          this.errorMessage = 'Er is een fout opgetreden bij het toevoegen: ' + error.message;}
      });
    }
  }
}