import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerServiceService } from '../servicios/spinner-service.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {
  constructor(public spinnerService: SpinnerServiceService) {}

}
