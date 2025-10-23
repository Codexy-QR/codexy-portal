import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-initial-header',
	imports: [CommonModule, MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
	standalone: true,
	templateUrl: './initial-header.component.html',
	styleUrl: './initial-header.component.css'
})
export class InitialHeaderComponent {

	// Inputs principales del componente
	@Input() text: string = '';
	@Input() textMargin: string = '0';
	@Input() showSidebarToggle: boolean = false;
	@Input() redirectUrl: string = '/';
	@Input() isFixed: boolean = false;

	// Outputs de eventos emitidos al componente padre
	@Output() toggleSidebar = new EventEmitter<void>();

	onToggleSidebar(): void {
		this.toggleSidebar.emit();
	}
}
