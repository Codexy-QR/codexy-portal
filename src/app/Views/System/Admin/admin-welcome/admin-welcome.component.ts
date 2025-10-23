import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'admin-app-welcome',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './admin-welcome.component.html',
  styleUrls: ['./admin-welcome.component.css']
})
export class AdminWelcomeComponent {

  constructor(private router: Router) {}

  navigateToRegister(): void {
    // Navegar al componente de registro de empresa
    this.router.navigate(['/admin/register-company']);
  }
}
