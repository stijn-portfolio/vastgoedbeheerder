import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Asset } from '../models/asset';
import { MarketDataService } from './market-data.service';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  private apiUrl = 'http://localhost:3000/assets';
  
  constructor(
    private http: HttpClient,
    private marketDataService: MarketDataService
  ) { }
  
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.apiUrl);
  }
  
  getAssetById(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.apiUrl}/${id}`);
  }
  
  addAsset(asset: Asset): Observable<Asset> {
    return this.http.post<Asset>(this.apiUrl, asset);
  }
  
  updateAsset(id: number, asset: Asset): Observable<Asset> {
    return this.http.put<Asset>(`${this.apiUrl}/${id}`, asset);
  }
  
  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  // Haal actuele prijs op via MarketDataService
  getAssetPrice(symbol: string): Observable<number> {
    return this.marketDataService.getLatestPrice(symbol).pipe(
      catchError(error => {
        console.error('Fout bij ophalen van prijs via MarketDataService:', error);
        // Fallback naar dummy prijs
        return of(Math.random() * 200 + 50);
      })
    );
  }
  
  // Haal historische data op voor grafieken
  getAssetHistoricalData(symbol: string): Observable<any[]> {
    return this.marketDataService.getHistoricalData(symbol);
  }
}