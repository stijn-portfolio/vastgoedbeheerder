import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FavoriteService } from '../../services/favorite.service';
import { AssetService } from '../../services/asset.service';
import { Favorite } from '../../models/favorite';
import { Asset } from '../../models/asset';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-favorite-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.css']
})
export class FavoriteListComponent implements OnInit {
  favorites: Favorite[] = [];
  assets: Asset[] = [];
  loading = true;
  
  constructor(
    private favoriteService: FavoriteService,
    private assetService: AssetService
  ) {}
  
  ngOnInit(): void {
    this.loadData();
  }
  
  loadData(): void {
    forkJoin({
      favorites: this.favoriteService.getFavorites(),
      assets: this.assetService.getAssets()
    }).subscribe({
      next: (data) => {
        this.favorites = data.favorites;
        this.assets = data.assets;
        
        // Haal actuele prijzen op voor alle assets in favorieten
        this.assets.forEach(asset => {
          if (this.isFavorite(asset.id)) {
            this.assetService.getAssetPrice(asset.symbol).subscribe(price => {
              asset.currentPrice = price;
            });
          }
        });
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Er is een fout opgetreden bij het laden van de data', err);
        this.loading = false;
      }
    });
  }
  
  isFavorite(assetId: number): boolean {
    return this.favorites.some(f => f.assetId === assetId);
  }
  
  getFavoriteAssets(): Asset[] {
    return this.assets.filter(asset => this.isFavorite(asset.id));
  }
  
  removeFavorite(assetId: number): void {
    const favorite = this.favorites.find(f => f.assetId === assetId);
    
    if (favorite && favorite.id) {
      this.favoriteService.deleteFavorite(favorite.id).subscribe({
        next: () => {
          this.favorites = this.favorites.filter(f => f.assetId !== assetId);
        },
        error: (err) => {
          console.error('Er is een fout opgetreden bij het verwijderen van de favoriet', err);
        }
      });
    }
  }
}