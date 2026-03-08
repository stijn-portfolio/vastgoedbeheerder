// src/app/services/market-data.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface SearchResult {
  symbol: string;
  description: string;
  type: string;
  currency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarketDataService {
  // API-sleutel voor Finnhub (gebruik een geproxyde versie in productie)
  // Deze sleutel is tijdelijk en moet worden vervangen door een veilige opslagmethode in productie
  private apiKey = 'd069q7hr01qtd9pibobgd069q7hr01qtd9piboc0';
  private baseUrl = '/api/finnhub'; // Gebruik de geproxyde URL
  
  // Tijdelijke cache om API-calls te beperken
  private priceCache: { [symbol: string]: { price: number, timestamp: number } } = {};
  private cacheDuration = 3600000; // 1 uur in milliseconden
  
  constructor(private http: HttpClient) { }
  
  // Headers voor Finnhub API
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'X-Finnhub-Token': this.apiKey
    });
  }
  
  // Haal actuele prijs op
// src/app/services/market-data.service.ts

getLatestPrice(symbol: string): Observable<number> {
  // Controleer cache first
  const now = Date.now();
  if (this.priceCache[symbol] && (now - this.priceCache[symbol].timestamp) < this.cacheDuration) {
    return of(this.priceCache[symbol].price);
  }
  
  // Gebruik HttpClient met responseType: 'text' om de ruwe response te zien
  return this.http.get(`${this.baseUrl}/quote?symbol=${symbol}`, { 
    headers: this.getHeaders(),
    responseType: 'text'  // Dit vraagt de ruwe tekst op, niet direct geparsed als JSON
  }).pipe(
    map(response => {
      console.log('Ruwe response:', response); // Log de ruwe response
      try {
        const parsedResponse = JSON.parse(response);
        if (parsedResponse && parsedResponse.c) {
          const price = parsedResponse.c;
          this.priceCache[symbol] = { price, timestamp: now };
          return price;
        }
        throw new Error('Geen prijsdata gevonden');
      } catch (e) {
        console.error('Fout bij parsen van response:', e);
        throw e;
      }
    }),
    catchError(error => {
      console.error(`Fout bij ophalen van prijs voor ${symbol}:`, error);
      // Fallback: genereer een random prijs
      const fallbackPrice = Math.random() * 200 + 50;
      return of(parseFloat(fallbackPrice.toFixed(2)));
    })
  );
}
  
  // Zoek aandelen en ETFs
  searchSecurities(query: string): Observable<SearchResult[]> {
    return this.http.get<any>(`${this.baseUrl}/search?q=${query}`, { headers: this.getHeaders() }).pipe(
      map(response => {
        if (response && response.result) {
          return response.result
            .filter((item: any) => item.symbol && item.description) // Filter onvolledige resultaten
            .map((item: any) => ({
              symbol: item.symbol,
              description: item.description,
              type: this.determineAssetType(item),
              currency: 'USD' // Finnhub geeft niet direct valuta, standaard USD
            }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Fout bij zoeken van aandelen:', error);
        // Voor demo: retourneer dummy resultaten
        return of([
          { symbol: 'AAPL', description: 'Apple Inc', type: 'stock' },
          { symbol: 'MSFT', description: 'Microsoft Corporation', type: 'stock' },
          { symbol: 'GOOGL', description: 'Alphabet Inc', type: 'stock' },
          { symbol: 'SPY', description: 'SPDR S&P 500 ETF Trust', type: 'etf' }
        ]);
      })
    );
  }
  
  // Helper om het type asset te bepalen (ETF of aandeel)
  private determineAssetType(item: any): string {
    // Finnhub geeft "type" niet direct, dus we moeten het afleiden
    // ETFs hebben vaak specifieke namen of symbolen
    const description = item.description || '';
    const symbol = item.symbol || '';
    
    if (
      description.includes('ETF') || 
      description.includes('Index') || 
      description.includes('Fund') ||
      symbol.includes('-ETF') ||
      symbol === 'SPY' || 
      symbol === 'QQQ' || 
      symbol === 'IWM' ||
      symbol === 'VTI'
    ) {
      return 'etf';
    }
    
    return 'stock';
  }
  
  // Historische data ophalen (candles)
  getHistoricalData(symbol: string): Observable<any[]> {
    // Bereken timestamp voor 1 jaar geleden
    const endTimestamp = Math.floor(Date.now() / 1000);
    const startTimestamp = endTimestamp - 31536000; // 365 dagen in seconden
    
    return this.http.get<any>(
      `${this.baseUrl}/stock/candle?symbol=${symbol}&resolution=D&from=${startTimestamp}&to=${endTimestamp}`,
      { headers: this.getHeaders() }
    ).pipe(
      map(response => {
        if (response && response.c && response.t) {
          // Finnhub returneert arrays voor elke data categorie (c=close, t=timestamp)
          return response.t.map((timestamp: number, index: number) => ({
            date: new Date(timestamp * 1000).toISOString().split('T')[0],
            price: response.c[index]
          }));
        }
        throw new Error('Geen historische data gevonden');
      }),
      catchError(error => {
        console.error(`Fout bij ophalen van historische data voor ${symbol}:`, error);
        // Genereer dummy historische data
        const dummyData = Array(30).fill(0).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateString = date.toISOString().split('T')[0];
          return {
            date: dateString,
            price: 100 + Math.random() * 20 - 10 // random prijs rond 100
          };
        });
        return of(dummyData);
      })
    );
  }
}