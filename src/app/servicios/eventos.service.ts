import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventosService {
  private jsonUrl = '/assets/JSON/EVENTOS.JSON';

  constructor(private http: HttpClient) {}

  obtenerEventos(): Observable<any> {
    return this.http.get<any>(this.jsonUrl);
  }


}
