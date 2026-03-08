import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AssetService } from '../../services/asset.service';
import { TransactionService } from '../../services/transaction.service';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../services/auth.service';
import { Asset } from '../../models/asset';
import { Transaction } from '../../models/transaction';
import { Favorite } from '../../models/favorite';
import { forkJoin, map } from 'rxjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { SortByPipe } from '../../pipes/sort-by.pipe';



interface PortfolioItem {
  asset: Asset;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  initialValue: number;
  profitLoss: number;
  profitLossPercentage: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent, SortByPipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  assets: Asset[] = [];
  transactions: Transaction[] = [];
  favorites: Favorite[] = [];
  loading = true;  
  portfolioValue = 0;
  portfolioItems: PortfolioItem[] = [];
  totalProfitLoss = 0;
  totalProfitLossPercentage = 0;
  
  constructor(
    private assetService: AssetService,
    private transactionService: TransactionService,
    private favoriteService: FavoriteService,
    public authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    forkJoin({
      assets: this.assetService.getAssets(),
      transactions: this.transactionService.getTransactions(),
      favorites: this.favoriteService.getFavorites()
    }).subscribe({
      next: (data) => {
        this.assets = data.assets;
        this.transactions = data.transactions;
        this.favorites = data.favorites;
        
        // Haal actuele prijzen op
        const priceRequests = this.assets.map(asset => {
          return this.assetService.getAssetPrice(asset.symbol).pipe(
            map(price => {
              asset.currentPrice = price;
              return asset;
            })
          );
        });
        
        forkJoin(priceRequests).subscribe({
          next: (updatedAssets) => {
            this.assets = updatedAssets;
            this.calculatePortfolioValue();
            this.calculatePortfolioPerformance();
            this.loading = false;
          },
          error: (err) => {
            console.error('Fout bij ophalen van actuele prijzen', err);
            this.calculatePortfolioValue();
            this.calculatePortfolioPerformance();
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Er is een fout opgetreden', err);
        this.loading = false;
      }
    });
  }
  
  calculatePortfolioValue(): void {
    // Maak een map van asset holdings
    const holdings: { [key: number]: { quantity: number, avgPrice: number } } = {};
    
    // Bereken holdings per asset
    this.transactions.forEach(transaction => {
      if (!holdings[transaction.assetId]) {
        holdings[transaction.assetId] = { quantity: 0, avgPrice: 0 };
      }
      
      if (transaction.type === 'buy') {
        const currentValue = holdings[transaction.assetId].quantity * holdings[transaction.assetId].avgPrice;
        const newValue = transaction.quantity * transaction.price;
        const newQuantity = holdings[transaction.assetId].quantity + transaction.quantity;
        
        holdings[transaction.assetId].avgPrice = (currentValue + newValue) / newQuantity;
        holdings[transaction.assetId].quantity += transaction.quantity;
      } else if (transaction.type === 'sell') {
        holdings[transaction.assetId].quantity -= transaction.quantity;
      }
    });
    
    // Bereken portfolio waarde
    this.portfolioValue = Object.entries(holdings).reduce((total, [assetId, data]) => {
      const asset = this.assets.find(a => a.id === Number(assetId));
      // Voor een echte app zouden we hier actuele koersen gebruiken
      const price = asset?.currentPrice || 100; // Simuleer een prijs
      return total + (data.quantity * price);
    }, 0);
  }
  
  // Bereken portfolio prestaties
calculatePortfolioPerformance(): void {
  // Maak een map van asset holdings
  const holdings: { [key: number]: { quantity: number, totalCost: number } } = {};
  
  // Bereken holdings per asset
  this.transactions.forEach(transaction => {
    if (!holdings[transaction.assetId]) {
      holdings[transaction.assetId] = { quantity: 0, totalCost: 0 };
    }
    
    if (transaction.type === 'buy') {
      holdings[transaction.assetId].totalCost += transaction.quantity * transaction.price;
      holdings[transaction.assetId].quantity += transaction.quantity;
    } else if (transaction.type === 'sell') {
      // Simpele FIFO berekening (in een echte app zou je meer geavanceerde logica gebruiken)
      const sellValue = transaction.quantity * transaction.price;
      const costBasis = (holdings[transaction.assetId].totalCost / holdings[transaction.assetId].quantity) * transaction.quantity;
      holdings[transaction.assetId].totalCost -= costBasis;
      holdings[transaction.assetId].quantity -= transaction.quantity;
    }
  });
  
  // Bereken portfolio items met winst/verlies
  this.portfolioItems = [];
  let totalInitialValue = 0;
  let totalCurrentValue = 0;
  
  Object.entries(holdings).forEach(([assetId, data]) => {
    if (data.quantity <= 0) return;
    
    const asset = this.assets.find(a => a.id === Number(assetId));
    if (!asset) return;
    
    const avgBuyPrice = data.totalCost / data.quantity;
    const currentPrice = asset.currentPrice || 0;
    const initialValue = data.totalCost;
    const currentValue = data.quantity * currentPrice;
    const profitLoss = currentValue - initialValue;
    const profitLossPercentage = (profitLoss / initialValue) * 100;
    
    totalInitialValue += initialValue;
    totalCurrentValue += currentValue;
    
    this.portfolioItems.push({
      asset,
      quantity: data.quantity,
      avgBuyPrice,
      currentPrice,
      currentValue,
      initialValue,
      profitLoss,
      profitLossPercentage
    });
  });
  
  // Bereken totale winst/verlies
  this.totalProfitLoss = totalCurrentValue - totalInitialValue;
  this.totalProfitLossPercentage = totalInitialValue > 0 
    ? (this.totalProfitLoss / totalInitialValue) * 100 
    : 0;

    setTimeout(() => {
      this.createPortfolioChart();
    }, 0);
}

createPortfolioChart(): void {
  if (!this.portfolioItems.length) return;

  // Canvas element verkrijgen
  const canvas = document.getElementById('portfolioChart') as HTMLCanvasElement;
  if (!canvas) return;
  
  // Data voorbereiden
  const labels = this.portfolioItems.map(item => item.asset.symbol);
  const data = this.portfolioItems.map(item => item.currentValue);
  
  // Kleuren genereren
  const colors = this.generateColors(this.portfolioItems.length);
  
  // Chart aanmaken
  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: 'Portfolio Verdeling',
        data: data,
        backgroundColor: colors,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((a: any, b: any) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: € ${value.toFixed(2)} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Helper functie voor het genereren van kleuren
generateColors(count: number): string[] {
  const baseColors = [
    'rgb(54, 162, 235)',
    'rgb(255, 99, 132)',
    'rgb(255, 205, 86)',
    'rgb(75, 192, 192)',
    'rgb(153, 102, 255)',
    'rgb(255, 159, 64)',
    'rgb(201, 203, 207)',
    'rgb(0, 162, 235)',
    'rgb(255, 0, 132)',
    'rgb(255, 205, 0)'
  ];
  
  // Indien meer kleuren nodig dan beschikbaar, genereer willekeurige kleuren
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    colors.push(`rgb(${r}, ${g}, ${b})`);
  }
  
  return colors;
}

  getAssetById(id: number): Asset | undefined {
    return this.assets.find(asset => asset.id === id);
  }
  
  getTransactionsByAssetId(assetId: number): Transaction[] {
    return this.transactions.filter(t => t.assetId === assetId);
  }
  
  isFavorite(assetId: number): boolean {
    return this.favorites.some(f => f.assetId === assetId);
  }
  
  getTotalQuantity(assetId: number): number {
    return this.getTransactionsByAssetId(assetId).reduce((total, t) => {
      return t.type === 'buy' ? total + t.quantity : total - t.quantity;
    }, 0);
  }
}