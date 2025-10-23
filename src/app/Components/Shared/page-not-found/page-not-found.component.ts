import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, CommonModule],
	templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.css'
})
export class PageNotFoundComponent {
  constructor(private router: Router) {}

  goBack(): void {
    window.history.back();
  }

  isAuthenticated(): boolean {
    // Implementar lógica para verificar si está autenticado
    return localStorage.getItem('auth_token') !== null;
  }
}
