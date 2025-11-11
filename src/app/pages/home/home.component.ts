import { CommonModule } from '@angular/common';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { Component, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { FeatureCollection,Geometry, GeoJsonProperties } from "geojson";
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { DocumentosService } from '../../servicios/documentos.service';
import { SpinnerServiceService } from '../../servicios/spinner-service.service';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { EventosService } from '../../servicios/eventos.service';


interface Subtema {
    id: string;
    nombre: string;
}

interface Report {
    id: string;
    titulo: string;
    subtemas: Subtema[];
}
interface SivigilaEvento {
  componente: string;
  eventos: string[];
  datos: any[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,FormsModule, SpinnerComponent, NgSelectModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private map!: L.Map;  
  private map2!: L.Map;  
  selectedRegion: string = '';
  chart: any;
  reports = [
    { title: 'Intentos de suicidio', image: '/assets/images/frontera.jpg' },
    { title: 'Suicidio', image: '/assets/images/frontera.jpg' },
    { title: 'VBG', image: '/assets/images/frontera.jpg' },
    { title: 'Violencia Sexual', image: '/assets/images/frontera.jpg' },
    { title: 'Consumo Sustancias Psicoactivas', image: '/assets/images/frontera.jpg' },
    // agrega los demás...
  ];
  eventos = [
    { id: null, nombre: 'Todos' },
    { id: 2, nombre: 'Conferencia de tecnología' },
    { id: 3, nombre: 'Festival gastronómico' },
    { id: 4, nombre: 'Maratón 10K' },
  ];
  dataEventos:any;
  @ViewChild('ngSelectEvento') ngSelectEvento!: NgSelectComponent;
  eventoSeleccionado: any;
  documentos: any; 
  dataEventosPrincipales1: Report[] = [];
  dataEventosPrincipales2: Report[] = [];
  dataEventosPrincipales3: Report[] = [];
  dataEventosPrincipales4: Report[] = [];
  dataEventosPrincipales5: Report[] = [];
  dataEventosPrincipales6: Report[] = [];
  @ViewChild('myChart', { static: true }) chartRef!: ElementRef<HTMLCanvasElement>; 
  columnas:any;
  datos:any;
  todos:any;
  componentes:any;
  sivigilaEventos: SivigilaEvento[] = [];

  ano2022:any;
  ano2023:any;
  ano2024:any;
  ano2025:any;

  ano2022Componentes:any;
  ano2023Componentes: any;
  ano2024Componentes: any;
  ano2025Componentes: any;

  ano2022ComponentesEventos:any;
  ano2023ComponentesEventos: any;
  ano2024ComponentesEventos: any;
  ano2025ComponentesEventos: any;
  constructor(private eventosServicse: EventosService,private route: ActivatedRoute, private spinner: SpinnerServiceService, private router: Router, private documentosService:DocumentosService){
    
      this.spinner.show();
  }
  ngOnInit():void{
      this.eventosServicse.obtenerEventos().subscribe(
        (data) => {
          console.log(data);
          this.dataEventos=data;
          this.dataEventosPrincipales1.push(this.dataEventos[0]);
          this.dataEventosPrincipales2.push(this.dataEventos[13]);
          this.dataEventosPrincipales3.push(this.dataEventos[15]);
          this.dataEventosPrincipales4.push(this.dataEventos[14]);
          this.dataEventosPrincipales5.push(this.dataEventos[16]);
          this.dataEventosPrincipales6.push(this.dataEventos[17]);
          console.log(JSON.stringify(this.dataEventosPrincipales1));
        },
        (error) => {
          console.error('Error al cargar el archivo JSON', error);
        }
      );
      /*
      this.documentosService.getArchivosEventos().subscribe(data => {
        this.documentos = data.files;
        console.log(this.documentos);
      });
      */
      this.documentosService.getUsuarios().subscribe({
        next: (data) => { 
          console.log(data);
         },
        error: (err) => { 
          console.error('Error al cargar usuarios:', err.error.error);
          alert('No se pudieron cargar los usuarios');
        }
      });
    const ruta = 'documentos/base.xlsx';
    this.documentosService.leerExcelLocal(ruta).subscribe({
      next: (data) => {
        this.datos = data;
        this.columnas = Object.keys(data[0] || {});
       // console.log('Datos del Excel:', data);
        this.todos = this.datos.map((d: { [x: string]: any; }) => d['componente']);
        //console.log(this.todos);
        this.componentes = [...new Set(this.todos.filter(Boolean))]; // elimina nulos y duplicados

        this.ano2022=this.datos.filter((d: { [x: string]: any; }) => d['año'] === '2022');
        this.ano2023=this.datos.filter((d: { [x: string]: any; }) => d['año'] === '2023');
        this.ano2024=this.datos.filter((d: { [x: string]: any; }) => d['año'] === '2024');
        this.ano2025=this.datos.filter((d: { [x: string]: any; }) => d['año'] === '2025');

        this.ano2022Componentes=[...new Set(this.ano2022.map((d: { [x: string]: any; }) => d['componente']).filter(Boolean))];
        this.ano2023Componentes=[...new Set(this.ano2023.map((d: { [x: string]: any; }) => d['componente']).filter(Boolean))];
        this.ano2024Componentes=[...new Set(this.ano2024.map((d: { [x: string]: any; }) => d['componente']).filter(Boolean))];
        this.ano2025Componentes=[...new Set(this.ano2025.map((d: { [x: string]: any; }) => d['componente']).filter(Boolean))];

        console.log('2022', this.ano2022, this.ano2022Componentes);
        console.log('2023', this.ano2023, this.ano2023Componentes);
        console.log('2024', this.ano2024, this.ano2024Componentes);
        console.log('2025', this.ano2025, this.ano2025Componentes);
        //console.log('Componentes únicos:', this.componentes);
        


        // 🔹 Crear estructura agrupada
         
        this.ano2022ComponentesEventos = this.ano2022Componentes.map((comp: any) => {
          const datosComp = this.ano2022.filter((d: { [x: string]: any; }) => d['componente'] === comp);

          // 🔹 Obtener eventos únicos de este componente
          const eventos = [...new Set(datosComp.map((d: { [x: string]: any; }) => d['nom_eve']).filter(Boolean))];

          return {
            componente: comp,
            eventos,
            datos: datosComp
          };
        });
         
        this.ano2023ComponentesEventos = this.ano2023Componentes.map((comp: any) => {
          const datosComp = this.ano2023.filter((d: { [x: string]: any; }) => d['componente'] === comp);

          // 🔹 Obtener eventos únicos de este componente
          const eventos = [...new Set(datosComp.map((d: { [x: string]: any; }) => d['nom_eve']).filter(Boolean))];

          return {
            componente: comp,
            eventos,
            datos: datosComp
          };
        });
         
        this.ano2024ComponentesEventos = this.ano2024Componentes.map((comp: any) => {
          const datosComp = this.ano2024.filter((d: { [x: string]: any; }) => d['componente'] === comp);

          // 🔹 Obtener eventos únicos de este componente
          const eventos = [...new Set(datosComp.map((d: { [x: string]: any; }) => d['nom_eve']).filter(Boolean))];

          return {
            componente: comp,
            eventos,
            datos: datosComp
          };
        });
         
        this.ano2025ComponentesEventos = this.ano2025Componentes.map((comp: any) => {
          const datosComp = this.ano2025.filter((d: { [x: string]: any; }) => d['componente'] === comp);

          // 🔹 Obtener eventos únicos de este componente
          const eventos = [...new Set(datosComp.map((d: { [x: string]: any; }) => d['nom_eve']).filter(Boolean))];

          return {
            componente: comp,
            eventos,
            datos: datosComp
          };
        });


        console.log('2022 Eventos', this.ano2022ComponentesEventos);
        console.log('2023 Eventos', this.ano2023ComponentesEventos);
        console.log('2024 Eventos', this.ano2024ComponentesEventos);
        console.log('2025 Eventos', this.ano2025ComponentesEventos);

        // 🔹 Crear estructura agrupada
         
        this.sivigilaEventos = this.componentes.map((comp: any) => {
          const datosComp = this.datos.filter((d: { [x: string]: any; }) => d['componente'] === comp);

          // 🔹 Obtener eventos únicos de este componente
          const eventos = [...new Set(datosComp.map((d: { [x: string]: any; }) => d['nom_eve']).filter(Boolean))];

          return {
            componente: comp,
            eventos,
            datos: datosComp
          };
        });

        console.log('Estructura agrupada:', this.sivigilaEventos);
        //this.createChart();
      },
      error: (err) => console.error('Error al leer Excel:', err)
    });
  } 
  ngAfterViewInit(): void {
    
    this.initMap();
    this.initMapCapacidadSection('');
     setTimeout(() => {
    
      // Ocultar el spinner
      this.spinner.hide();
    }, 2000); // <- simula 2 segundos de carga
  }
  filtrarEstados(data: FeatureCollection, nombres: string[]) {
    return {
      type: "FeatureCollection" as const,
      features: data.features.filter(
        f => nombres.includes((f.properties as any)?.name)
      )
    };
  }
  private initMap(): void {
    this.map = L.map('map', {
      zoomControl: false,       // Oculta los botones + -
      dragging: false,          // Desactiva arrastrar
      scrollWheelZoom: false,   // Desactiva zoom con scroll
      doubleClickZoom: false,   // Desactiva zoom con doble click
      boxZoom: false,           // Desactiva zoom con selección
      keyboard: false,          // Desactiva mover con teclado
      touchZoom: false          // Desactiva zoom con gestos en móvil
    }).setView([5, -70], 6); // Centro entre CO y VE
    //https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
    L.tileLayer('https://{s}.tile.openstreetmap.org/dark/{z}/{x}/{y}.png').addTo(this.map); 
     
    // Ejemplo con tus geojson filtrados
    Promise.all([
      fetch("assets/colombia-departments.json").then(r => r.json() as Promise<FeatureCollection>),
      fetch("assets/venezuela-states.json").then(r => r.json() as Promise<FeatureCollection>)
    ]).then(([colombia, venezuela]) => {
      
      const style = {
        color: '#bdb5b5ff',
        weight: 0.4,
        fillOpacity: 0.4
      };
      // Añadir Colombia
      // Estados que queremos resaltar
      const targetStates = ["Zulia", "Táchira", "Apure", "Amazonas"];
      const targetDptos = ['Arauca', 'La Guajira', 'Norte de Santander', 'Vichada', 'Guainía', 'Nariño', 'Chocó', 'Putumayo'];
      
      L.geoJSON(venezuela, {
        style: (feature: any) => {
          //console.log(feature);
          if (targetStates.includes(feature.properties.name)) {
            return { ...style, fillColor: '#f2643c', fillOpacity: 0.4 }; // 🔴 Rojo para resaltados
          }
          return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.4 }; // ⚪ Gris claro para los demás
        },
        onEachFeature: (feature, layer: L.Polygon) => {
          layer.bindPopup(` 
            <div class="card-body text-center">
              
              
              
              <!-- Título -->
              <h5 class="fw-bold mb-0" style="color:#f2643c;">${feature.properties.name}</h5>
              <p class="text-muted text-uppercase small mb-3">Venezuela</p>
              
              <!-- Filas de información -->
              <div class="d-flex justify-content-between border-bottom   small">
                <span>CASOS</span>
                <span class="fw-semibold"> ${(targetStates.includes(feature.properties.name))?'1262':'0'}</span>
              </div> 
              
              <!-- Enlace -->
              <a href="#" class="fw-bold small text-decoration-none text-primary">
                <i class="bi bi-file-earmark-text me-1"></i> Mas información
              </a>
            </div> 
          `,{
            className: "leaflet-bootstrap-popup", // clase para estilos
            closeButton: false,
            autoPan: false, 
            offset: L.point(5, 200) // mueve 150px hacia la derecha
          });
          
          // Abrir popup al pasar el mouse
          layer.on("mouseover", function () {
            layer.openPopup();
            layer.setStyle({ weight: 0.8, fillOpacity: 0.8 });
          });

          // Cerrar popup cuando se sale con el mouse
          layer.on("mouseout", function () {
            layer.closePopup();
            layer.setStyle({ weight: 0.4, fillOpacity: 0.4 });
          });
          // Click -> ejecutar tu función
          layer.on("click", () => {
            this.irEvento(feature);
          });
        }
      }).addTo(this.map);

      
      L.geoJSON(colombia, {
        style: (feature: any) => {
          //console.log(feature);
          if (targetDptos.includes(feature.properties.name)) {
            return { ...style, fillColor: '#007bff', fillOpacity: 0.4 }; // 🔴 Rojo para resaltados
          }
          return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.4 }; // ⚪ Gris claro para los demás
        },
        onEachFeature: (feature, layer: L.Polygon) => {
          layer.bindPopup(` 
            <div class="card-body text-center">
              
              <!-- Pin superior
              <div class="position-relative mb-2">
                
                      <i class="bi bi-geo-alt"></i>
            
              </div>
               -->
              <!-- Título -->
              <h6 class="fw-bold mb-0" style="color:#007bff;">${feature.properties.name}</h6>
              <p class="text-muted text-uppercase small mb-3">Colombia</p>
              
              <!-- Filas de información -->
              <div class="d-flex justify-content-between border-bottom pb-1 mb-1 small">
                <span>CASOS</span>
                <span class="fw-semibold"> ${(targetDptos.includes(feature.properties.name))?'1262':'0'}</span>
              </div> 
              
              <!-- Enlace -->
              <a href="#" class="fw-bold small text-decoration-none text-primary">
                <i class="bi bi-file-earmark-text me-1"></i> Mas información
              </a>
            </div> 
          `,{
            className: "leaflet-bootstrap-popup", // clase para estilos
            closeButton: false,
            autoPan: false, 
            offset: L.point(5, 180) // mueve 150px hacia la derecha
          });
          
          
          // Abrir popup al pasar el mouse
          layer.on("mouseover", function () {
            layer.openPopup();
            layer.setStyle({ weight: 0.8, fillOpacity: 0.8 });
          });

          // Cerrar popup cuando se sale con el mouse
          layer.on("mouseout", function () {
            layer.closePopup();
            layer.setStyle({ weight: 0.4, fillOpacity: 0.4 });
          });
          
          // Click -> ejecutar tu función
          layer.on("click", () => {
            this.irEvento(feature);
          });
        
        }
      }).addTo(this.map);

      // Unir los features
      const merged: FeatureCollection = {
        type: "FeatureCollection",
        features: [...colombia.features, ...venezuela.features]
      };

      const bounds = L.geoJSON(merged).getBounds();
      this.map.fitBounds(bounds);
    });
 

    /*
    // 👉 Aquí cargamos los GeoJSON de Colombia y Venezuela
    Promise.all([
      fetch('assets/colombia-departments.json').then(res => res.json()),
      fetch('assets/venezuela-states.json').then(res => res.json())
    ]).then(([colombia, venezuela]) => {
      console.log(colombia);
      console.log(venezuela);
      const style = {
        color: '#333',
        weight: 1,
        fillOpacity: 0.5
      };

      // Colombia 
      // Estados que queremos resaltar
      const targetStates = ["Zulia", "Táchira", "Apure", "Amazonas"];
      const targetDptos = ['Arauca', 'La Guajira', 'Norte de Santander', 'Vichada', 'Guainía', 'Nariño', 'Chocó', 'Putumayo'];

      L.geoJSON(venezuela, {
        style: (feature: any) => {
          console.log(feature);
          if (targetStates.includes(feature.properties.name)) {
            return { ...style, fillColor: '#f2643c', fillOpacity: 0.5 }; // 🔴 Rojo para resaltados
          }
          return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.3 }; // ⚪ Gris claro para los demás
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(` 
            <div class="card-body text-center">
              
              <!-- Pin superior -->
              <div class="position-relative mb-2">
                
                      <i class="bi bi-geo-alt"></i>
            
              </div>
              
              <!-- Título -->
              <h5 class="fw-bold mb-0" style="color:#f2643c;">${feature.properties.name}</h5>
              <p class="text-muted text-uppercase small mb-3">Estado</p>
              
              <!-- Filas de información -->
              <div class="d-flex justify-content-between border-bottom pb-1 mb-1 small">
                <span>CASOS</span>
                <span class="fw-semibold">2023</span>
              </div> 
              
              <!-- Enlace -->
              <a href="#" class="fw-bold small text-decoration-none text-primary">
                <i class="bi bi-file-earmark-text me-1"></i> Mas información
              </a>
            </div> 
          `,{
            className: "leaflet-bootstrap-popup", // clase para estilos
            closeButton: false
          });
        }
      }).addTo(this.map);

      
      L.geoJSON(colombia, {
        style: (feature: any) => {
          console.log(feature);
          if (targetDptos.includes(feature.properties.name)) {
            return { ...style, fillColor: '#007bff', fillOpacity: 0.5 }; // 🔴 Rojo para resaltados
          }
          return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.3 }; // ⚪ Gris claro para los demás
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(` 
            <div class="card-body text-center">
              
              <!-- Pin superior -->
              <div class="position-relative mb-2">
                
                      <i class="bi bi-geo-alt"></i>
            
              </div>
              
              <!-- Título -->
              <h5 class="fw-bold mb-0" style="color:#007bff;">${feature.properties.name}</h5>
              <p class="text-muted text-uppercase small mb-3">Departamento</p>
              
              <!-- Filas de información -->
              <div class="d-flex justify-content-between border-bottom pb-1 mb-1 small">
                <span>CASOS</span>
                <span class="fw-semibold">2023</span>
              </div> 
              
              <!-- Enlace -->
              <a href="#" class="fw-bold small text-decoration-none text-primary">
                <i class="bi bi-file-earmark-text me-1"></i> Mas información
              </a>
            </div> 
          `,{
            className: "leaflet-bootstrap-popup", // clase para estilos
            closeButton: false
          });
        }
      }).addTo(this.map);

 
    });
    */


  }
  irEvento(dato:any){
    
    const targetStates = ["Zulia", "Táchira", "Apure", "Amazonas"];
    const targetDptos = ['Arauca', 'La Guajira', 'Norte de Santander', 'Vichada', 'Guainía', 'Nariño', 'Chocó', 'Putumayo'];
    console.log('ir a evento' , dato);
    if(dato.properties.id.startsWith("VE")){
      //se valida que el estado de venezuela seleccionado este en el listaod targetStates
      if (targetStates.includes(dato.properties.name)) {
          console.log(dato.properties.name);
          //se redirecciona a 
          this.router.navigate(['/detailEvent', 'null', 'VE-'+dato.properties.name]);
      }
    }
    if(dato.properties.id.startsWith("CO")){
      //se valida que el estado de colombia seleccionado este en el listaod targetDptos
      if (targetDptos.includes(dato.properties.name)) {
          console.log(dato.properties.name);
          //se redirecciona a 
          this.router.navigate(['/detailEvent', 'null', 'CO-'+dato.properties.name]);
      }
      
    }

  }
   initMapCapacidadSection(dato: any):void{ 
    console.log(dato);
    if (this.map2) {
      this.map2.remove(); // 👈 elimina el mapa anterior
    }
    if(dato==''){
      
      this.map2 = L.map('map2', {
        zoomControl: false,       // Oculta los botones + -
        dragging: false,          // Desactiva arrastrar
        scrollWheelZoom: false,   // Desactiva zoom con scroll
        doubleClickZoom: false,   // Desactiva zoom con doble click
        boxZoom: false,           // Desactiva zoom con selección
        keyboard: false,          // Desactiva mover con teclado
        touchZoom: false          // Desactiva zoom con gestos en móvil
      }).setView([5, -70], 6); // Centro entre CO y VE
      //https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
      L.tileLayer('https://{s}.tile.openstreetmap.org/dark/{z}/{x}/{y}.png').addTo(this.map2); 
      
      // Ejemplo con tus geojson filtrados
      Promise.all([
        fetch("assets/colombia-departments.json").then(r => r.json() as Promise<FeatureCollection>),
        fetch("assets/venezuela-states.json").then(r => r.json() as Promise<FeatureCollection>)
      ]).then(([colombia, venezuela]) => {
        
        const style = {
          color: '#bdb5b5ff',
          weight: 0.4,
          fillOpacity: 0.4
        };
        // Añadir Colombia
        // Estados que queremos resaltar
        const targetStates = ["Zulia", "Táchira", "Apure", "Amazonas"];
        const targetDptos = ['Arauca', 'La Guajira', 'Norte de Santander', 'Vichada', 'Guainía', 'Nariño', 'Chocó', 'Putumayo'];
        
        L.geoJSON(venezuela, {
          style: (feature: any) => {
            //console.log(feature);
            if (targetStates.includes(feature.properties.name)) {
              return { ...style, fillColor: '#f2643c', fillOpacity: 0.4 }; // 🔴 Rojo para resaltados
            }
            return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.4 }; // ⚪ Gris claro para los demás
          },
          onEachFeature: (feature, layer: L.Polygon) => {
            layer.bindPopup(` 
              <div class="card-body text-center">
                
                
                
                <!-- Título -->
                <h5 class="fw-bold mb-0" style="color:#f2643c;">${feature.properties.name}</h5>
                <p class="text-muted text-uppercase small mb-3">Venezuela</p>
                
                <!-- Filas de información -->
                <div class="d-flex justify-content-between border-bottom   small">
                  <span>CASOS</span>
                  <span class="fw-semibold"> ${(targetStates.includes(feature.properties.name))?'1262':'0'}</span>
                </div> 
                
                <!-- Enlace -->
                <a href="#" class="fw-bold small text-decoration-none text-primary">
                  <i class="bi bi-file-earmark-text me-1"></i> Mas información
                </a>
              </div> 
            `,{
              className: "leaflet-bootstrap-popup", // clase para estilos
              closeButton: false,
              autoPan: false, 
              offset: L.point(5, 200) // mueve 150px hacia la derecha
            });
            
            // Abrir popup al pasar el mouse
            layer.on("mouseover", function () {
              layer.openPopup();
              layer.setStyle({ weight: 0.8, fillOpacity: 0.8 });
            });

            // Cerrar popup cuando se sale con el mouse
            layer.on("mouseout", function () {
              layer.closePopup();
              layer.setStyle({ weight: 0.4, fillOpacity: 0.4 });
            });
            // Click -> ejecutar tu función
            layer.on("click", () => {
              this.irEvento(feature);
            });
          }
        }).addTo(this.map2);

        
        L.geoJSON(colombia, {
          style: (feature: any) => {
            //console.log(feature);
            if (targetDptos.includes(feature.properties.name)) {
              return { ...style, fillColor: '#007bff', fillOpacity: 0.4 }; // 🔴 Rojo para resaltados
            }
            return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.4 }; // ⚪ Gris claro para los demás
          },
          onEachFeature: (feature, layer: L.Polygon) => {
            layer.bindPopup(` 
              <div class="card-body text-center">
                
                <!-- Pin superior
                <div class="position-relative mb-2">
                  
                        <i class="bi bi-geo-alt"></i>
              
                </div>
                -->
                <!-- Título -->
                <h6 class="fw-bold mb-0" style="color:#007bff;">${feature.properties.name}</h6>
                <p class="text-muted text-uppercase small mb-3">Colombia</p>
                
                <!-- Filas de información -->
                <div class="d-flex justify-content-between border-bottom pb-1 mb-1 small">
                  <span>CASOS</span>
                  <span class="fw-semibold"> ${(targetDptos.includes(feature.properties.name))?'1262':'0'}</span>
                </div> 
                
                <!-- Enlace -->
                <a href="#" class="fw-bold small text-decoration-none text-primary">
                  <i class="bi bi-file-earmark-text me-1"></i> Mas información
                </a>
              </div> 
            `,{
              className: "leaflet-bootstrap-popup", // clase para estilos
              closeButton: false,
              autoPan: false, 
              offset: L.point(5, 180) // mueve 150px hacia la derecha
            });
            
            
            // Abrir popup al pasar el mouse
            layer.on("mouseover", function () {
              layer.openPopup();
              layer.setStyle({ weight: 0.8, fillOpacity: 0.8 });
            });

            // Cerrar popup cuando se sale con el mouse
            layer.on("mouseout", function () {
              layer.closePopup();
              layer.setStyle({ weight: 0.4, fillOpacity: 0.4 });
            });
            
            // Click -> ejecutar tu función
            layer.on("click", () => {
              this.irEvento(feature);
            });
          
          }
        }).addTo(this.map2);

        // Unir los features
        const merged: FeatureCollection = {
          type: "FeatureCollection",
          features: [...colombia.features, ...venezuela.features]
        };

        const bounds = L.geoJSON(merged).getBounds();
        this.map2.fitBounds(bounds);
      });

    }else if(dato.includes("CO")){

      this.map2 = L.map('map2', {
        zoomControl: false,       // Oculta los botones + -
        dragging: false,          // Desactiva arrastrar
        scrollWheelZoom: false,   // Desactiva zoom con scroll
        doubleClickZoom: false,   // Desactiva zoom con doble click
        boxZoom: false,           // Desactiva zoom con selección
        keyboard: false,          // Desactiva mover con teclado
        touchZoom: false          // Desactiva zoom con gestos en móvil
      }).setView([5, -70], 6); // Centro entre CO y VE
      //https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
      L.tileLayer('https://{s}.tile.openstreetmap.org/dark/{z}/{x}/{y}.png').addTo(this.map2); 
      
      // Ejemplo con tus geojson filtrados
      Promise.all([
        fetch("assets/colombia-departments.json").then(r => r.json() as Promise<FeatureCollection>)
      ]).then(([colombia]) => {
        
        const style = {
          color: '#bdb5b5ff',
          weight: 0.4,
          fillOpacity: 0.4
        };
        // Añadir Colombia
        // Estados que queremos resaltar
         
        const targetDptos = [dato.split('-')[1]];
       
        
        
        L.geoJSON(colombia, {
          style: (feature: any) => {
            console.log(feature);
            if (targetDptos.includes(feature.properties.name)) {
              return { ...style, fillColor: '#007bff', fillOpacity: 0.4 }; // 🔴 Rojo para resaltados
            }
            return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.4 }; // ⚪ Gris claro para los demás
          },
          onEachFeature: (feature, layer: L.Polygon) => {
            layer.bindPopup(` 
              <div class="card-body text-center">
                
                <!-- Pin superior
                <div class="position-relative mb-2">
                  
                        <i class="bi bi-geo-alt"></i>
              
                </div>
                -->
                <!-- Título -->
                <h6 class="fw-bold mb-0" style="color:#007bff;">${feature.properties.name}</h6>
                <p class="text-muted text-uppercase small mb-3">Colombia</p>
                
                <!-- Filas de información -->
                <div class="d-flex justify-content-between border-bottom pb-1 mb-1 small">
                  <span>CASOS</span>
                  <span class="fw-semibold"> ${(targetDptos.includes(feature.properties.name))?'1262':'0'}</span>
                </div> 
                
                <!-- Enlace -->
                <a href="#" class="fw-bold small text-decoration-none text-primary">
                  <i class="bi bi-file-earmark-text me-1"></i> Mas información
                </a>
              </div> 
            `,{
              className: "leaflet-bootstrap-popup", // clase para estilos
              closeButton: false,
              autoPan: false, 
              offset: L.point(5, 180) // mueve 150px hacia la derecha
            });
            
            
            // Abrir popup al pasar el mouse
            layer.on("mouseover", function () {
              layer.openPopup();
              layer.setStyle({ weight: 0.8, fillOpacity: 0.8 });
            });

            // Cerrar popup cuando se sale con el mouse
            layer.on("mouseout", function () {
              layer.closePopup();
              layer.setStyle({ weight: 0.4, fillOpacity: 0.4 });
            });
            
            // Click -> ejecutar tu función
            layer.on("click", () => {
              this.irEvento(feature);
            });
          
          }
        }).addTo(this.map2);

        // Unir los features
        const merged: FeatureCollection = {
          type: "FeatureCollection",
          features: [...colombia.features]
        };

        const bounds = L.geoJSON(merged).getBounds();
        this.map2.fitBounds(bounds);
      });

    }else if(dato.includes("VE")){

      this.map2 = L.map('map2', {
        zoomControl: false,       // Oculta los botones + -
        dragging: false,          // Desactiva arrastrar
        scrollWheelZoom: false,   // Desactiva zoom con scroll
        doubleClickZoom: false,   // Desactiva zoom con doble click
        boxZoom: false,           // Desactiva zoom con selección
        keyboard: false,          // Desactiva mover con teclado
        touchZoom: false          // Desactiva zoom con gestos en móvil
      }).setView([5, -70], 6); // Centro entre CO y VE
      //https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
      L.tileLayer('https://{s}.tile.openstreetmap.org/dark/{z}/{x}/{y}.png').addTo(this.map2); 
      
      // Ejemplo con tus geojson filtrados
      Promise.all([ 
        fetch("assets/venezuela-states.json").then(r => r.json() as Promise<FeatureCollection>)
      ]).then(([venezuela]) => {
        
        const style = {
          color: '#bdb5b5ff',
          weight: 0.4,
          fillOpacity: 0.4
        };
        // Añadir Colombia
        // Estados que queremos resaltar
        const targetStates = [dato.split('-')[1]]; 
        
        L.geoJSON(venezuela, {
          style: (feature: any) => {
            console.log(feature);
            if (targetStates.includes(feature.properties.name)) {
              return { ...style, fillColor: '#f2643c', fillOpacity: 0.4 }; // 🔴 Rojo para resaltados
            }
            return { ...style, fillColor: '#e0e0e0', fillOpacity: 0.4 }; // ⚪ Gris claro para los demás
          },
          onEachFeature: (feature, layer: L.Polygon) => {
            layer.bindPopup(` 
              <div class="card-body text-center">
                
                
                
                <!-- Título -->
                <h5 class="fw-bold mb-0" style="color:#f2643c;">${feature.properties.name}</h5>
                <p class="text-muted text-uppercase small mb-3">Venezuela</p>
                
                <!-- Filas de información -->
                <div class="d-flex justify-content-between border-bottom   small">
                  <span>CASOS</span>
                  <span class="fw-semibold"> ${(targetStates.includes(feature.properties.name))?'1262':'0'}</span>
                </div> 
                
                <!-- Enlace -->
                <a href="#" class="fw-bold small text-decoration-none text-primary">
                  <i class="bi bi-file-earmark-text me-1"></i> Mas información
                </a>
              </div> 
            `,{
              className: "leaflet-bootstrap-popup", // clase para estilos
              closeButton: false,
              autoPan: false, 
              offset: L.point(5, 200) // mueve 150px hacia la derecha
            });
            
            // Abrir popup al pasar el mouse
            layer.on("mouseover", function () {
              layer.openPopup();
              layer.setStyle({ weight: 0.8, fillOpacity: 0.8 });
            });

            // Cerrar popup cuando se sale con el mouse
            layer.on("mouseout", function () {
              layer.closePopup();
              layer.setStyle({ weight: 0.4, fillOpacity: 0.4 });
            });
            // Click -> ejecutar tu función
            layer.on("click", () => {
              this.irEvento(feature);
            });
          }
        }).addTo(this.map2); 
         
        // Unir los features
        const merged: FeatureCollection = {
          type: "FeatureCollection",
          features: [...venezuela.features]
        };

        const bounds = L.geoJSON(merged).getBounds();
        this.map2.fitBounds(bounds);
      });
      /*
      this.map2 = L.map('map2', {
        zoomControl: false,       // Oculta los botones + -
        dragging: false,          // Desactiva arrastrar
        scrollWheelZoom: false,   // Desactiva zoom con scroll
        doubleClickZoom: false,   // Desactiva zoom con doble click
        boxZoom: false,           // Desactiva zoom con selección
        keyboard: false,          // Desactiva mover con teclado
        touchZoom: false          // Desactiva zoom con gestos en móvil
      }).setView([5, -70], 12); // vista inicial más general

      L.tileLayer('https://{s}.tile.openstreetmap.org/dark/{z}/{x}/{y}.png').addTo(this.map2); 

      Promise.all([ 
        fetch("assets/venezuela-states.json").then(r => r.json() as Promise<FeatureCollection>)
      ]).then(([venezuela]) => {
        
        const style = {
          color: '#bdb5b5ff',
          weight: 0.6,
          fillOpacity: 0.6
        };

        // Estado que queremos resaltar (ej: si `dato = "VE-Carabobo"`)
        const targetState = dato.split('-')[1];

        // Buscar el estado dentro del geojson
        const feature = venezuela.features.find(
          (f: any) => f.properties.name === targetState
        );

        if (!feature) {
          console.warn("Estado no encontrado:", targetState);
          return;
        }

        // Crear capa SOLO con ese feature
        const selectedLayer = L.geoJSON(feature, {
          style: {
            ...style,
            fillColor: '#f2643c',
            fillOpacity: 0.7
          },
          onEachFeature: (feature, layer: L.Polygon) => {
            layer.bindPopup(` 
              <div class="card-body text-center">
                <h5 class="fw-bold mb-0" style="color:#f2643c;">${feature.properties.name}</h5>
                <p class="text-muted text-uppercase small mb-3">Venezuela</p>
                <div class="d-flex justify-content-between border-bottom small">
                  <span>CASOS</span>
                  <span class="fw-semibold">1262</span>
                </div> 
                <a href="#" class="fw-bold small text-decoration-none text-primary">
                  <i class="bi bi-file-earmark-text me-1"></i> Más información
                </a>
              </div> 
            `, {
              className: "leaflet-bootstrap-popup",
              closeButton: false,
              autoPan: false,
              offset: L.point(5, 200)
            });

            layer.on("mouseover", function () {
              layer.openPopup();
              layer.setStyle({ weight: 1, fillOpacity: 0.9 });
            });

            layer.on("mouseout", function () {
              layer.closePopup();
              layer.setStyle({ weight: 0.6, fillOpacity: 0.7 });
            });

            layer.on("click", () => {
              this.irEvento(feature);
            });
          }
        }).addTo(this.map2);

        // Ajustar el zoom SOLO al estado
        this.map2.fitBounds(selectedLayer.getBounds());
      });
      
      */

    }
    this.createChartFiltro(dato);
  }
  createChartFiltro(dato:string){
    console.log(dato);
    const seleccion = [dato.split('-')];
    console.log(seleccion );
    const pais=(dato.split('-')[0]=='CO')?'COLOMBIA':(dato.split('-')[0]=='VE')?'VENEZUELA':'';
    const dpto=(dato.split('-')[1])?(dato.split('-')[1]=='Norte de Santander')?'NORTE SANTANDER':dato.split('-')[1]:'';
    console.log(pais, dpto);
    if(dpto){
      console.log('cargar dpto', dpto);
        this.cretaeChartDpto(dpto);
    }else{

      console.log('cargar todo');
      if(this.chart){
        
        this.chart.destroy();
      }
      setTimeout(() => {
    
        this.createChart();
      }, 5000);
    }
    
       
  }
  createChart() {
    
    console.log((this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.length:0);
   this.chart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels:  ["mental","zoonosis","nutricion","cronicas","ambientales ","saser","etv","ias","inmunoprevenibles","micobacterias","salud oral","SIN ESPECIFICAR"],
        datasets: [{
          label: 'N° de casos 2022: ',
          //data: [this.sivigilaEventos[0].datos.length,this.sivigilaEventos[1].datos.length,this.sivigilaEventos[2].datos.length,this.sivigilaEventos[3].datos.length,this.sivigilaEventos[4].datos.length,this.sivigilaEventos[7].datos.length,this.sivigilaEventos[5].datos.length,this.sivigilaEventos[6].datos.length, this.sivigilaEventos[8].datos.length, this.sivigilaEventos[9].datos.length, this.sivigilaEventos[10].datos.length],
          data:[
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.length:0,
          ],
          backgroundColor: new Array(11).fill('rgba(54, 162, 235, 0.6)'),
          borderColor: new Array(11).fill('rgba(54, 162, 235, 1)'),
          borderWidth: 1
        },
       {
          label: 'N° de casos 2023: ',
          data:[
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.length:0,
          ],backgroundColor: new Array(11).fill('rgba(54, 235, 136, 0.6)'),
          borderColor: new Array(11).fill('rgba(54, 235, 102, 1)'),
          borderWidth: 1
        },
       {
          label: 'N° de casos 2024: ',
          data:[
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.length:0,
          ],backgroundColor: new Array(11).fill('rgba(235, 54, 214, 0.63)'),
          borderColor: new Array(11).fill('rgba(242, 92, 227, 1)'),
          borderWidth: 1
        },
       {
          label: 'N° de casos 2025: ',                                                      
          data:[
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.length:0,
          ],backgroundColor: new Array(11).fill('rgba(247, 41, 41, 0.67)'),
          borderColor: new Array(11).fill('rgba(233, 114, 114, 1)'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Eventos en el área'
          }
        },
        // 🔹 Aquí va la acción al hacer clic
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const label = this.chart.data.labels?.[index];
            const value = this.chart.data.datasets[0].data[index];

            // 🔸 Acción personalizada
            const val = label.split('-')[0];
            this.onBarClick(val as string);
          }
        }
      }
    });
    console.log(this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === 'NORTE SANTANDER'))
  }
  cretaeChartDpto(dpto:string){
    this.chart = new Chart('myChart', {
      type: 'bar',
      data: {
        labels:  ["mental","zoonosis","nutricion","cronicas","ambientales ","saser","etv","ias","inmunoprevenibles","micobacterias","salud oral","SIN ESPECIFICAR"],
        datasets: [{
          label: 'N° de casos 2022: ',
          //data: [this.sivigilaEventos[0].datos.length,this.sivigilaEventos[1].datos.length,this.sivigilaEventos[2].datos.length,this.sivigilaEventos[3].datos.length,this.sivigilaEventos[4].datos.length,this.sivigilaEventos[7].datos.length,this.sivigilaEventos[5].datos.length,this.sivigilaEventos[6].datos.length, this.sivigilaEventos[8].datos.length, this.sivigilaEventos[9].datos.length, this.sivigilaEventos[10].datos.length],
          data:[
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2022ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
          ],
          backgroundColor: new Array(11).fill('rgba(54, 162, 235, 0.6)'),
          borderColor: new Array(11).fill('rgba(54, 162, 235, 1)'),
          borderWidth: 1
        },
       {
          label: 'N° de casos 2023: ',
          data:[
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2023ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
          ],backgroundColor: new Array(11).fill('rgba(54, 235, 136, 0.6)'),
          borderColor: new Array(11).fill('rgba(54, 235, 102, 1)'),
          borderWidth: 1
        },
       {
          label: 'N° de casos 2024: ',
          data:[
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2024ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
          ],backgroundColor: new Array(11).fill('rgba(235, 54, 214, 0.63)'),
          borderColor: new Array(11).fill('rgba(242, 92, 227, 1)'),
          borderWidth: 1
        },
       {
          label: 'N° de casos 2025: ',                                                      
          data:[
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'mental')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'zoonosis')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'nutricion')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'cronicas')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ambientales')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'saser')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'etv')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'ias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'inmunoprevenibles')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'micobacterias')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'salud oral')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
            (this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR').length > 0)?this.ano2025ComponentesEventos.filter((d: { [x: string]: any; }) => d['componente'] === 'SIN ESPECIFICAR')[0].datos.filter((da: { [x: string]: any; }) => da['ndep_notif'] === dpto).length:0,
          ],backgroundColor: new Array(11).fill('rgba(247, 41, 41, 0.67)'),
          borderColor: new Array(11).fill('rgba(233, 114, 114, 1)'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Eventos en el área'
          }
        },
        // 🔹 Aquí va la acción al hacer clic
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const label = this.chart.data.labels?.[index];
            const value = this.chart.data.datasets[0].data[index];

            // 🔸 Acción personalizada
            const val = label.split('-')[0];
            this.onBarClick(val as string);
          }
        }
      }
    });
  }
   // 👇 Función que puedes personalizar
  onBarClick(label: string) {
    //alert(`Has hecho clic en: ${label}`);
    // Aquí puedes hacer algo más útil: navegar, emitir evento, etc.
    
    this.router.navigate([(this.selectedRegion)?'/detailEvent/'+label+'/'+this.selectedRegion:'/detailEvent/'+label+'/null']);
  }
  eventoSeleccionadoVer( ){
    console.log(this.eventoSeleccionado); 
    if(this.eventoSeleccionado){
      if(this.eventoSeleccionado.id){
        this.router.navigate(['/detailEvent', 'null', 'null']);
      }else{
        this.router.navigate(['/detailEvent',this.eventoSeleccionado, 'null']);
      }

    }else{
       Swal.fire(
        {
          title: 'Dato invalido!',
          text: 'Selecciona un evento primero!',
          icon: 'info', 
          confirmButtonColor: '#0066FF',
          confirmButtonText: 'De acuerdo!', 
        }
      );
    }
     
 
  }

 
}
