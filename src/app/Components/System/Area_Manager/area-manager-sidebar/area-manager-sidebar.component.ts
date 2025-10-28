import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, of, Subscription } from 'rxjs';
import { OpGroupByAreaManagerMod } from '../../../../Core/Models/System/OpGroupMod';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { AreaManagerNavService, NavigationItem, NavigationState } from '../../../../Core/Service/Navigation/areaManager-nav.service';
import { OpGroupService } from '../../../../Core/Service/System/opGroup.service';
import Swal from 'sweetalert2';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-area-manager-sidebar',
	imports: [CommonModule, MatIconModule, MatButtonModule],
	standalone: true,
	templateUrl: './area-manager-sidebar.component.html',
	styleUrls: ['../../../Shared/Styles/sidebar-shared.css', './area-manager-sidebar.component.css']
})
export class AreaManagerSidebarComponent implements OnInit, OnDestroy {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly opGroupService = inject(OpGroupService);
	private readonly alertService = inject(AlertTotalService)

	// Inputs principales del componente
	@Input() isExpanded: boolean = false;

	// Outputs de eventos emitidos al componente padre
	@Output() toggleSidebar = new EventEmitter<void>();

	navigationItems: NavigationItem[] = [];
	navigationState: NavigationState = {
		currentRoute: '',
		expandedSections: {},
		activeSection: undefined
	};
	areaManagerId: number | null = null;

	private navigationSubscription: Subscription = new Subscription();
	private refreshSubscription: Subscription = new Subscription();

	// Datos dinámicos
	opGroups: OpGroupByAreaManagerMod[] = [];

	constructor(private navigationService: AreaManagerNavService) { }

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		// Suscribirse a cambios de estado de navegación
		this.navigationSubscription = this.navigationService.navigationState$
			.subscribe(state => {
				this.navigationState = state;
			});

		// Suscribirse a la recarga de opGroups
		this.refreshSubscription = this.navigationService.refreshOperatingGroups$
			.subscribe(() => {
				if (this.areaManagerId) {
					this.cargarOpGroups();
				}
			});

		// Obtener ID de usuario
		const userIdString = this.authService.getIdUser();
		const idUser = parseInt(userIdString, 10);
		if (isNaN(idUser)) {
			console.warn('ID de usuario no válido');
			return;
		}

		// Asignar como areaManagerId (aquí podrías agregar una validación extra si tu backend lo permite)
		this.areaManagerId = idUser;

		// AGREGAR ESTA LÍNEA: Inicializar navegación básica
		this.initializeNavigation();

		if (this.areaManagerId) {
			this.cargarOpGroups();
		}
	}

	private initializeNavigation(): void {
		// Obtener configuración estática inicial
		this.navigationItems = this.navigationService.getNavigationConfig();
	}

	ngOnDestroy(): void {
		this.navigationSubscription.unsubscribe();
		this.refreshSubscription.unsubscribe();
	}

	cargarOpGroups(): void {
		this.opGroupService.getByIdAreaManger(this.areaManagerId).pipe(
			catchError(err => {
				console.error('Error al cargar los datos:', err);
				const mensajeCompleto = err?.error?.message || 'Ocurrió un error inesperado.';
				const mensaje = mensajeCompleto.includes(':')
					? mensajeCompleto.split(':')[1].trim()
					: mensajeCompleto;

				this.alertService.error('Error', mensaje);

				return of([]);
			})
		).subscribe((data: OpGroupByAreaManagerMod[]) => {
			this.opGroups = data || [];
			this.updateNavigation();
		});
	}

	private updateNavigation(): void {
		// Obtener configuración estática
		this.navigationItems = this.navigationService.getNavigationConfig();

		// Agregar items dinámicos (opGroups)
		this.addDynamicOpGroups();
	}

	private addDynamicOpGroups(): void {
		const dynamicOpGroups: NavigationItem[] = this.opGroups.map(opGroup => ({
			id: `dynamic-opGroup-${opGroup.id}`,
			label: opGroup.name,
			icon: 'diversity_3',
			route: `/areaManager/operative-group/${opGroup.id}`
		}));

		this.navigationService.addDynamicItems('operatingGroups', dynamicOpGroups);

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
