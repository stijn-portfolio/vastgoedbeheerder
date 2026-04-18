import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vastgoed } from '../models/vastgoed';
import { environment } from '../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class VastgoedService {
  // private apiUrl = 'http://localhost:3000/vastgoed';
  private apiUrl = `${environment.apiUrl}/vastgoed`;

  constructor(private http: HttpClient) { }

  getVastgoed(): Observable<Vastgoed[]> {
    return this.http.get<Vastgoed[]>(this.apiUrl);
  }

  getVastgoedById(id: number): Observable<Vastgoed> {
    return this.http.get<Vastgoed>(`${this.apiUrl}/${id}`);
  }

  createVastgoed(vastgoed: Vastgoed): Observable<Vastgoed> {
    return this.http.post<Vastgoed>(this.apiUrl, vastgoed);
  }

  updateVastgoed(id: number, vastgoed: Vastgoed): Observable<Vastgoed> {
    return this.http.put<Vastgoed>(`${this.apiUrl}/${id}`, vastgoed);
  }

  deleteVastgoed(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}