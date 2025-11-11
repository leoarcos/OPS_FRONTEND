import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DetailEventComponent } from './pages/detail-event/detail-event.component';
import { DetailGeographyComponent } from './pages/detail-geography/detail-geography.component';

export const routes: Routes = [
    
    {
    path: '', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'home', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'detailEvent/:componente/:region', loadComponent: () => import('./pages/detail-event/detail-event.component').then((m) => m.DetailEventComponent),
  },
  {
    path: 'detailGeography/:data', loadComponent: () => import('./pages/detail-geography/detail-geography.component').then((m) => m.DetailGeographyComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
  /*
  { path: '', component: HomeComponent }, // ruta por defecto
    { path: 'home', component: HomeComponent }, 
    { path: 'detailEvent/:evento', component: DetailEventComponent},
    { path: 'detailGeography/:data', component: DetailGeographyComponent},
    { path: '**', redirectTo: '' }, // rutas no encontradas → login
     */
];