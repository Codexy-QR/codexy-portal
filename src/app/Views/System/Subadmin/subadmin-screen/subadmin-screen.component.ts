import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subject, takeUntil } from 'rxjs';
import { SubadminHeaderComponent } from '../../../../Components/System/Subadmin/subadmin-header/subadmin-header.component';
import { SubadminSidebarComponent } from '../../../../Components/System/Subadmin/subadmin-sidebar/subadmin-sidebar.component';
import { SubadminNavService } from '../../../../Core/Service/Navigation/subadmin-nav.service';

@Component({
	selector: 'app-subadmin-screen',
	imports: [SubadminHeaderComponent, SubadminSidebarComponent, RouterOutlet],
	templateUrl: './subadmin-screen.component.html',
	styleUrl: './subadmin-screen.component.css'
})
export class SubadminScreenComponent implements OnInit, OnDestroy {

	// Inyección de servicios propios del proyecto
	private readonly subadminNavService = inject(SubadminNavService);

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
				if (event.url === '/subadmin/dashboard' && event.urlAfterRedirects === '/subadmin/dashboard') {
					// Pequeño delay para asegurar que el backend se actualizó
					// setTimeout(() => {
					// 	this.adminHasCompany();
					// }, 500);
				}
			});
	}

	private listenToSidebarClose(): void {
		this.subadminNavService.closeSidebar$
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
