import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Verhuurder } from '../models/verhuurder';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VerhuurderService {
  // private apiUrl = 'http://localhost:3000/verhuurders';
  private apiUrl = `${environment.apiUrl}/verhuurder`;

  constructor(private http: HttpClient) { }

  getVerhuurders(): Observable<Verhuurder[]> {
    return this.http.get<Verhuurder[]>(this.apiUrl);
  }

  getVerhuurderById(id: number): Observable<Verhuurder> {
    return this.http.get<Verhuurder>(`${this.apiUrl}/${id}`);
  }

  createVerhuurder(verhuurder: Verhuurder): Observable<Verhuurder> {
    return this.http.post<Verhuurder>(this.apiUrl, verhuurder);
  }

  updateVerhuurder(id: number, verhuurder: Verhuurder): Observable<Verhuurder> {
    return this.http.put<Verhuurder>(`${this.apiUrl}/${id}`, verhuurder);
  }

  deleteVerhuurder(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}