import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { AdminHeaderComponent } from "../../../../Components/System/Admin/admin-header/admin-header.component";
import { AdminSidebarComponent } from "../../../../Components/System/Admin/admin-sidebar/admin-sidebar.component";
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { Subject, takeUntil, filter } from 'rxjs';
import { AdminNavService } from '../../../../Core/Service/Navigation/admin-nav.service';

@Component({
	selector: 'app-admin-screen',
	imports: [AdminHeaderComponent, AdminSidebarComponent, RouterOutlet],
	templateUrl: './admin-screen.component.html',
	styleUrl: './admin-screen.component.css'
})
export class AdminScreenComponent implements OnInit, OnDestroy {

	// Inyección de servicios propios del proyecto
	private readonly userService = inject(UserService)
	private readonly adminNavService = inject(AdminNavService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);
	private readonly destroy$ = new Subject<void>();

	isSidebarExpanded: boolean = false;
	hasCompany: boolean | null = null;

	ngOnInit(): void {
		this.adminHasCompany();
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
				if (event.url === '/admin/dashboard' && event.urlAfterRedirects === '/admin/dashboard') {
					// Pequeño delay para asegurar que el backend se actualizó
					setTimeout(() => {
						this.adminHasCompany();
					}, 500);
				}
			});
	}

	private listenToSidebarClose(): void {
		this.adminNavService.closeSidebar$
			.pipe(takeUntil(this.destroy$))
			.subscribe(() => {
				this.isSidebarExpanded = false;
			});
	}

	adminHasCompany(): void {
		this.userService.hasCompany()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (data) => {
					this.hasCompany = data.hasCompany;

					const currentUrl = this.router.url;

					if (!data.hasCompany) {
						if (!currentUrl.includes('/admin/welcome') && !currentUrl.includes('/admin/register-company')) {
							this.router.navigate(['/admin/welcome']);
						}
					} else {
						if (currentUrl === '/admin' ||
							currentUrl === '/admin/' ||
							currentUrl.includes('/admin/register-company') ||
							currentUrl.includes('/admin/welcome')) {
							this.router.navigate(['/admin/dashboard']);
						}
					}
				},
				error: (err) => {
					const mensajeCompleto = err?.error?.message || 'Ocurrió un error inesperado.';
					const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
					console.error('Error:', mensaje);

					this.hasCompany = false;
					this.router.navigate(['/admin/welcome']);
				}
			});
	}


	onToggleSidebar(): void {
		this.isSidebarExpanded = !this.isSidebarExpanded;
	}

	expandSidebar(): void {
		this.isSidebarExpanded = true;
	}
}
