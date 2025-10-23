import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of, Subscription } from 'rxjs';
import { ZoneByBranchMod } from '../../../../Core/Models/System/ZoneMod.model';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { NavigationItem, NavigationState, SubadminNavService } from '../../../../Core/Service/Navigation/subadmin-nav.service';
import { ZoneService } from '../../../../Core/Service/System/zone.service';
import { BranchService } from './../../../../Core/Service/System/branch.service';

@Component({
	selector: 'app-subadmin-sidebar',
	imports: [CommonModule, MatIconModule, MatButtonModule],
	standalone: true,
	templateUrl: './subadmin-sidebar.component.html',
	styleUrls: ['../../../Shared/Styles/sidebar-shared.css', './subadmin-sidebar.component.css']
})
export class SubadminSidebarComponent implements OnInit, OnDestroy {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly branchService = inject(BranchService);
	private readonly zoneService = inject(ZoneService);
	private readonly alertService = inject(AlertTotalService);


	@Input() isExpanded: boolean = false;
	@Output() toggleSidebar = new EventEmitter<void>();

	navigationItems: NavigationItem[] = [];
	navigationState: NavigationState = {
		currentRoute: '',
		expandedSections: {},
		activeSection: undefined
	};

	branchId: number | null = null;
	private navigationSubscription: Subscription = new Subscription();

	// Datos dinámicos
	zonas: ZoneByBranchMod[] = [];

	constructor(private navigationService: SubadminNavService) { }

	ngOnInit(): void {
		// Suscribirse a cambios de estado de navegación
		this.navigationSubscription = this.navigationService.navigationState$
			.subscribe(state => {
				this.navigationState = state;
			});

		// Suscribirse a la recarga de zonas
		this.navigationService.refreshZones$
			.subscribe(() => {
				if (this.branchId) {
					this.cargarZonas();
				}
			});

		// Obtener ID de usuario
		const userIdString = this.authService.getIdUser();
		const idUser = parseInt(userIdString, 10);
		if (isNaN(idUser)) {
			console.log('ID de usuario no válido');
			return;
		}

		this.branchService.getByIdInCharge(idUser).pipe(
			catchError(error => {
				console.log('Error al obtener la sucursal: ' + error.message);
				return of(null);
			})
		).subscribe(branch => {
			if (!branch) {
				console.log('No se pudo obtener la sucursal');
				return;
			}
			this.branchId = branch.id;
			this.cargarZonas();
		});
	}

	// Métodos del ciclo de vida del componente
	ngOnDestroy(): void {
		if (this.navigationSubscription) {
			this.navigationSubscription.unsubscribe();
		}
	}

	cargarZonas(): void {
		this.zoneService.getByIdBranch(this.branchId).subscribe({
			next: (data) => {
				this.zonas = data;
				this.updateNavigation();
			},
			error: (err) => {
				console.log('Error al cargar los datos:', err);
				const mensajeCompleto = err?.error?.message || 'Ocurrió un error inesperado.';
				const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
				this.alertService.error('Error', mensaje);
			}
		});
	}

	private updateNavigation(): void {
		// Obtener configuración estática
		this.navigationItems = this.navigationService.getNavigationConfig();

		// Agregar items dinámicos (zonas)
		this.addDynamicZonas();
	}

	private addDynamicZonas(): void {
		const dynamicZonas: NavigationItem[] = this.zonas.map(zona => ({
			id: `dynamic-zona-${zona.id}`,
			label: zona.name,
			icon: 'map',
			route: `/subadmin/zone/${zona.id}`
		}));

		this.navigationService.addDynamicItems('zonas', dynamicZonas);

		// Actualizar navigationItems
		this.navigationItems = this.navigationService.getNavigationConfig();
	}

	// Métodos del template
	isRouteActive(route: string): boolean {
		return this.navigationService.isRouteActive(route);
	}

	isSectionActive(sectionId: string): boolean {
		return this.navigationService.isSectionActive(sectionId);
	}

	isSectionExpanded(sectionId: string): boolean {
		return this.navigationService.isSectionExpanded(sectionId);
	}

	toggleSection(sectionId: string): void {
		this.navigationService.toggleSection(sectionId);
	}

	navigateTo(route: string): void {
		this.navigationService.navigateTo(route);

		// Solo cerrar el sidebar en dispositivos móviles
		if (window.innerWidth < 768) {
			this.onToggleSidebar();
		}
	}

	// Event listeners
	@HostListener('document:keydown.escape', ['$event'])
	onEscapeKey(event: KeyboardEvent) {
		if (this.isExpanded) {
			this.onToggleSidebar();
			event.preventDefault();
		}
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

	@HostListener('window:resize', ['$event'])
	onResize(event: any) {
		if (window.innerWidth >= 768 && !this.isExpanded) {
			this.onToggleSidebar();
		}
	}

	onToggleSidebar(): void {
		this.toggleSidebar.emit();
	}
}
