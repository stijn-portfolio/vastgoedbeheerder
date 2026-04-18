import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { VastgoedService } from '../../../core/services/vastgoed.service';
import { Transaction } from '../../../core/models/transaction';
import { Vastgoed } from '../../../core/models/vastgoed';
import { AuthService } from '../../../core/auth/auth.service';
import { CustomNumberPipe } from '../../../shared/pipes/custom-number.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DatePipe, CustomNumberPipe],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  // Services via inject
  private transactionService = inject(TransactionService);
  private vastgoedService = inject(VastgoedService);
  private route = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  // Math object beschikbaar maken voor template
  Math = Math;

  // Signals
  currentVastgoed = signal<Vastgoed | null>(null);
  isVastgoedSpecificView = signal<boolean>(false);
  transactions = signal<Transaction[]>([]);
  allTransactions = signal<Transaction[]>([]);
  vastgoedOptions = signal<Vastgoed[]>([]);
  vastgoedMap = signal<Map<number, string>>(new Map());
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(true);
  sortState = signal<{ field: 'datum' | 'bedrag', ascending: boolean } | null>(null);
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Filter signals
  selectedType = signal<string | null>(null);
  selectedVastgoedId = signal<number | null>(null);
  selectedDateRange = signal<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  searchQuery = signal<string>('');

  // Filter form
  filterForm: FormGroup;

  // Helper functie om alleen de datumcomponenten te vergelijken (zonder tijd)
  private compareDatesOnly(date1: Date, date2: Date, operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq'): boolean {
    // Normaliseer naar alleen de datum (zonder tijd)
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());

    const time1 = d1.getTime();
    const time2 = d2.getTime();

    switch (operator) {
      case 'lt': return time1 < time2;
      case 'lte': return time1 <= time2;
      case 'gt': return time1 > time2;
      case 'gte': return time1 >= time2;
      case 'eq': return time1 === time2;
      default: return false;
    }
  }

  // Computed values
  filteredTransactions = computed(() => {
    return this.allTransactions().filter(transaction => {
      // Filter op type
      if (this.selectedType() && transaction.type !== this.selectedType()) {
        return false;
      }

      // Filter op vastgoed
      if (this.selectedVastgoedId() && transaction.vastgoedId !== this.selectedVastgoedId()) {
        return false;
      }

      // Filter op datum - startdatum
      if (this.selectedDateRange().start) {
        const transactionDate = new Date(transaction.datum);
        const startDate = new Date(this.selectedDateRange().start!);

        if (this.compareDatesOnly(transactionDate, startDate, 'lt')) {
          return false;
        }
      }

      // Filter op datum - einddatum
      if (this.selectedDateRange().end) {
        const transactionDate = new Date(transaction.datum);
        const endDate = new Date(this.selectedDateRange().end!);

        if (this.compareDatesOnly(transactionDate, endDate, 'gt')) {
          return false;
        }
      }

      // Filter op zoekopdracht
      if (this.searchQuery()) {
        const query = this.searchQuery().toLowerCase();
        return (
          transaction.omschrijving.toLowerCase().includes(query) ||
          transaction.categorie.toLowerCase().includes(query) ||
          this.vastgoedMap().get(transaction.vastgoedId)?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  });

  // computed values voor paginatie
  totalPages = computed(() => {
    const totalItems = this.filteredTransactions().length;
    return Math.ceil(totalItems / this.pageSize());
  });

  paginatedTransactions = computed(() => {
    const filtered = this.filteredTransactions();

    // Valideer huidige pagina
    const maxPage = Math.ceil(filtered.length / this.pageSize());
    const currentPage = this.currentPage();

    // Als we op een ongeldige pagina staan, ga naar de laatste geldige pagina
    if (currentPage > maxPage && maxPage > 0) {
      // Gebruik setTimeout om race conditions te voorkomen
      setTimeout(() => this.currentPage.set(maxPage), 0);
      return filtered.slice(0, this.pageSize()); // Toon eerste pagina tijdelijk
    }

    const startIndex = (currentPage - 1) * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    return filtered.slice(startIndex, endIndex);
  });

  totalItems = computed(() => {
    return this.filteredTransactions().length;
  });

  // computed values voor totaalbedragen
  totalIncome = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.type === 'INKOMST')
      .reduce((sum, t) => sum + t.bedrag, 0);
  });

  totalExpenses = computed(() => {
    return this.filteredTransactions()
      .filter(t => t.type === 'UITGAVE')
      .reduce((sum, t) => sum + t.bedrag, 0);
  });

  balance = computed(() => {
    return this.totalIncome() - this.totalExpenses();
  });

  constructor() {
    // Filter formulier initialiseren
    this.filterForm = this.fb.group({
      type: [null],
      vastgoedId: [null],
      dateStart: [null],
      dateEnd: [null],
      search: ['']
    });

    // Een gecombineerde subscription voor alle filter wijzigingen
    this.filterForm.valueChanges.subscribe(() => {
      // Reset pagina VOOR het updaten van filters
      this.currentPage.set(1);

      // Update alle filter signals
      const formValue = this.filterForm.value;
      this.selectedType.set(formValue.type);
      this.selectedVastgoedId.set(formValue.vastgoedId);

      // Datum conversies
      const startDate = formValue.dateStart ? new Date(formValue.dateStart) : null;
      const endDate = formValue.dateEnd ? new Date(formValue.dateEnd) : null;
      this.selectedDateRange.set({ start: startDate, end: endDate });

      this.searchQuery.set(formValue.search || '');
    });
  }

  ngOnInit(): void {
    // Controleer of we in 'vastgoed/:id/transactions' route zijn
    const vastgoedId = this.route.snapshot.paramMap.get('id');

    if (vastgoedId) {
      // We zijn in de vastgoed-specifieke transacties view
      const id = +vastgoedId;
      this.isVastgoedSpecificView.set(true);
      this.selectedVastgoedId.set(id);
      this.loadVastgoedDetails(id);
      this.loadVastgoedTransactions(id);

      // Stel het vastgoed-filter in en schakel het uit
      this.filterForm.get('vastgoedId')?.setValue(id);
      this.filterForm.get('vastgoedId')?.disable();
    } else {
      // We zijn in de normale transactielijst view
      this.isVastgoedSpecificView.set(false);
      this.loadData();
    }
  }


  // method om de pagina te valideren en corrigeren:
  private validateCurrentPage(): void {
    const maxPage = this.totalPages();
    if (this.currentPage() > maxPage && maxPage > 0) {
      this.currentPage.set(maxPage);
    } else if (this.currentPage() < 1) {
      this.currentPage.set(1);
    }
  }

  // methode om vastgoeddetails te laden
  loadVastgoedDetails(vastgoedId: number): void {
    this.vastgoedService.getVastgoedById(vastgoedId).subscribe({
      next: (vastgoed) => {
        this.currentVastgoed.set(vastgoed);
      },
      error: (error) => {
        this.errorMessage.set('Fout bij laden vastgoed: ' + error.message);
      }
    });
  }

  //  methode om transacties voor specifiek vastgoed te laden
  loadVastgoedTransactions(vastgoedId: number): void {
    this.isLoading.set(true);

    // Eerste vastgoed opties laden voor filter dropdown en lookup
    this.vastgoedService.getVastgoed().subscribe({
      next: (vastgoed) => {
        this.vastgoedOptions.set(vastgoed);

        // Vastgoed map maken voor snelle lookup
        const map = new Map<number, string>();
        vastgoed.forEach(v => map.set(v.id, v.naam));
        this.vastgoedMap.set(map);

        // Dan transacties laden voor het vastgoed
        this.transactionService.getTransactionsByVastgoedId(vastgoedId).subscribe({
          next: (data) => {
            this.allTransactions.set(data);
            this.transactions.set(data);
          },
          error: (error) => {
            this.errorMessage.set(`Fout bij laden transacties: ${error.message}`);
          },
          complete: () => {
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        this.errorMessage.set(`Fout bij laden vastgoed: ${error.message}`);
        this.isLoading.set(false);
      }
    });
  }

  // Paginatie navigatie methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }


  //  methoden
  loadData(): void {
    this.isLoading.set(true);

    // Vastgoed opties laden voor filter dropdown
    this.vastgoedService.getVastgoed().subscribe({
      next: (vastgoed) => {
        this.vastgoedOptions.set(vastgoed);

        // Vastgoed map maken voor snelle lookup
        const map = new Map<number, string>();
        vastgoed.forEach(v => map.set(v.id, v.naam));
        this.vastgoedMap.set(map);
      },
      error: (error) => {
        this.errorMessage.set(`Fout bij laden vastgoed: ${error.message}`);
      }
    });

    // Transacties laden
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.allTransactions.set(data);
        this.transactions.set(data); // Stel initieel alle transacties in
      },
      error: (error) => {
        this.errorMessage.set(`Fout bij laden transacties: ${error.message}`);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }


  // Paginatie nummers genereren (slimme paginatie met ...)
  getPaginationNumbers(): (number | string)[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const numbers: (number | string)[] = [];

    if (total <= 7) {
      // Als er 7 of minder pagina's zijn, toon ze allemaal
      for (let i = 1; i <= total; i++) {
        numbers.push(i);
      }
    } else {
      // Complexere logica voor meer dan 7 pagina's
      numbers.push(1);

      if (current <= 4) {
        // Gebruiker is in het begin
        for (let i = 2; i <= 5; i++) {
          numbers.push(i);
        }
        numbers.push('...');
        numbers.push(total);
      } else if (current >= total - 3) {
        // Gebruiker is aan het eind
        numbers.push('...');
        for (let i = total - 4; i <= total; i++) {
          numbers.push(i);
        }
      } else {
        // Gebruiker is in het midden
        numbers.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          numbers.push(i);
        }
        numbers.push('...');
        numbers.push(total);
      }
    }

    return numbers;
  }


  // Reset filters method incl om ook pagina te resetten
  resetFilters(): void {
    // Als we in vastgoed-specifieke view zijn, behoud het vastgoed-filter
    if (this.isVastgoedSpecificView()) {
      const vastgoedId = this.selectedVastgoedId();
      this.filterForm.reset({
        vastgoedId: vastgoedId
      });
      this.selectedType.set(null);
      this.selectedDateRange.set({ start: null, end: null });
      this.searchQuery.set('');
    } else {
      // Normale reset
      this.filterForm.reset();
      this.selectedType.set(null);
      this.selectedVastgoedId.set(null);
      this.selectedDateRange.set({ start: null, end: null });
      this.searchQuery.set('');
    }

    // Reset naar pagina 1
    this.currentPage.set(1);
  }


deleteTransaction(id: number): void {
  const transaction = this.allTransactions().find(t => t.id === id);
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
          this.allTransactions.update(transactions => 
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

  getVastgoedNaam(vastgoedId: number): string {
    return this.vastgoedMap().get(vastgoedId) || `Vastgoed ${vastgoedId}`;
  }

  sortBy(field: 'datum' | 'bedrag'): void {
    this.sortState.update(current => {
      if (!current || current.field !== field) {
        return { field, ascending: true };
      }
      // Toggle ascending/descending
      return { field, ascending: !current.ascending };
    });

    this.allTransactions.update(transactions => {
      const { ascending } = this.sortState()!;
      return [...transactions].sort((a, b) => {
        if (field === 'datum') {
          const dateA = new Date(a.datum).getTime();
          const dateB = new Date(b.datum).getTime();
          return ascending ? dateA - dateB : dateB - dateA;
        } else {
          return ascending ? a.bedrag - b.bedrag : b.bedrag - a.bedrag;
        }
      });
    });
  }

  sortByAmount(ascending: boolean = true): void {
    this.allTransactions.update(transactions => {
      return [...transactions].sort((a, b) => {
        return ascending ? a.bedrag - b.bedrag : b.bedrag - a.bedrag;
      });
    });
  }
}