import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VastgoedService } from '../../../core/services/vastgoed.service';
import { VerhuurderService } from '../../../core/services/verhuurder.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Vastgoed } from '../../../core/models/vastgoed';
import { Verhuurder } from '../../../core/models/verhuurder';
import { TransactionService } from '../../../core/services/transaction.service';
import { Transaction } from '../../../core/models/transaction';
import { ContractService } from '../../../core/services/contract.service';
import { Contract } from '../../../core/models/contract';
import { HuurderService } from '../../../core/services/huurder.service';
import { Huurder } from '../../../core/models/huurder';
import { CustomNumberPipe } from '../../../shared/pipes/custom-number.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

@Component({
  selector: 'app-vastgoed-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomNumberPipe],
  templateUrl: './vastgoed-detail.component.html',
  styleUrls: ['./vastgoed-detail.component.css']
})
export class VastgoedDetailComponent implements OnInit {
  // Signals voor reactieve state
  vastgoed = signal<Vastgoed | null>(null);
  verhuurder = signal<Verhuurder | null>(null);
  transactions = signal<Transaction[]>([]);
  contracts = signal<Contract[]>([]);
  huurders = signal<Map<number, Huurder>>(new Map<number, Huurder>());
  errorMessage = signal<string>('');
  activeTab = signal<'details' | 'transacties'>('details');
  isLoading = signal<boolean>(true);
  sortState = signal<{ field: 'datum' | 'bedrag' | 'type', ascending: boolean } | null>(null);


  // Computed signal voor gesorteerde transacties
  sortedTransactions = computed(() => {
    const sortStateValue = this.sortState();
    if (!sortStateValue) {
      return this.transactions();
    }

    const { field, ascending } = sortStateValue;
    return [...this.transactions()].sort((a, b) => {
      if (field === 'datum') {
        const dateA = new Date(a.datum).getTime();
        const dateB = new Date(b.datum).getTime();
        return ascending ? dateA - dateB : dateB - dateA;
      } else if (field === 'bedrag') {
        return ascending ? a.bedrag - b.bedrag : b.bedrag - a.bedrag;
      } else if (field === 'type') {
        return ascending ? a.type.localeCompare(b.type) : b.type.localeCompare(a.type);
      }
      return 0;
    });
  });


  //  computed signal voor actieve contracten
  actieveContracten = computed(() => {
    const today = new Date();
    return this.contracts().filter(contract => {
      const eindDatum = new Date(contract.eindDatum);
      return eindDatum >= today;
    });
  });

  //  computed signal voor huidige actieve contract (als er een is)
  actiefContract = computed(() => {
    return this.actieveContracten().length > 0 ? this.actieveContracten()[0] : null;
  });

