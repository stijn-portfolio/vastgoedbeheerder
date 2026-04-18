// src/app/core/services/transaction.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Transaction } from '../models/transaction';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  // private apiUrl = 'http://localhost:3000/transacties';
  private apiUrl = `${environment.apiUrl}/transactie`;

  
  constructor(private http: HttpClient) { }
  
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }
  
  // getTransactionsByVastgoedId(vastgoedId: number): Observable<Transaction[]> {
  //   return this.http.get<Transaction[]>(`${this.apiUrl}?vastgoedId=${vastgoedId}`);
  // }

  getTransactionsByVastgoedId(vastgoedId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/Vastgoed/${vastgoedId}`);
  }
  
  getTransactionById(id: number): Observable<Transaction> {
    // console.log('getTransactionById', id);
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
    // console.log('getTransactionById', id);
  }
  
  addTransaction(transaction: Transaction): Observable<Transaction> {
    // Zorg ervoor dat vastgoedId en bedrag altijd nummers zijn
    const processedTransaction = {
      ...transaction,
      vastgoedId: +transaction.vastgoedId,
      bedrag: +transaction.bedrag
    };
    
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post<Transaction>(this.apiUrl, processedTransaction, { headers });
  }
  
  updateTransaction(id: number, transaction: Transaction): Observable<Transaction> {
    // Zorg ervoor dat vastgoedId en bedrag altijd nummers zijn
    const processedTransaction = {
      ...transaction,
      vastgoedId: +transaction.vastgoedId,
      bedrag: +transaction.bedrag
    };
    
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, processedTransaction, { headers });
  }
  
  deleteTransaction(id: number): Observable<Transaction> {
    return this.http.delete<Transaction>(`${this.apiUrl}/${id}`);
  }


}