import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
	selector: 'app-access-denied',
	standalone: true,
	imports: [MatCardModule, MatButtonModule, MatIconModule],
	templateUrl: './access-denied.component.html',
  styleUrl: './access-denied.component.css'
})
export class AccessDeniedComponent {
	constructor(private router: Router) { }

	goToLogin(): void {
		this.router.navigate(['/Login']);
	}
}
