import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VastgoedService } from '../../../core/services/vastgoed.service';
import { ContractService } from '../../../core/services/contract.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Vastgoed } from '../../../core/models/vastgoed';
import { Contract } from '../../../core/models/contract';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

@Component({
  selector: 'app-vastgoed-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './vastgoed-list.component.html',
  styleUrls: ['./vastgoed-list.component.css']
})
export class VastgoedListComponent implements OnInit {
  // Signals voor reactive state
  vastgoedList = signal<Vastgoed[]>([]);
  filteredVastgoedList = signal<Vastgoed[]>([]);
  contracten = signal<Contract[]>([]); // Toegevoegd
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(true);
  types = signal<string[]>([]);

  // Sortering signals
  sortField = signal<'naam' | 'adres' | 'status' | null>(null);
  sortAscending = signal<boolean>(true);

  // Vastgoed-contract mapping
  vastgoedContractMap = signal<Map<number, Contract[]>>(new Map()); // Toegevoegd

  // Filter form
  filterForm: FormGroup;

  // Dependency injection
  private vastgoedService = inject(VastgoedService);
  private contractService = inject(ContractService); // Toegevoegd
  public authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef); // Toegevoegd voor change detection
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  constructor() {
    this.filterForm = this.fb.group({
      type: [null],
      oppervlakteMin: [0],
      oppervlakteMax: [200],
      kamersMin: [0],
      kamersMax: [10],
      search: [''],
      activeOnly: [false] // Toegevoegd voor actieve vastgoed filter
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
      // Forceer een detectiecyclus na het toepassen van filters
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.loadVastgoed();
  }

  loadVastgoed(): void {
    this.isLoading.set(true);

    this.vastgoedService.getVastgoed().subscribe({
      next: (data) => {
        this.vastgoedList.set(data);
        const uniqueTypes = Array.from(new Set(data.map(v => v.type))).sort();
        this.types.set(uniqueTypes);

        // Nu contracten laden om te bepalen welke vastgoed actief verhuurd is
        this.loadContracten();
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van vastgoed: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }

  // Nieuwe functie om contracten te laden
  loadContracten(): void {
    this.contractService.getContracten().subscribe({
      next: (contracts) => {
        this.contracten.set(contracts);

        // Creëer een mapping tussen vastgoed en hun contracten
        const contractMap = new Map<number, Contract[]>();

        contracts.forEach(contract => {
          if (!contractMap.has(contract.vastgoedID)) {
            contractMap.set(contract.vastgoedID, []);
          }
          contractMap.get(contract.vastgoedID)?.push(contract);
        });

        this.vastgoedContractMap.set(contractMap);

        // Nu we de contracten hebben, kunnen we filters toepassen
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van contracten: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }

  resetFilters(): void {
    this.filterForm.patchValue({
      type: null,
      oppervlakteMin: 0,
      oppervlakteMax: 200,
      kamersMin: 0,
      kamersMax: 10,
      search: '',
      activeOnly: false // Reset de activeOnly filter
    });
  }

  // Methode om te sorteren op verschillende velden, inclusief status
  toggleSort(field: 'naam' | 'adres' | 'status'): void {
    if (this.sortField() === field) {
      // Als al op dit veld wordt gesorteerd, verander de richting
      this.sortAscending.update(current => !current);
    } else {
      // Anders, wijzig het sorteerveld en reset naar oplopend
      this.sortField.set(field);
      this.sortAscending.set(true);
    }

    this.sortVastgoed();
  }

  // Methode om vastgoed te sorteren
  sortVastgoed(): void {
    const sortField = this.sortField();
    const sortAscending = this.sortAscending();

    if (!sortField) {
      return; // Geen sortering nodig
    }

    let sortedVastgoed = [...this.filteredVastgoedList()];

    if (sortField === 'naam' || sortField === 'adres') {
      // Sorteren op tekstvelden
      sortedVastgoed.sort((a, b) => {
        const compareResult = a[sortField].localeCompare(b[sortField]);
        return sortAscending ? compareResult : -compareResult;
      });
    } else if (sortField === 'status') {
      // Sorteren op status (verhuurd/beschikbaar)
      sortedVastgoed.sort((a, b) => {
        const statusA = this.isVastgoedActief(a.id);
        const statusB = this.isVastgoedActief(b.id);

        // Eerst vergelijken we de status (boolean vergelijking)
        if (statusA !== statusB) {
          // Als sortAscending is true, dan komen verhuurde panden eerst (true komt voor false)
          // Als sortAscending is false, dan komen beschikbare panden eerst (false komt voor true)
          return sortAscending ? (statusA ? -1 : 1) : (statusA ? 1 : -1);
        }

        // Als de status gelijk is, sorteren we op naam als secundair sorteercriterium
        return a.naam.localeCompare(b.naam);
      });
    }

    // console.log(`Sorteren op ${sortField}, oplopend: ${sortAscending}`);
    this.filteredVastgoedList.set(sortedVastgoed);
  }

  applyFilters(): void {
    let filtered = this.vastgoedList();
    const filters = this.filterForm.value;

    // Filter op type
    if (filters.type) {
      filtered = filtered.filter(v => v.type === filters.type);
    }

    // Filter op oppervlakte
    if (filters.oppervlakteMin !== null && filters.oppervlakteMin !== 0) {
      filtered = filtered.filter(v => v.oppervlakte >= filters.oppervlakteMin);
    }

    if (filters.oppervlakteMax !== null && filters.oppervlakteMax !== 200) {
      filtered = filtered.filter(v => v.oppervlakte <= filters.oppervlakteMax);
    }

    // Filter op minimum aantal kamers
    if (filters.kamersMin !== null && filters.kamersMin > 0) {
      filtered = filtered.filter(v => v.kamers >= filters.kamersMin);
    }

    // Filter op maximum aantal kamers
    if (filters.kamersMax !== null && filters.kamersMax < 10) {
      filtered = filtered.filter(v => v.kamers <= filters.kamersMax);
    }

    // Filter op zoekterm
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(v =>
        v.naam.toLowerCase().includes(searchTerm) ||
        v.adres.toLowerCase().includes(searchTerm) ||
        v.type.toLowerCase().includes(searchTerm)
      );
    }

    // Filter op status (alleen actief verhuurde vastgoed)
    if (filters.activeOnly) {
      // console.log('Toepassen van actief verhuurde vastgoed filter');
      const today = new Date();

      filtered = filtered.filter(vastgoed => {
        const vastgoedContracten = this.vastgoedContractMap().get(vastgoed.id) || [];
        const isActief = vastgoedContracten.some(contract => {
          const eindDatum = new Date(contract.eindDatum);
          return eindDatum >= today;
        });

        // console.log(`Vastgoed ${vastgoed.naam} (${vastgoed.id}) is ${isActief ? 'actief verhuurd' : 'niet actief verhuurd'}`);
        return isActief;
      });
    }

    // console.log(`Na filtering: ${filtered.length} vastgoed`);
    this.filteredVastgoedList.set(filtered);

    // Pas sortering toe na filtering indien een sorteerveld is geselecteerd
    if (this.sortField()) {
      this.sortVastgoed();
    }

    // Forceer een extra detectiecyclus na het instellen van de gefilterde vastgoed
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  // Helper functie om te bepalen of een vastgoed actief verhuurd is
  isVastgoedActief(vastgoedId: number): boolean {
    const vastgoedContracten = this.vastgoedContractMap().get(vastgoedId) || [];
    const today = new Date();

    return vastgoedContracten.some(contract => {
      const eindDatum = new Date(contract.eindDatum);
      return eindDatum >= today;
    });
  }

  deleteVastgoed(id: number): void {

    const vastgoed = this.vastgoedList().find(v => v.id === id);
    const vastgoedNaam = vastgoed ? vastgoed.naam : 'dit vastgoed';

    this.confirmationService.confirm({
      title: 'Vastgoed verwijderen',
      message: `Weet je zeker dat je "${vastgoedNaam}" wilt verwijderen?`,
      warning: 'Dit verwijdert ook alle gerelateerde contracten en transacties! Deze actie kan niet ongedaan worden gemaakt.',
      confirmText: 'Verwijderen',
      cancelText: 'Annuleren',
      type: 'danger'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.vastgoedService.deleteVastgoed(id).subscribe({
          next: () => {
            this.toastService.showSuccess('Vastgoed succesvol verwijderd');
            this.loadVastgoed();
          },
          error: (error) => {
            this.toastService.showError('Fout bij verwijderen van vastgoed', error.message);
          }
        });
      }
    });
  }
}