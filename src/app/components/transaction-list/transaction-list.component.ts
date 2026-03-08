import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { TransactionService } from '../../services/transaction.service';
import { AssetService } from '../../services/asset.service';
import { Transaction } from '../../models/transaction';
import { Asset } from '../../models/asset';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.css']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  assets: Asset[] = [];
  loading = true;
  
  constructor(
    private transactionService: TransactionService,
    private assetService: AssetService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    forkJoin({
      transactions: this.transactionService.getTransactions(),
      assets: this.assetService.getAssets()
    }).subscribe({
      next: (data) => {
        this.transactions = data.transactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        this.assets = data.assets;
        this.loading = false;
      },
      error: (err) => {
        console.error('Er is een fout opgetreden bij het laden van de data', err);
        this.loading = false;
      }
    });
  }
  
  getAssetById(id: number): Asset | undefined {
    return this.assets.find(asset => asset.id === id);
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  calculateTotal(transaction: Transaction): number {
    return transaction.quantity * transaction.price;
  }
  
  deleteTransaction(id: number): void {
    if (confirm('Weet je zeker dat je deze transactie wilt verwijderen?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => {
          this.transactions = this.transactions.filter(t => t.id !== id);
        },
        error: (err) => {
          console.error('Er is een fout opgetreden bij het verwijderen van de transactie', err);
        }
      });
    }
  }
}