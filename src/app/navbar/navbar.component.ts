import { Component, HostListener  } from '@angular/core';
import { RouterModule  } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent { 
  @HostListener('window:scroll', [])

  
  onWindowScroll() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }

}
