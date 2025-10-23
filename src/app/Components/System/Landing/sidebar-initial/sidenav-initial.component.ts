import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
	selector: 'app-sidebar-initial',
	imports: [CommonModule, MatIconModule, MatButtonModule],
	standalone: true,
	templateUrl: './sidebar-initial.component.html',
	styleUrl: './sidebar-initial.component.css'
})
export class SidebarInitialComponent {

	// Inputs principales del componente
	@Input() isExpanded: boolean = false;

	// Outputs de eventos emitidos al componente padre
	@Output() toggleSidebar = new EventEmitter<void>();

	constructor(private router: Router) { }

	@HostListener('document:keydown.escape', ['$event'])
	onEscapeKey(event: KeyboardEvent) {
		if (this.isExpanded) {
			this.onToggleSidebar();
			event.preventDefault();
		}
	}

	onToggleSidebar(): void {
		this.toggleSidebar.emit();
	}

	// Método para navegar y cerrar sidebar
	navigateTo(route: string): void {
		this.router.navigate([route]);
		this.onToggleSidebar(); // Cierra el sidebar al navegar
	}

	@HostListener('document:click', ['$event'])
	onClickOutside(event: Event) {
		const target = event.target as HTMLElement;
		if (this.isExpanded && !target.closest('.sidebar') &&
			!target.closest('.sidebar-toggle') &&
			!target.closest('.sidebar-overlay')) {
			this.onToggleSidebar();
		}
	}
}
