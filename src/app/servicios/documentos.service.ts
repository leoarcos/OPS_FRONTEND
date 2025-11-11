// documentos.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import * as XLSX from 'xlsx';

@Injectable({ providedIn: 'root' })
export class DocumentosService {
  
  private baseUrl = 'http://localhost:3000/api'; // Asegúrate de que coincida con tu backend
  datos: any[] = [];

  constructor(private http: HttpClient) {}

  
  // 🔹 Listar archivos de eventos
  getArchivosEventos(): Observable<{ files: string[] }> {
    return this.http.get<{ files: string[] }>(`${this.baseUrl}/eventos/files`);
  }

  obtenerDocumentos() {
    return this.http.get<{ nombre: string; url: string }[]>(
      'http://localhost:3000/api/documentos/eventos/'
    );
  }
   // 🔹 Listar usuarios
  getUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/users`);
  }
  leerExcelLocal(ruta: string): Observable<any[]> {
     return this.http.get(ruta, { responseType: 'arraybuffer' }).pipe(
      map(data => {
        // Convertir a Uint8Array para evitar errores
        const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
        
        // Tomar la primera hoja
        const nombreHoja = workbook.SheetNames[0];
        const hoja = workbook.Sheets[nombreHoja];

        // Convertir a JSON usando la primera fila como encabezado
        const datos = XLSX.utils.sheet_to_json(hoja, { header: 0 }); // <--- header: 0 usa la primera fila
        return datos;
      })
    );
  }
}
