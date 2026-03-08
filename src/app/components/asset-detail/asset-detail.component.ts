import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AssetService } from '../../services/asset.service';
import { TransactionService } from '../../services/transaction.service';
import { Asset } from '../../models/asset';
import { Transaction } from '../../models/transaction';
import { forkJoin } from 'rxjs';

// Chart.js importeren
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './asset-detail.component.html',
  styleUrls: ['./asset-detail.component.css']
})
export class AssetDetailComponent implements OnInit {
  asset?: Asset;
  transactions: Transaction[] = [];
  historicalData: any[] = [];
  loading = true;
  chart?: Chart;
  
  constructor(
    private route: ActivatedRoute,
    private assetService: AssetService,
    private transactionService: TransactionService
  ) {}
  
  ngOnInit(): void {
    const assetId = Number(this.route.snapshot.paramMap.get('id'));
    if (assetId) {
      this.loadAssetData(assetId);
    }
  }
  
  loadAssetData(assetId: number): void {
    forkJoin({
      asset: this.assetService.getAssetById(assetId),
      transactions: this.transactionService.getTransactions()
    }).subscribe({
      next: (data) => {
        this.asset = data.asset;
        this.transactions = data.transactions.filter(t => t.assetId === assetId);
        
        // Actuele prijs ophalen
        this.assetService.getAssetPrice(this.asset.symbol).subscribe(price => {
          this.asset!.currentPrice = price;
          
          // Historische data ophalen
          this.assetService.getAssetHistoricalData(this.asset!.symbol).subscribe({
            next: (histData) => {
              this.historicalData = histData;
              this.loading = false;
              this.createChart();
            },
            error: (err) => {
              console.error('Fout bij ophalen historische data', err);
              this.loading = false;
            }
          });
        });
      },
      error: (err) => {
        console.error('Fout bij ophalen asset data', err);
        this.loading = false;
      }
    });
  }
  
  // kart maken met Chart.js

createChart(): void {
  if (!this.historicalData.length) return;
  
  // Data voorbereiden voor Chart.js - Finnhub data is al gesorteerd op datum
  const labels = this.historicalData.map(d => d.date);
  const prices = this.historicalData.map(d => d.price);
  
  // Canvas element verkrijgen
  const canvas = document.getElementById('priceChart') as HTMLCanvasElement;
  if (!canvas) return;
  
  // Chart aanmaken
  this.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: `${this.asset?.symbol} Koers (€)`,
        data: prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Prijs: € ${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: function(value) {
              return '€ ' + value;
            }
          }
        }
      }
    }
  });
}

  
  // Bereken gemiddelde aankoopprijs
  get averageBuyPrice(): number {
    const buyTransactions = this.transactions.filter(t => t.type === 'buy');
    if (!buyTransactions.length) return 0;
    
    const totalCost = buyTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
    const totalQuantity = buyTransactions.reduce((sum, t) => sum + t.quantity, 0);
    
    return totalCost / totalQuantity;
  }
  
  // Bereken totale aantal aandelen
  get totalQuantity(): number {
    return this.transactions.reduce((sum, t) => {
      return t.type === 'buy' ? sum + t.quantity : sum - t.quantity;
    }, 0);
  }
  
  // Bereken winst/verlies
  get profitLoss(): number {
    if (!this.asset?.currentPrice) return 0;
    
    const currentValue = this.totalQuantity * this.asset.currentPrice;
    const buyTransactions = this.transactions.filter(t => t.type === 'buy');
    const totalCost = buyTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
    
    const sellTransactions = this.transactions.filter(t => t.type === 'sell');
    const totalSold = sellTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
    
    return currentValue + totalSold - totalCost;
  }
  
  // Bereken winst/verlies percentage
  get profitLossPercentage(): number {
    if (!this.asset?.currentPrice) return 0;
    
    const buyTransactions = this.transactions.filter(t => t.type === 'buy');
    const totalCost = buyTransactions.reduce((sum, t) => sum + (t.quantity * t.price), 0);
    
    if (totalCost === 0) return 0;
    
    return (this.profitLoss / totalCost) * 100;
  }
}