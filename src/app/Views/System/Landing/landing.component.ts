import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CarouselComponent } from '../../../Components/System/Landing/carousel/carousel.component';
import { InitialHeaderComponent } from '../../../Components/System/Landing/initial-header/initial-navbar.component';
import { SidebarInitialComponent } from '../../../Components/System/Landing/sidebar-initial/sidenav-initial.component';

@Component({
	selector: 'app-landing',
	imports: [CommonModule, InitialHeaderComponent, SidebarInitialComponent, CarouselComponent, MatIconModule],
	standalone: true,
	templateUrl: './landing.component.html',
	styleUrl: './landing.component.css'
})
export class LandingComponent {
	isSidebarExpanded: boolean = false;

	onToggleSidebar(): void {
		this.isSidebarExpanded = !this.isSidebarExpanded;
	}
	expandSidebar(): void {
		this.isSidebarExpanded = true;
	}
}
