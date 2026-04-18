import { Component, signal, computed, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VastgoedService } from '../../core/services/vastgoed.service';
import { HuurderService } from '../../core/services/huurder.service';
import { ContractService } from '../../core/services/contract.service';
import { VerhuurderService } from '../../core/services/verhuurder.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/auth/auth.service';
import { Vastgoed } from '../../core/models/vastgoed';
import { Contract } from '../../core/models/contract';
import { Transaction } from '../../core/models/transaction';
import { User } from '../../core/models/user';
import { RoleService } from '../../core/auth/role.service';
import { CustomNumberPipe } from '../../shared/pipes/custom-number.pipe';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmationService } from '../../shared/services/confirmation.service';
import { CapitalizeNamePipe } from '../../shared/pipes/capitalize-name.pipe';




@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CustomNumberPipe, CapitalizeNamePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Signals voor state
  user = signal<User | null>(null);
  vastgoedAantal = signal<number>(0);
  huurdersAantal = signal<number>(0);
  contractenAantal = signal<number>(0);
  verhuurderAantal = signal<number>(0);
  actieveContracten = signal<Contract[]>([]);
  recentVastgoed = signal<Vastgoed[]>([]);
  transactions = signal<Transaction[]>([]);
  recentTransactions = computed(() => this.transactions().slice(0, 5));
  vastgoedMap = signal<Map<number, string>>(new Map());
  huurderMap = signal<Map<number, string>>(new Map());
  vastgoedContractMap = signal<Map<number, Contract[]>>(new Map());
  isLoading = signal<boolean>(false);
  isAuthenticated = signal<boolean>(false);
  hasAdminAccess = signal<boolean>(false);
  isAccountant = signal<boolean>(false);
  isHuurder = signal<boolean>(false);
  huurderProfiel = signal<any>(null);
  mijnContracten = signal<any[]>([]);
  mijnTransacties = signal<Transaction[]>([]);
  mijnSyndici = signal<any[]>([]);

  errorMessage = signal<string>('');

  // Services
  private vastgoedService = inject(VastgoedService);
  private huurderService = inject(HuurderService);
  private contractService = inject(ContractService);
  private verhuurderService = inject(VerhuurderService);
  private transactionService = inject(TransactionService);
  public authService = inject(AuthService);
  public roleService = inject(RoleService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  // Computed properties voor financiële berekeningen
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
  constructor() { }

  ngOnInit(): void {
    // Initialiseer isLoading
    this.isLoading.set(true);

    // Luister naar authenticatie status
    this.authService.isAuthenticated().subscribe(isAuth => {
      this.isAuthenticated.set(isAuth);

      if (isAuth) {
        // Controleer permissies voor ingelogde gebruikers
        this.roleService.hasPermission('manage:all').subscribe(hasAccess => {
          this.hasAdminAccess.set(hasAccess);

          // Laad data na het instellen van permissies als admin
          if (hasAccess) {
            this.loadDataForAdmin();
          }
        });

        this.roleService.hasPermission('manage:transactions').subscribe(isAcc => {
          this.isAccountant.set(isAcc);

          // Laad data na het instellen van permissies als accountant
          if (isAcc && !this.hasAdminAccess()) {
            this.loadDataForAccountant();
          }
        });

        // controleer of de gebruiker een huurder is
        this.roleService.hasPermission('manage:huurders').subscribe(isH => {
          this.isHuurder.set(isH);
          // Laad data na het instellen van permissies als huurder
          if (isH) {
            this.loadDataForHuurder();
          }
        });

        // In dashboard.component.ts, in de constructor of ngOnInit:
        // Alleen voor testen - we verwijderen dit later
        if (!this.hasAdminAccess() && !this.isAccountant()) {
          this.huurderService.getMyProfile().subscribe({
            next: (huurder) => console.log('Mijn profiel:', huurder),
            error: (error) => console.error('Fout:', error)
          });
        }

      } else {
        // Reset loading status voor niet-ingelogde gebruikers
        this.isLoading.set(false);
      }
    });
  }

  private loadDataForAdmin(): void {
    let completedRequests = 0;
    const totalRequests = 4;

    this.loadVastgoed(() => this.checkLoadingStatus(++completedRequests, totalRequests));
    this.loadHuurders(() => this.checkLoadingStatus(++completedRequests, totalRequests));
    this.loadVerhuurders(() => this.checkLoadingStatus(++completedRequests, totalRequests));
    this.loadContracten(() => this.checkLoadingStatus(++completedRequests, totalRequests));
  }

  private loadDataForAccountant(): void {
    let completedRequests = 0;
    const totalRequests = 2;

    this.loadTransactions(() => this.checkLoadingStatus(++completedRequests, totalRequests));
    this.loadVastgoed(() => this.checkLoadingStatus(++completedRequests, totalRequests));
  }

  private loadDataForHuurder(): void {
    let completedRequests = 0;
    const totalRequests = 4; 

    this.loadHuurderProfile(() => this.checkLoadingStatus(++completedRequests, totalRequests));
    this.loadHuurderTransactions(() => this.checkLoadingStatus(++completedRequests, totalRequests));
    this.loadHuurderSyndici(() => this.checkLoadingStatus(++completedRequests, totalRequests));
    this.loadVastgoed(() => this.checkLoadingStatus(++completedRequests, totalRequests)); // 👈 NIEUWE LIJN
  }

  private loadHuurderTransactions(callback: () => void): void {
    this.huurderService.getMyTransactions().subscribe({
      next: (transacties) => {
        // Sort transactions by date (assuming there's a date field) and take the last 5
        const sortedTransactions = [...transacties].sort((a, b) => 
          new Date(b.datum).getTime() - new Date(a.datum).getTime()
        );
        this.mijnTransacties.set(sortedTransactions.slice(0, 5));
      },
      error: (error) => {
        console.log('Geen transacties gevonden:', error.message);
        this.mijnTransacties.set([]);
      },
      complete: callback
    });
  }

  private loadHuurderSyndici(callback: () => void): void {
    this.huurderService.getMySyndicus().subscribe({
      next: (syndici) => {
        this.mijnSyndici.set(syndici);
      },
      error: (error) => {
        console.log('Geen syndici gevonden:', error.message);
        this.mijnSyndici.set([]);
      },
      complete: callback
    });
  }
  
  private loadHuurderProfile(callback: () => void): void {
    this.huurderService.getMyProfile().subscribe({
      next: (huurder: any) => {
      this.huurderProfiel.set(huurder);
      // Sort contracts by end date, most recent first
      const sortedContracten = (huurder.contracten || []).sort((a: { eindDatum: string | number | Date; }, b: { eindDatum: string | number | Date; }) => 
        new Date(b.eindDatum).getTime() - new Date(a.eindDatum).getTime()
      );
      this.mijnContracten.set(sortedContracten);
      this.isHuurder.set(true);
      },
      error: (error) => {
      this.isHuurder.set(false);
      console.log('Geen huurder profiel gevonden:', error.message);
      },
      complete: callback
    });
  }

  private checkLoadingStatus(completedRequests: number, totalRequests: number): void {
    if (completedRequests === totalRequests) {
      this.isLoading.set(false);
    }
  }

  loadVastgoed(callback: () => void): void {
    this.vastgoedService.getVastgoed().subscribe({
      next: (vastgoed) => {
        this.vastgoedAantal.set(vastgoed.length);
        this.recentVastgoed.set(vastgoed.slice(0, 5));

        // Update vastgoedMap signal
        const newMap = new Map<number, string>();
        vastgoed.forEach(v => newMap.set(v.id, v.naam));
        this.vastgoedMap.set(newMap);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van vastgoed: ' + error.message);
      },
      complete: callback
    });
  }

  loadContracten(callback: () => void): void {
    this.contractService.getContracten().subscribe({
      next: (contracten) => {
        this.contractenAantal.set(contracten.length);

        // Filter actieve contracten (einddatum in de toekomst)
        const today = new Date();
        const actieveContracten = contracten
          .filter(contract => new Date(contract.eindDatum) >= today)
          .sort((a, b) => new Date(a.eindDatum).getTime() - new Date(b.eindDatum).getTime())
          .slice(0, 5);

        this.actieveContracten.set(actieveContracten);

        // Creëer een mapping van vastgoed naar contracten
        const contractMap = new Map<number, Contract[]>();

        contracten.forEach(contract => {
          if (!contractMap.has(contract.vastgoedID)) {
            contractMap.set(contract.vastgoedID, []);
          }
          contractMap.get(contract.vastgoedID)?.push(contract);
        });

        this.vastgoedContractMap.set(contractMap);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van contracten: ' + error.message);
      },
      complete: callback
    });
  }



  loadHuurders(callback: () => void): void {
    this.huurderService.getHuurders().subscribe({
      next: (huurders) => {
        this.huurdersAantal.set(huurders.length);

        // Update huurderMap signal
        const newMap = new Map<number, string>();
        huurders.forEach(h => newMap.set(h.id, h.naam));
        this.huurderMap.set(newMap);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van huurders: ' + error.message);
      },
      complete: callback
    });
  }

  loadVerhuurders(callback: () => void): void {
    this.verhuurderService.getVerhuurders().subscribe({
      next: (verhuurders) => {
        this.verhuurderAantal.set(verhuurders.length);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van verhuurders: ' + error.message);
      },
      complete: callback
    });
  }


  loadTransactions(callback: () => void): void {
    this.transactionService.getTransactions().subscribe({
      next: (data) => {
        this.transactions.set(data);
      },
      error: (error) => {
        this.errorMessage.set('Er is een fout opgetreden bij het laden van transacties: ' + error.message);
      },
      complete: callback
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

  // Helper functies
  getVastgoedNaam(vastgoedId: number): string {
    return this.vastgoedMap().get(vastgoedId) || 'Onbekend vastgoed';
  }

  getHuurderNaam(huurderId: number): string {
    return this.huurderMap().get(huurderId) || 'Onbekende huurder';
  }

  // Financiële functies
  getTotalIncome(): number {
    return this.totalIncome();
  }

  getTotalExpenses(): number {
    return this.totalExpenses();
  }

  getBalance(): number {
    return this.balance();
  }

  // Vastgoed-specifieke financiële berekeningen
  getVastgoedIncome(vastgoedId: number): number {
    return this.transactions()
      .filter(t => t.vastgoedId === vastgoedId && t.type === 'INKOMST')
      .reduce((sum, transaction) => sum + transaction.bedrag, 0);
  }

  getVastgoedExpenses(vastgoedId: number): number {
    return this.transactions()
      .filter(t => t.vastgoedId === vastgoedId && t.type === 'UITGAVE')
      .reduce((sum, transaction) => sum + transaction.bedrag, 0);
  }

  getVastgoedBalance(vastgoedId: number): number {
    return this.getVastgoedIncome(vastgoedId) - this.getVastgoedExpenses(vastgoedId);
  }

  isVastgoedVerhuurd(vastgoedId: number): boolean {
    const vastgoedContracten = this.vastgoedContractMap().get(vastgoedId) || [];
    const today = new Date();

    return vastgoedContracten.some(contract => {
      const eindDatum = new Date(contract.eindDatum);
      return eindDatum >= today;
    });
  }
  // Voeg deze methods toe aan het einde van je DashboardComponent class:

  // Helper functie om te bepalen of een contract actief is
  isContractActief(contract: any): boolean {
    const eindDatum = new Date(contract.eindDatum);
    const today = new Date();
    return eindDatum >= today;
  }

  // Helper functie om dagen tot einde contract te berekenen
  getDaysUntilEnd(contract: any): number {
    const eindDatum = new Date(contract.eindDatum);
    const today = new Date();
    const diffTime = eindDatum.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  getSyndicusForContract(contract: any): any {
    // console.log('Contract object:', contract);
    // console.log('Available syndici:', this.mijnSyndici());
    // console.log('VastgoedMap:', this.vastgoedMap()); 

    return this.mijnSyndici().find(syndicus =>
      syndicus.id === contract.verhuurderID
    );
  }

}