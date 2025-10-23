import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { AreaManagerHeaderComponent } from '../../../../Components/System/Area_Manager/area-manager-header/area-manager-header.component';
import { AreaManagerSidebarComponent } from '../../../../Components/System/Area_Manager/area-manager-sidebar/area-manager-sidebar.component';
import { AreaManagerNavService } from '../../../../Core/Service/Navigation/areaManager-nav.service';

@Component({
	selector: 'app-area-manager-screen',
	imports: [AreaManagerHeaderComponent, AreaManagerSidebarComponent, RouterOutlet],
	templateUrl: './area-manager-screen.component.html',
	styleUrl: './area-manager-screen.component.css'
})
export class AreaManagerScreenComponent implements OnInit, OnDestroy {

	// Inyección de servicios propios del proyecto
	private readonly areaManagerNavService = inject(AreaManagerNavService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);
	private readonly destroy$ = new Subject<void>();

	isSidebarExpanded: boolean = false;

	ngOnInit(): void {
		this.listenToRouteChanges();
		this.listenToSidebarClose();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	private listenToRouteChanges(): void {
		this.router.events
			.pipe(
				filter(event => event instanceof NavigationEnd),
				takeUntil(this.destroy$)
			)
			.subscribe((event: NavigationEnd) => {
				// Si viene del registro de empresa al dashboard, verificar nuevamente
				if (event.url === '/areaManager/dashboard' && event.urlAfterRedirects === '/areaManager/dashboard') {
					// Pequeño delay para asegurar que el backend se actualizó
					// setTimeout(() => {
					// 	this.adminHasCompany();
					// }, 500);
				}
			});
	}

	private listenToSidebarClose(): void {
		this.areaManagerNavService.closeSidebar$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.isSidebarExpanded = false;
			});
	}


	onToggleSidebar(): void {
		this.isSidebarExpanded = !this.isSidebarExpanded;
	}

	expandSidebar(): void {
		this.isSidebarExpanded = true;
	}
}
