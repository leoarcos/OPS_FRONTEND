import { ChangeDetectorRef, Component, ViewChild, ElementRef } from '@angular/core';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SpinnerServiceService } from '../../servicios/spinner-service.service';
import { SpinnerComponent } from "../../spinner/spinner.component";
import { EventosService } from '../../servicios/eventos.service';
import { DocumentosService } from '../../servicios/documentos.service';
import { FeatureCollection,Geometry, GeoJsonProperties } from "geojson";
import { Chart } from 'chart.js/auto';
import * as L from 'leaflet';
interface SivigilaEvento {
  componente: string;
  eventos: string[];
  datos: any[];
}

interface SivigilaAnos {
  ano: string;
  eventos: string[];
  datos: any[];
  
}

@Component({
  selector: 'app-detail-event',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, SpinnerComponent],
  templateUrl: './detail-event.component.html',
  styleUrl: './detail-event.component.css'
})

export class DetailEventComponent {
  eventos = [
    { id: null, nombre: 'Todos' },
    { id: 2, nombre: 'Conferencia de tecnología' },
    { id: 3, nombre: 'Festival gastronómico' },
    { id: 4, nombre: 'Maratón 10K' },
  ];
    private map1!: L.Map;  
    private map2!: L.Map;  
  
  @ViewChild('ngSelectEvento') ngSelectEvento!: NgSelectComponent;
  isDropdownOpen = false;
  eventoSeleccionado: any;
  componenteSeleccionado:any;
  selectedRegion: string = '';
  selectedDpto: string = '';
  dataEventos: any;
  dataEvento: any;
  nombreEvento='';
  sivigilaEventos: SivigilaEvento[] = [];
  sivigilaAnos: SivigilaEvento[] = [];
  columnas:any;
  datos:any;
  todos:any;
  componentes:any;
  paramComponente:any;
  paramRegion:any;
  selectedAno: string = '';
  
  @ViewChild('nacionalidadChart') nacionalidadChart!: ElementRef;
  @ViewChild('componenteChart') componenteChart!: ElementRef;
  @ViewChild('sexoChart') sexoChart!: ElementRef;
  @ViewChild('periodoChart') periodoChart!: ElementRef;
  @ViewChild('anioChart') anioChart!: ElementRef;
  @ViewChild('edadChart') edadChart!: ElementRef;
  @ViewChild('poblacionalChart') poblacionalChart!: ElementRef;
  
