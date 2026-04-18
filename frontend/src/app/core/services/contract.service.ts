import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract } from '../models/contract';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  // private apiUrl = 'http://localhost:3000/contracten';
  private apiUrl = `${environment.apiUrl}/contract`;

  constructor(private http: HttpClient) { }

  getContractenByVastgoed(vastgoedId: number): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.apiUrl}/vastgoed/${vastgoedId}`);
  }

  getContracten(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.apiUrl);
  }

  getContractById(id: number): Observable<Contract> {
    return this.http.get<Contract>(`${this.apiUrl}/${id}`);
  }

  createContract(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(this.apiUrl, contract);
  }

  updateContract(id: number, contract: Contract): Observable<Contract> {
    return this.http.put<Contract>(`${this.apiUrl}/${id}`, contract);
  }

  deleteContract(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);

    

  }
}