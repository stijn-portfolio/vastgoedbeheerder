import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AssetService } from '../../services/asset.service';
import { TransactionService } from '../../services/transaction.service';
import { Asset } from '../../models/asset';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavBarComponent],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
  assets: Asset[] = [];
  transaction: Transaction = {
    assetId: 0,
    type: 'buy',
    quantity: 1,
    price: 0,
    date: new Date().toISOString().slice(0, 10)
  };
  loading = false;
  assetLoading = true;
  error = '';
  
  constructor(
    private assetService: AssetService,
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadAssets();
    
    // Haal assetId uit query parameters als die er is
    const assetId = this.route.snapshot.queryParamMap.get('assetId');
    if (assetId) {
      this.transaction.assetId = Number(assetId);
    }
  }
  
  loadAssets(): void {
    this.assetLoading = true;
    
    this.assetService.getAssets().subscribe({
      next: (assets) => {
        this.assets = assets;
        this.assetLoading = false;
        
        // Als er assets zijn maar nog geen assetId is ingesteld, kies de eerste
        if (this.assets.length > 0 && this.transaction.assetId === 0) {
          this.transaction.assetId = this.assets[0].id;
          this.updatePrice();
        }
      },
      error: (err) => {
        this.error = 'Er is een fout opgetreden bij het laden van de aandelen';
        this.assetLoading = false;
      }
    });
  }
  
  updatePrice(): void {
    const selectedAsset = this.assets.find(a => a.id === this.transaction.assetId);
    if (selectedAsset) {
      this.assetService.getAssetPrice(selectedAsset.symbol).subscribe(price => {
        this.transaction.price = price;
      });
    }
  }
  
  onAssetChange(): void {
    this.updatePrice();
  }
  
  onSubmit(): void {
    this.loading = true;
    this.error = '';
    
    this.transactionService.addTransaction(this.transaction).subscribe({
      next: () => {
        this.router.navigate(['/transactions']);
      },
      error: (err) => {
        this.error = 'Er is een fout opgetreden bij het toevoegen van de transactie';
        this.loading = false;
      }
    });
  }
}