  constructor(private documentosService:DocumentosService, private eventosServicse: EventosService, private route: ActivatedRoute, private spinner: SpinnerServiceService, private router: Router, private cdRef: ChangeDetectorRef){}
  ngOnInit():void{
    this.paramComponente=this.route.snapshot.paramMap.get('componente');
    this.paramRegion=this.route.snapshot.paramMap.get('region');
    console.log(this.paramComponente, this.paramRegion);
     this.mostrarSpinner();
     /*
      this.eventosServicse.obtenerEventos().subscribe(
        (data) => {
          console.log(data);
          this.dataEventos=data;
          this.dataEvento=this.getDataEvento(this.paramComponente);
          console.log(this.dataEvento);
        },
        (error) => {
          console.error('Error al cargar el archivo JSON', error);
        }
      );
    */
    const ruta = 'documentos/base.xlsx';
    this.documentosService.leerExcelLocal(ruta).subscribe({
      next: (data) => {
        this.datos = data;
        this.columnas = Object.keys(data[0] || {});
       // console.log('Datos del Excel:', data);
        this.todos = this.datos.map((d: { [x: string]: any; }) => d['componente']);
        //console.log(this.todos);
        this.componentes = [...new Set(this.todos.filter(Boolean))]; // elimina nulos y duplicados

        //console.log('Componentes únicos:', this.componentes);
        
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
        this.sivigilaAnos = this.componentes.map((comp: any) => {
          const datosComp = this.datos.filter((d: any) => d['componente'] === comp);

          // 🔹 Obtener eventos únicos
          const eventos = [...new Set(datosComp.map((d: any) => d['nom_eve']).filter(Boolean))];

          // 🔹 Obtener años únicos
          const años = [...new Set(datosComp.map((d: any) => d['año']).filter(Boolean))];

          // 🔹 Construir estructura con los años como claves directas
          const objetoComponente: any = {
            componente: comp,
            eventos
          };

          años.forEach((anio: any) => {
            objetoComponente[anio] = datosComp.filter((d: any) => d['año'] === anio);
          });

          return objetoComponente;
        });
        
        this.crearGraficas();
        console.log('Estructura agrupada:', this.sivigilaEventos);
        console.log('Estructura agrupada anos:', this.sivigilaAnos);
        if(this.paramComponente=='null' || this.paramComponente==null){
          console.log('no hay componente');
          if(this.paramRegion=='null' || this.paramRegion==null){
            console.log('no hay region');
            this.cargarDatosTodo();

          }else{
            console.log('hay region');
            this.cargarDatosSoloRegion();

          }
          
        }else{
          console.log('hay componente');
          this.componenteSeleccionado=this.paramComponente;
          if(this.paramRegion=='null' || this.paramRegion==null){
            console.log('no hay region');
            this.cargarDatosSoloComponente();

          }else{
            console.log('hay region');
            this.cargarDatosComponenteRegion();

          }

        }
         
      },
      error: (err) => console.error('Error al leer Excel:', err)
    });  
    
    this.map1 = L.map('map1', {
      zoomControl: false,       // Oculta los botones + -
      dragging: false,          // Desactiva arrastrar
      scrollWheelZoom: false,   // Desactiva zoom con scroll
      doubleClickZoom: false,   // Desactiva zoom con doble click
      boxZoom: false,           // Desactiva zoom con selección
      keyboard: false,          // Desactiva mover con teclado
      touchZoom: false          // Desactiva zoom con gestos en móvil
    }).setView([5, -70], 6); // Centro entre CO y VE
    //https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
    L.tileLayer('https://{s}.tile.openstreetmap.org/dark/{z}/{x}/{y}.png').addTo(this.map1); 
    
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
        
        const targetDptos = ['Arauca', 'La Guajira', 'Norte de Santander', 'Vichada', 'Guainía', 'Nariño', 'Chocó', 'Putumayo'];
      
        
        
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
            // this.irEvento(feature);
            });
          
          }
        }).addTo(this.map1);

        // Unir los features
        const merged: FeatureCollection = {
          type: "FeatureCollection",
          features: [...colombia.features]
        };

        const bounds = L.geoJSON(merged).getBounds();
        this.map1.fitBounds(bounds);
      });
      
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
        const targetStates = ["Zulia", "Táchira", "Apure", "Amazonas"];
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
              //this.irEvento(feature);
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
  }
  cargarDatosComponenteRegion() {
    throw new Error('Method not implemented. cargarDatosComponenteRegion');
  }
  cargarDatosSoloComponente() {
    throw new Error('Method not implemented. cargarDatosSoloComponente');
  }
  cargarDatosSoloRegion() {
    throw new Error('Method not implemented. cargarDatosSoloRegion');
  }
  cargarDatosTodo() {
    throw new Error('Method not implemented. cargarDatosTodo');
  }
  ngAfterViewInit(): void {
     
    //this.cargarDatosEvento(this.eventoSeleccionado);
    this.cdRef.detectChanges(); 
    this.ocultarSpinner();
    
  }
  
  crearGraficas(): void {

    // 2️⃣ Atenciones por componente (Bar)
    new Chart(this.componenteChart.nativeElement, {
      type: 'bar',
      data: {
        labels:  [this.sivigilaEventos[0].componente, this.sivigilaEventos[1].componente,this.sivigilaEventos[2].componente,this.sivigilaEventos[3].componente,this.sivigilaEventos[4].componente,this.sivigilaEventos[7].componente,this.sivigilaEventos[5].componente,this.sivigilaEventos[6].componente,this.sivigilaEventos[8].componente, this.sivigilaEventos[9].componente, this.sivigilaEventos[10].componente],
        datasets: [{
          label: 'Atenciones',
          data: [this.sivigilaEventos[0].datos.length,this.sivigilaEventos[1].datos.length,this.sivigilaEventos[2].datos.length,this.sivigilaEventos[3].datos.length,this.sivigilaEventos[4].datos.length,this.sivigilaEventos[7].datos.length,this.sivigilaEventos[5].datos.length,this.sivigilaEventos[6].datos.length, this.sivigilaEventos[8].datos.length, this.sivigilaEventos[9].datos.length, this.sivigilaEventos[10].datos.length],
          backgroundColor: '#4BC0C0'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });

    // 1️⃣ Atenciones por nacionalidad (Doughnut)
    new Chart(this.nacionalidadChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Colombia', 'Venezuela'],
        datasets: [{
          data: [this.datos.filter((d: { [x: string]: any; }) => d['nombre_nacionalidad'] === 'COLOMBIA'), this.datos.filter((d: { [x: string]: any; }) => d['nombre_nacionalidad'] === 'VENEZUELA').length],
          backgroundColor: ['#36A2EB', '#FF6384']
        }]
      },
      options: { responsive: true }
    });
    // 3️⃣ Atenciones por sexo (Doughnut)
    new Chart(this.sexoChart.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Masculino', 'Femenino', 'Indeterminado'],
        datasets: [{
          data: [this.datos.filter((d: { [x: string]: any; }) => d['sexo_'] === 'M').length, this.datos.filter((d: { [x: string]: any; }) => d['sexo_'] === 'F').length, this.datos.filter((d: { [x: string]: any; }) => d['sexo_'] === 'I').length],
          backgroundColor: ['#FF9F40', '#9966FF', '#FF6384']
        }]
      },
      options: { responsive: true }
    });
    const semanas = Array.from({ length: 52 }, (_, i) => `Sem ${i + 1}`);
    const datosSemanas = semanas.map(() => Math.floor(Math.random() * 100) + 20);
 
    // 4️⃣ Número de atenciones por periodo epidemiológico (Bar)
    console.log((this.sivigilaEventos[0] as any)['2023']);
    new Chart(this.periodoChart.nativeElement, {
      type: 'bar',
      data: {
        labels: semanas,
        datasets: [{
          label: 'Atenciones',
          data: [
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '1').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '01').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '2').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '02').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '3').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '03').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '4').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '04').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '5').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '05').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '6').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '06').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '7').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '07').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '8').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '08').length),
                (this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '9').length+this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '09').length),
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '10').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '11').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '12').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '13').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '14').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '15').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '16').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '17').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '18').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '19').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '20').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '21').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '22').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '23').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '24').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '25').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '26').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '27').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '28').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '29').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '30').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '31').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '32').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '33').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '34').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '35').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '36').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '37').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '38').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '39').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '40').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '41').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '42').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '43').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '44').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '45').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '46').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '47').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '48').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '49').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '50').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '51').length,
                this.datos.filter((d: { [x: string]: any; }) => d['semana'] === '52').length],
          backgroundColor: '#FF6384'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Atenciones por Semana Epidemiológica (1-52)' }
        },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { autoSkip: true, maxTicksLimit: 12 } } // muestra cada 4-5 semanas
        }
      }
    });

    // 5️⃣ Número de atenciones por año (Line)
    new Chart(this.anioChart.nativeElement, {
      type: 'line',
      data: {
        labels: [ '2022', '2023', '2024', '2025'],
        datasets: [{
          label: 'Atenciones',
          data: [200, 260, 300, 280],
          borderColor: '#36A2EB',
          fill: false,
          tension: 0.3
        }]
      },
      options: { responsive: true }
    });

    // 6️⃣ Atenciones por edad (Bar)
    new Chart(this.edadChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['0-5', '6-12', '13-18', '19-30', '31-50', '51+'],
        datasets: [{
          label: 'Atenciones',
          data: [70, 110, 90, 130, 100, 60],
          backgroundColor: '#FFCE56'
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true } }
      }
    });
    
    // 7️⃣ Atenciones por grupo poblacional (Doughnut)
    new Chart(this.poblacionalChart.nativeElement, {
      type: 'polarArea',
      data: {
        labels: ['Discapacitado', 'Desplazado', 'Migrante', 'Carcelario', 'Gestante'],
        datasets: [{
          data: [40, 80, 120, 25, 60],
          backgroundColor: [
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: '#fff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Atenciones por Grupo Poblacional' },
          legend: { position: 'bottom' }
        },
        scales: {
          r: {
            ticks: { stepSize: 20 },
            grid: { color: 'rgba(0,0,0,0.1)' }
          }
        }
      }
    });
  }

  mostrarSpinner(){
     this.spinner.show();
  }
  ocultarSpinner() {
    console.log('cambiando');
    // Simular una carga (API, procesamiento, etc.)
    setTimeout(() => {
    
      // Ocultar el spinner
      this.spinner.hide();
    }, 2000); // <- simula 2 segundos de carga
  }
  getEventoPorId(id: number | null) {
    return this.eventos.find(evento => evento.id === id);
  }
  getDataEventoTitulo(id: string): string | null {
    // Verifica que 'dataEventos' esté definido y tiene los datos esperados 
    const evento = this.dataEventos.find((evento: { id: string; }) => evento.id === id);
    
    return evento ? evento.titulo : null;
  }
  getDataEvento(id: any): any | null {
    // Verifica que 'dataEventos' esté definido y tiene los datos esperados 
    const evento = this.dataEventos.find((evento: { id: string; }) => evento.id === id);
    
    return evento ? evento : null;
  }
  eventoSeleccionadoVer(event:any){
    this.spinner.show();
    console.log(this.eventoSeleccionado); 
    this.dataEvento=this.getDataEvento(this.eventoSeleccionado);
    if(this.eventoSeleccionado==null){
       this.router.navigate(['/detailEvent', 'null', 'null']);
    }else{
       this.router.navigate(['/detailEvent',this.eventoSeleccionado, 'null']);
    }
    this.ocultarSpinner();
    this.cargarDatosEvento(this.eventoSeleccionado);

  }
  cargarDatosEvento(data:any){
    console.log(data);
    if(data==null || data=='null'){
      console.log('carganfdo todos');
      //Cargar vista generela de todos los eventos
      //se  buscan todos los eventos
      this.getDatosEventosAll();
    }else{
      this.getDatosEvento(data);
    }
  }
  getDatosEvento(id:any){
    console.log('carganfdo evento');
    console.log(id);
    //aca se busca el archivo con los datos
     setTimeout(() => {
    
      // Ocultar el spinner
      this.spinner.hide();
    }, 2000); // <- simula 2 segundos de carga
    
  }
  getDatosEventosAll(){
     setTimeout(() => {
    
      // Ocultar el spinner
      this.spinner.hide();
    }, 2000); // <- simula 2 segundos de carga
  }
  toggleSelect() {
    console.log('a');
    this.ngSelectEvento.toggle(); // alterna entre open y close
    if (this.isDropdownOpen) {
      this.ngSelectEvento.close();
      this.isDropdownOpen = false;
    } else {
      this.ngSelectEvento.open();
      this.isDropdownOpen = true;
    }
  }
}
