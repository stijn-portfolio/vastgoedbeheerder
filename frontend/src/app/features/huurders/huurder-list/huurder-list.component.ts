import { Component, OnInit, signal, computed , ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HuurderService } from '../../../core/services/huurder.service';
import { ContractService } from '../../../core/services/contract.service';
import { Huurder } from '../../../core/models/huurder';
import { Contract } from '../../../core/models/contract';
import { ToastService } from '../../../shared/services/toast.service';
import { ConfirmationService } from '../../../shared/services/confirmation.service';

@Component({
  selector: 'app-huurder-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './huurder-list.component.html',
  styleUrls: ['./huurder-list.component.css']
})
export class HuurderListComponent implements OnInit {
  // Signals voor reactive state
  huurders = signal<Huurder[]>([]);
  filteredHuurders = signal<Huurder[]>([]);
  contracten = signal<Contract[]>([]);
  errorMessage = signal<string>('');
  isLoading = signal<boolean>(true);
  sortField = signal<'naam' | 'contractDatum'>('naam');
  sortAscending = signal<boolean>(true);
  
  // Huurder-contract mapping
  huurderContractMap = signal<Map<number, Contract[]>>(new Map());
  
  // Filter form
  filterForm: FormGroup;

  constructor(
    private huurderService: HuurderService,
    private contractService: ContractService,
    private fb: FormBuilder,
     private cdr: ChangeDetectorRef,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {
    // Filter formulier initialiseren
    this.filterForm = this.fb.group({
      searchTerm: [''],
      activeOnly: [false]
    });
    
    // Luisteren naar veranderingen om filters toe te passen
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    this.loadData();
      // Extra luisteraar om de status van activeOnly te monitoren
  this.filterForm.get('activeOnly')?.valueChanges.subscribe(isActive => {
    // console.log(`ActiveOnly filter gewijzigd naar: ${isActive}`);
    if (isActive) {
      // console.log('Toepassen van actieve huurders filter');
    } else {
      // console.log('Actieve huurders filter is uitgeschakeld');
    }
      });
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Eerst huurders laden
    this.huurderService.getHuurders().subscribe({
      next: (data) => {
        this.huurders.set(data);
        this.filteredHuurders.set(data);
        // Laad contracten om status van huurders te bepalen
        this.loadContracten();       
        
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van huurders: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }
  
loadContracten(): void {
  this.contractService.getContracten().subscribe({
    next: (contracts) => {
      this.contracten.set(contracts);
      
      // Creëer een mapping tussen huurders en hun contracten
      const contractMap = new Map<number, Contract[]>();
      
      contracts.forEach(contract => {
        if (!contractMap.has(contract.huurderID)) {
          contractMap.set(contract.huurderID, []);
        }
        contractMap.get(contract.huurderID)?.push(contract);
      });
      
      this.huurderContractMap.set(contractMap);
      
      // Uitgebreide logging
      // console.log('Alle contracten:', contracts.length);
      let contractsPerHuurder = '';
      contractMap.forEach((contracten, huurderId) => {
        contractsPerHuurder += `\nHuurder ID ${huurderId}: ${contracten.length} contracten`;
      });
      // console.log('Contracten per huurder:', contractsPerHuurder);
      
      this.applyFilters();
      this.isLoading.set(false);
    },
    error: (error) => {
      this.errorMessage.set('Er is een fout opgetreden bij het laden van contracten: ' + error.message);
      this.isLoading.set(false);
    }
  });
}

applyFilters(): void {
  const filters = this.filterForm.value;
  let filtered = this.huurders();
  
  // Filter op zoekterm (naam, email, telefoon)
  if (filters.searchTerm) {
    const searchTerm = filters.searchTerm.toLowerCase();
    filtered = filtered.filter(huurder => 
      huurder.naam.toLowerCase().includes(searchTerm) || 
      huurder.email.toLowerCase().includes(searchTerm) || 
      huurder.telefoon.toLowerCase().includes(searchTerm)
    );
  }
  
  // Filter op status (alleen actieve huurders met minstens één actief contract)
  if (filters.activeOnly) {
    const today = new Date();
    
    filtered = filtered.filter(huurder => {
      const huurderContracten = this.huurderContractMap().get(huurder.id) || [];
      const isActief = huurderContracten.some(contract => {
        const eindDatum = new Date(contract.eindDatum);
        return eindDatum >= today;
      });
      
      console.log(`Huurder ${huurder.naam} (${huurder.id}) is ${isActief ? 'actief' : 'inactief'}`);
      return isActief;
    });
  }
  
  // Log de gefilterde resultaten voordat sortering wordt toegepast
  // console.log(`Na filtering: ${filtered.length} huurders`);
  
  // Sorteren
  this.sortHuurders(filtered);

      // Forceer een extra detectiecyclus na het instellen van de gefilterde huurders
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);


}

sortHuurders(huurders: Huurder[]): void {
  const sortField = this.sortField();
  const sortAscending = this.sortAscending();
  
  let sortedHuurders = [...huurders];
  
  if (sortField === 'naam') {
    // Sortering op naam blijft ongewijzigd
    // console.log('Sorteren op naam');
    sortedHuurders.sort((a, b) => {
      const compareResult = a.naam.localeCompare(b.naam);
      return sortAscending ? compareResult : -compareResult;
    });
  } else if (sortField === 'contractDatum') {
    // Nu sorteren op einddatum
    // console.log('Sorteren op contract einddatum');
    sortedHuurders.sort((a, b) => {
      // Vind het contract met de meest recente einddatum voor huurder A en B
      const contractenA = this.huurderContractMap().get(a.id) || [];
      const contractenB = this.huurderContractMap().get(b.id) || [];
      
      const recentDateA = this.getMostRecentContractDate(contractenA);
      const recentDateB = this.getMostRecentContractDate(contractenB);
      
      // Vergelijk de datums
      if (!recentDateA && !recentDateB) return 0;
      if (!recentDateA) return sortAscending ? 1 : -1;
      if (!recentDateB) return sortAscending ? -1 : 1;
      
      const compareResult = recentDateA.getTime() - recentDateB.getTime();
      return sortAscending ? compareResult : -compareResult;
    });
  }

  // Rest van de functie blijft hetzelfde
  // console.log('Originele huurders:', this.huurders().length);
  // console.log('Gefilterde huurders:', sortedHuurders.length);
  
  // Controle voor debugging
  if (this.filterForm.value.activeOnly) {
    // console.log('Filter actieve huurders is toegepast');
    const actieveHuurdersCount = sortedHuurders.filter(h => this.isHuurderActief(h.id)).length;
    // console.log(`Aantal actieve huurders in resultaat: ${actieveHuurdersCount}`);
  }
  
  this.filteredHuurders.set(sortedHuurders);
  // console.log('Gesorteerde huurders:', sortedHuurders);
}
  
getMostRecentContractDate(contracten: Contract[]): Date | null {
  if (contracten.length === 0) return null;
  
  // Zoek de meest recente einddatum
  return contracten.reduce((mostRecent, contract) => {
    const eindDatum = new Date(contract.eindDatum);
    return eindDatum > mostRecent ? eindDatum : mostRecent;
  }, new Date(contracten[0].eindDatum));
}
  
  toggleSort(field: 'naam' | 'contractDatum'): void {
    if (this.sortField() === field) {
      // Als al op dit veld wordt gesorteerd, verander de richting
      this.sortAscending.update(current => !current);
    } else {
      // Anders, wijzig het sorteerveld en reset naar oplopend
      this.sortField.set(field);
      this.sortAscending.set(true);
    }
    
    this.sortHuurders(this.filteredHuurders());
  }

resetFilters(): void {
  this.filterForm.reset({
    searchTerm: '',
    activeOnly: false
  });  

}

deleteHuurder(id: number): void {
  const huurder = this.huurders().find(h => h.id === id);
  const huurderNaam = huurder ? huurder.naam : 'deze huurder';
  
  this.confirmationService.confirm({
    title: 'Huurder verwijderen',
    message: `Weet je zeker dat je "${huurderNaam}" wilt verwijderen?`,
    warning: 'Dit verwijdert ook alle gerelateerde contracten! Deze actie kan niet ongedaan worden gemaakt.',
    confirmText: 'Verwijderen',
    cancelText: 'Annuleren',
    type: 'danger'
  }).subscribe(confirmed => {
    if (confirmed) {
      this.huurderService.deleteHuurder(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Huurder succesvol verwijderd');
          this.loadData();
        },
        error: (error) => {
          this.toastService.showError('Fout bij verwijderen van huurder', error.message);
        }
      });
    }
  });
}
  
  // Helper functie om te bepalen of een huurder actief is (heeft minstens één actief contract)
  isHuurderActief(huurderId: number): boolean {
    const huurderContracten = this.huurderContractMap().get(huurderId) || [];
    const today = new Date();
    
    return huurderContracten.some(contract => {
      const eindDatum = new Date(contract.eindDatum);
      return eindDatum >= today;
    });
  }
  
  // Helper functie voor het krijgen van de meest recente contractdatum
 getRecentsteContractDatum(huurderId: number): string {
  const huurderContracten = this.huurderContractMap().get(huurderId) || [];
  
  if (huurderContracten.length === 0) {
    return 'Geen contract';
  }
  
  // Zoek het contract met de meest recente einddatum
  const recentsteContract = huurderContracten.reduce((meestRecent, huidig) => {
    const huidigeEindDatum = new Date(huidig.eindDatum);
    const recenteEindDatum = new Date(meestRecent.eindDatum);
    return huidigeEindDatum > recenteEindDatum ? huidig : meestRecent;
  }, huurderContracten[0]);
  
  return recentsteContract.eindDatum;
}
}