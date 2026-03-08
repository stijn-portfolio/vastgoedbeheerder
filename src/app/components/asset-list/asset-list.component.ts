import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AssetService } from '../../services/asset.service';
import { FavoriteService } from '../../services/favorite.service';
import { AuthService } from '../../services/auth.service';
import { Asset } from '../../models/asset';
import { Favorite } from '../../models/favorite';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NavBarComponent],
  templateUrl: './asset-list.component.html',
  styleUrls: ['./asset-list.component.css']
})
export class AssetListComponent implements OnInit {
  assets: Asset[] = [];
  favorites: Favorite[] = [];
  loading = true;
  
  constructor(
    private assetService: AssetService,
    private favoriteService: FavoriteService,
    public authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.loadAssets();
    this.loadFavorites();
  }
  
  loadAssets(): void {
    this.assetService.getAssets().subscribe({
      next: (assets) => {
        this.assets = assets;
        // Simuleer actuele prijzen (in een echte app zou je deze ophalen van een marktdata API)
        this.assets.forEach(asset => {
          this.assetService.getAssetPrice(asset.symbol).subscribe(price => {
            asset.currentPrice = price;
          });
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Er is een fout opgetreden bij het laden van assets', err);
        this.loading = false;
      }
    });
  }
  
  loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites = favorites;
      },
      error: (err) => {
        console.error('Er is een fout opgetreden bij het laden van favorieten', err);
      }
    });
  }
  
  isFavorite(assetId: number): boolean {
    return this.favorites.some(f => f.assetId === assetId);
  }
  
  toggleFavorite(asset: Asset): void {
    if (this.isFavorite(asset.id)) {
      // Verwijder van favorieten
      const favorite = this.favorites.find(f => f.assetId === asset.id);
      if (favorite && favorite.id) {
        this.favoriteService.deleteFavorite(favorite.id).subscribe({
          next: () => {
            this.favorites = this.favorites.filter(f => f.assetId !== asset.id);
          },
          error: (err) => {
            console.error('Er is een fout opgetreden bij het verwijderen van een favoriet', err);
          }
        });
      }
    } else {
      // Voeg toe aan favorieten
      const favorite: Favorite = {
        assetId: asset.id
      };
      
      this.favoriteService.addFavorite(favorite).subscribe({
        next: (newFavorite) => {
          this.favorites.push(newFavorite);
        },
        error: (err) => {
          console.error('Er is een fout opgetreden bij het toevoegen van een favoriet', err);
        }
      });
    }
  }
  
  deleteAsset(id: number): void {
    if (confirm('Weet je zeker dat je dit aandeel wilt verwijderen?')) {
      this.assetService.deleteAsset(id).subscribe({
        next: () => {
          this.assets = this.assets.filter(a => a.id !== id);
        },
        error: (err) => {
          console.error('Er is een fout opgetreden bij het verwijderen van een aandeel', err);
        }
      });
    }
  }
}