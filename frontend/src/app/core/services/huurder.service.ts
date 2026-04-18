import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Huurder } from '../models/huurder';
import { environment } from '../environments/environment';
import { Transaction } from '../models/transaction';
import { Verhuurder } from '../models/verhuurder';

@Injectable({
  providedIn: 'root'
})
export class HuurderService {
  // private apiUrl = 'http://localhost:3000/huurders';
  private apiUrl = `${environment.apiUrl}/huurder`;


  constructor(private http: HttpClient) { }

  getHuurders(): Observable<Huurder[]> {
    return this.http.get<Huurder[]>(this.apiUrl);
  }

  getHuurderById(id: number): Observable<Huurder> {
    return this.http.get<Huurder>(`${this.apiUrl}/${id}`);
  }

  createHuurder(huurder: Huurder): Observable<Huurder> {
    return this.http.post<Huurder>(this.apiUrl, huurder);
  }

  updateHuurder(id: number, huurder: Huurder): Observable<Huurder> {
    return this.http.put<Huurder>(`${this.apiUrl}/${id}`, huurder);
  }

  deleteHuurder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getMyProfile(): Observable<Huurder> {
    return this.http.get<Huurder>(`${this.apiUrl}/my-profile`);
  }
  getMyTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/my-transactions`);
  }

  getMySyndicus(): Observable<Verhuurder[]> {
    return this.http.get<Verhuurder[]>(`${this.apiUrl}/my-syndicus`);
  }
}