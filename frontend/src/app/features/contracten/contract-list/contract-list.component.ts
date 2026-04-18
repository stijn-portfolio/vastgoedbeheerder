import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // ReactiveFormsModule toegevoegd
import { ContractService } from '../../../core/services/contract.service';
import { VastgoedService } from '../../../core/services/vastgoed.service';
import { HuurderService } from '../../../core/services/huurder.service';
import { Contract } from '../../../core/models/contract';
import { Vastgoed } from '../../../core/models/vastgoed';
import { Huurder } from '../../../core/models/huurder';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule], // ReactiveFormsModule toegevoegd
  templateUrl: './contract-list.component.html',
  styleUrls: ['./contract-list.component.css']
})
export class ContractListComponent implements OnInit {
  // Signals voor state management
  contracten = signal<Contract[]>([]);
  filteredContracten = signal<Contract[]>([]); // Nieuwe signal voor gefilterde contracten
  vastgoedMap = signal<Map<number, Vastgoed>>(new Map());
  huurderMap = signal<Map<number, Huurder>>(new Map());
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(true);
    sortField = signal<'startDatum' | 'eindDatum' | 'huurprijs' | null>(null);
  sortAscending = signal<boolean>(true);
  
  // Filter form
  filterForm: FormGroup;

  constructor(
    private contractService: ContractService,
    private vastgoedService: VastgoedService,
    private huurderService: HuurderService,
    private fb: FormBuilder, // FormBuilder toegevoegd
    private cdr: ChangeDetectorRef, // ChangeDetectorRef toegevoegd
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { 
    // Filter formulier initialiseren
    this.filterForm = this.fb.group({
      vastgoedId: [null],
      huurderId: [null],
      searchTerm: [''],
      activeOnly: [false]
    });
    
    // Luisteren naar veranderingen om filters toe te passen
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    
    // Laad alle gegevens
    this.loadContracten();
    this.loadVastgoed();
    this.loadHuurders();
  }

  loadContracten(): void {
    this.contractService.getContracten().subscribe({
      next: (data) => {
        this.contracten.set(data);
        this.filteredContracten.set(data); // Initialiseer gefilterde contracten met alle contracten
        this.checkLoadingStatus();
        this.applyFilters(); // Pas filters toe na laden van contracten
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van contracten: ' + error.message);
        this.checkLoadingStatus();
      }
    });
  }

  loadVastgoed(): void {
    this.vastgoedService.getVastgoed().subscribe({
      next: (data) => {
        const newMap = new Map<number, Vastgoed>();
        data.forEach(vastgoed => {
          newMap.set(vastgoed.id, vastgoed);
        });
        this.vastgoedMap.set(newMap);
        this.checkLoadingStatus();
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van vastgoed: ' + error.message);
        this.checkLoadingStatus();
      }
    });
  }

  loadHuurders(): void {
    this.huurderService.getHuurders().subscribe({
      next: (data) => {
        const newMap = new Map<number, Huurder>();
        data.forEach(huurder => {
          newMap.set(huurder.id, huurder);
        });
        this.huurderMap.set(newMap);
        this.checkLoadingStatus();
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van huurders: ' + error.message);
        this.checkLoadingStatus();
      }
    });
  }
// Nieuwe methode voor sorteren
  toggleSort(field: 'startDatum' | 'eindDatum' | 'huurprijs'): void {
    if (this.sortField() === field) {
      // Als al op dit veld wordt gesorteerd, verander de richting
      this.sortAscending.update(current => !current);
    } else {
      // Anders, wijzig het sorteerveld en reset naar oplopend
      this.sortField.set(field);
      this.sortAscending.set(true);
    }
    
    this.sortContracten();
  }
  
  // Methode om contracten te sorteren
  sortContracten(): void {
    const sortField = this.sortField();
    const sortAscending = this.sortAscending();
    
    if (!sortField) {
      return; // Geen sortering nodig
    }
    
    let sortedContracten = [...this.filteredContracten()];
    
    if (sortField === 'startDatum' || sortField === 'eindDatum') {
      // Sorteer op datum (startDatum of eindDatum)
      sortedContracten.sort((a, b) => {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortAscending ? dateA - dateB : dateB - dateA;
      });
    } else if (sortField === 'huurprijs') {
      // Sorteer op huurprijs
      sortedContracten.sort((a, b) => {
        return sortAscending ? a.huurprijs - b.huurprijs : b.huurprijs - a.huurprijs;
      });
    }
    
    // console.log(`Sorteren op ${sortField}, oplopend: ${sortAscending}`);
    this.filteredContracten.set(sortedContracten);
  }

  // Filters toepassen
  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = this.contracten();
    
    // Filter op vastgoed
    if (filters.vastgoedId) {
      filtered = filtered.filter(contract => contract.vastgoedID === filters.vastgoedId);
    }
    
    // Filter op huurder
    if (filters.huurderId) {
      filtered = filtered.filter(contract => contract.huurderID === filters.huurderId);
    }
    
    // Filter op zoekterm (zoeken in vastgoednaam of huurdernaam)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(contract => {
        const vastgoed = this.vastgoedMap().get(contract.vastgoedID);
        const huurder = this.huurderMap().get(contract.huurderID);
        
        return (vastgoed && vastgoed.naam.toLowerCase().includes(searchTerm)) || 
               (huurder && huurder.naam.toLowerCase().includes(searchTerm));
      });
    }
    
    // Filter op actieve contracten
    if (filters.activeOnly) {
      const today = new Date();
      filtered = filtered.filter(contract => {
        const eindDatum = new Date(contract.eindDatum);
        return eindDatum >= today;
      });
    }
    
    // console.log(`Na filtering: ${filtered.length} contracten`);
    this.filteredContracten.set(filtered);

    // Pas sortering toe na filtering indien een sorteerveld is geselecteerd
    if (this.sortField()) {
      this.sortContracten();
    }

  }
  
  // Reset filters
  resetFilters(): void {
    this.filterForm.reset({
      vastgoedId: null,
      huurderId: null,
      searchTerm: '',
      activeOnly: false
    });
  }

  private checkLoadingStatus(): void {
    // Controleer of alle data geladen is
    if (this.contracten().length > 0 && 
        this.vastgoedMap().size > 0 && 
        this.huurderMap().size > 0) {
      this.isLoading.set(false);
    }
  }

  getVastgoedNaam(vastgoedId: number): string {
    return this.vastgoedMap().get(vastgoedId)?.naam || 'Onbekend vastgoed';
  }

  getHuurderNaam(huurderId: number): string {
    return this.huurderMap().get(huurderId)?.naam || 'Onbekende huurder';
  }
  
  // Helper functie om te bepalen of een contract actief is
  isContractActief(contract: Contract): boolean {
    const eindDatum = new Date(contract.eindDatum);
    const today = new Date();
    return eindDatum >= today;
  }

deleteContract(id: number): void {
  const contract = this.contracten().find(c => c.id === id);
  const vastgoedNaam = contract ? this.getVastgoedNaam(contract.vastgoedID) : 'dit contract';
  
  this.confirmationService.confirm({
    title: 'Contract verwijderen',
    message: `Weet je zeker dat je het contract voor "${vastgoedNaam}" wilt verwijderen?`,
    warning: 'Deze actie kan niet ongedaan worden gemaakt.',
    confirmText: 'Verwijderen',
    cancelText: 'Annuleren',
    type: 'danger'
  }).subscribe(confirmed => {
    if (confirmed) {
      this.contractService.deleteContract(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Contract succesvol verwijderd');
          this.loadContracten();
        },
        error: (error) => {
          this.toastService.showError('Fout bij verwijderen van contract', error.message);
        }
      });
    }
  });
}
}