  // Dependency injection via inject functie
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vastgoedService = inject(VastgoedService);
  private verhuurderService = inject(VerhuurderService);
  private transactionService = inject(TransactionService);
  private contractService = inject(ContractService);
  private huurderService = inject(HuurderService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  // Computed values
  totalIncome = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'INKOMST')
      .reduce((sum, transaction) => sum + transaction.bedrag, 0);
  });

  totalExpenses = computed(() => {
    return this.transactions()
      .filter(t => t.type === 'UITGAVE')
      .reduce((sum, transaction) => sum + transaction.bedrag, 0);
  });

  balance = computed(() => {
    return this.totalIncome() - this.totalExpenses();
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = +idParam;
      this.loadAllData(id);
    } else {
      this.errorMessage.set("Geen geldig ID gevonden in de URL.");
      this.isLoading.set(false); // Stop de spinner bij een fout
    }
  }

  loadAllData(vastgoedId: number): void {
    this.isLoading.set(true); // Start de spinner
    this.loadVastgoed(vastgoedId);
    this.loadTransactions(vastgoedId);
    this.loadContracts(vastgoedId);

  }

  loadVastgoed(id: number): void {
    this.vastgoedService.getVastgoedById(id).subscribe({
      next: (data) => {
        this.vastgoed.set(data);
        if (data && data.verhuurderID) {
          this.loadVerhuurder(data.verhuurderID);
        } else if (!data) {
          this.errorMessage.set('Vastgoed data niet gevonden na laden.');
        }
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van vastgoed: ' + (error.message || 'Onbekende fout'));
        this.vastgoed.set(null);
      },
      complete: () => {
        this.isLoading.set(false); // Stop de spinner na het laden
      }
    });
  }

  loadVerhuurder(id: number): void {
    this.verhuurderService.getVerhuurderById(id).subscribe({
      next: (data) => {
        this.verhuurder.set(data);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van de verhuurder: ' + (error.message || 'Onbekende fout'));
        this.verhuurder.set(null);
      }
    });
  }

  loadTransactions(vastgoedId: number): void {
    this.transactionService.getTransactionsByVastgoedId(vastgoedId).subscribe({
      next: (data) => {
        this.transactions.set(data ?? []);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van transacties: ' + (error.message || 'Onbekende fout'));
        this.transactions.set([]);
      }
    });
  }

  loadContracts(vastgoedId: number): void {
    this.contractService.getContractenByVastgoed(vastgoedId).subscribe({
      next: (data) => {
        this.contracts.set(data ?? []);
        const huurderIds = [...new Set(data?.map(c => c.huurderID) || [])];

        // Maak een kopie van de huidige map
        const huurderMap = new Map(this.huurders());



        huurderIds.forEach(id => {
          this.huurderService.getHuurderById(id).subscribe({
            next: (huurder) => {
              // Update de kopie en set de nieuwe map in het signal
              huurderMap.set(id, huurder);
              this.huurders.set(new Map(huurderMap));
            },
            error: (error) => {
              console.error(`Fout bij laden huurder ${id}:`, error);
            }
          });
        });
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van contracten: ' + (error.message || 'Onbekende fout'));
        this.contracts.set([]);
      }
    });
  }

  deleteVastgoed(): void {
    if (!this.authService.isAdmin()) {
      this.errorMessage.set("Alleen administrators mogen vastgoed verwijderen.");
      return;
    }

    const currentVastgoed = this.vastgoed();
    if (!currentVastgoed) return;

    const vastgoedNaam = currentVastgoed.adres || 'dit vastgoed';
    this.confirmationService.confirm({
      title: 'Vastgoed verwijderen',
      message: `Weet je zeker dat je "${vastgoedNaam}" wilt verwijderen?`,
      warning: 'Dit verwijdert ook alle gerelateerde contracten en transacties! Deze actie kan niet ongedaan worden gemaakt.',
      confirmText: 'Verwijderen',
      cancelText: 'Annuleren',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.vastgoedService.deleteVastgoed(currentVastgoed.id).subscribe({
          next: () => {
            this.toastService.showSuccess('Vastgoed succesvol verwijderd');
            this.router.navigate(['/vastgoed']);
          },
          error: (error) => {
            this.toastService.showError('Fout bij verwijderen van vastgoed', error.message);
          }
        });
      }
    });

  }

  deleteTransaction(id: number): void {
    const transaction = this.transactions().find(t => t.id === id);
    const beschrijving = transaction ? transaction.omschrijving : 'deze transactie';

    this.confirmationService.confirm({
      title: 'Transactie verwijderen',
      message: `Weet je zeker dat je "${beschrijving}" wilt verwijderen?`,
      warning: 'Deze actie kan niet ongedaan worden gemaakt.',
      confirmText: 'Verwijderen',
      cancelText: 'Annuleren',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.transactionService.deleteTransaction(id).subscribe({
          next: () => {
            this.toastService.showSuccess('Transactie succesvol verwijderd');
            this.transactions.update(transactions =>
              transactions.filter(t => t.id !== id)
            );
          },
          error: (error) => {
            this.toastService.showError('Fout bij verwijderen van transactie', error.message);
          }
        });
      }
    });
  }

  setActiveTab(tab: 'details' | 'transacties'): void {
    this.activeTab.set(tab);
  }


  // Helper functie om te bepalen of een contract actief is
  isContractActief(contract: Contract): boolean {
    const eindDatum = new Date(contract.eindDatum);
    const today = new Date();
    return eindDatum >= today;
  }

  // Helper functie om te bepalen of vastgoed actief verhuurd is
  isVastgoedVerhuurd(): boolean {
    return this.actieveContracten().length > 0;
  }


  getHuurderNaam(huurderId: number): string {
    const huurder = this.huurders().get(huurderId);
    return huurder ? huurder.naam : 'Onbekende huurder';
  }

  getHuurder(huurderId: number): Huurder | undefined {
    return this.huurders().get(huurderId);
  }

  // Sorteer methode voor transacties
  sortTransactionsBy(field: 'datum' | 'bedrag' | 'type'): void {
    this.sortState.update(current => {
      if (!current || current.field !== field) {
        return { field, ascending: true };
      }
      // Toggle ascending/descending
      return { field, ascending: !current.ascending };
    });
  }


}