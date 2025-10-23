// ===== SERVICIO DE NAVEGACIÓN DEL ADMIN =====
// Gestiona el menú lateral y el estado de la navegación dentro del panel de administración.
// Incluye la configuración de items estáticos y dinámicos (ej. sucursales),
// el control de secciones activas/expandidas, la escucha de cambios de ruta
// y la emisión de eventos para refrescar o cerrar el sidebar.

import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface NavigationItem {
	id: string;
	label: string;
	icon: string;
	route?: string;
	children?: NavigationItem[];
	expandable?: boolean;
	external?: boolean;
}

export interface NavigationState {
	currentRoute: string;
	expandedSections: { [key: string]: boolean };
	activeSection?: string;
}

@Injectable({
	providedIn: 'root'
})
export class AdminNavService {

	// === EVENTOS COMPARTIDOS ===
	// Subject para notificar el cierre del sidebar
	private closeSidebarSubject = new Subject<void>();
	public closeSidebar$ = this.closeSidebarSubject.asObservable();

	// Subject para forzar la recarga de sucursales
	private refreshBranchesSubject = new Subject<void>();
	public refreshBranches$ = this.refreshBranchesSubject.asObservable();



	// === CONFIGURACIÓN DE MENÚS ===
	// Menú principal cuando el usuario tiene empresa
	private readonly navigationConfig: NavigationItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: 'dashboard',
			route: '/admin/dashboard',
			expandable: false
		},
		{
			id: 'sucursales',
			label: 'Sucursales',
			icon: 'location_city',
			expandable: true,
			children: [
				{
					id: 'sucursales-nueva',
					label: 'Nueva Sucursal',
					icon: 'add',
					route: '/admin/register-branch'
				}
				// Las sucursales dinámicas se agregarán aquí
			]
		},
		{
			id: 'subAdmin',
			label: 'Encargados de Sucursal',
			icon: 'supervisor_account',
			route: '/admin/subadmins-list',
			expandable: false,
		}
	];

	// Menú reducido cuando no hay empresa registrada
	private readonly noCompanyNavigationConfig: NavigationItem[] = [
		{
			id: 'register-company',
			label: 'Registrar Empresa',
			icon: 'business',
			route: '/admin/register-company',
			expandable: false
		}
	];

	// Estado actual de navegación (ruta, secciones activas/expandidas)
	private navigationState = new BehaviorSubject<NavigationState>({
		currentRoute: '',
		expandedSections: {},
		activeSection: undefined
	});
	public navigationState$ = this.navigationState.asObservable();



	constructor(private router: Router) {
		this.initializeNavigation();
	}



	// === INICIALIZACIÓN ===
	// Escucha cambios de ruta y actualiza el estado de navegación
	private initializeNavigation(): void {
		// Escuchar cambios de ruta
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe((event: NavigationEnd) => {
				this.updateNavigationState(event.urlAfterRedirects || event.url);
				this.closeSidebarSubject.next();
			});

		// Estado inicial
		const currentRoute = this.router.url === '/admin' ? '/admin/dashboard' : this.router.url;
		this.updateNavigationState(currentRoute);
	}



	// === CONFIGURACIÓN DE NAVEGACIÓN ===
	// Obtiene el menú según si el usuario tiene empresa o no
	getNavigationConfig(hasCompany: boolean = true): NavigationItem[] {
		if (!hasCompany) {
			return [...this.noCompanyNavigationConfig];
		}
		return [...this.navigationConfig];
	}


	// === ACTUALIZACIÓN DE ESTADO ===
	// Actualiza el estado de navegación (ruta, sección activa, secciones expandidas)
	private updateNavigationState(route: string): void {
		const currentState = this.navigationState.value;
		const activeSection = this.findActiveSectionByRoute(route);
		const expandedSections = this.calculateExpandedSections(route, currentState.expandedSections);

		this.navigationState.next({
			currentRoute: route,
			expandedSections,
			activeSection
		});
	}



	// === UTILIDADES PRIVADAS ===
	// Determina qué sección está activa según la ruta actual
	private findActiveSectionByRoute(route: string): string | undefined {
		for (const item of this.navigationConfig) {
			// Si es una sección expandible, verificar sus hijos
			if (item.expandable && item.children) {
				for (const child of item.children) {
					if (child.route && this.isRouteMatch(route, child.route)) {
						return item.id;
					}
				}
			}
			// Si es una sección simple
			else if (item.route && this.isRouteMatch(route, item.route)) {
				return item.id;
			}
		}
		return undefined;
	}

	// Verifica si la ruta actual coincide con una ruta objetivo
	private isRouteMatch(currentRoute: string, targetRoute: string): boolean {
		// Normalizar rutas
		const current = currentRoute.endsWith('/') ? currentRoute.slice(0, -1) : currentRoute;
		const target = targetRoute.endsWith('/') ? targetRoute.slice(0, -1) : targetRoute;

		return current === target || current.startsWith(target + '/');
	}

	// Calcula qué secciones deben estar expandidas automáticamente
	private calculateExpandedSections(route: string, currentExpanded: { [key: string]: boolean }): { [key: string]: boolean } {
		const newExpanded = { ...currentExpanded };
		const activeSection = this.findActiveSectionByRoute(route);

		// Auto-expandir la sección activa si es expandible
		if (activeSection) {
			const section = this.findSectionById(activeSection);
			if (section?.expandable) {
				newExpanded[activeSection] = true;
			}
		}

		return newExpanded;
	}

	// Busca una sección por su id dentro del menú
	private findSectionById(id: string): NavigationItem | undefined {
		return this.navigationConfig.find(item => item.id === id);
	}



	// === MÉTODOS PÚBLICOS PARA EL SIDEBAR ===
	// Obtiene el estado actual de la navegación
	getCurrentState(): NavigationState {
		return this.navigationState.value;
	}

	// Alterna entre expandir/colapsar una sección del menú
	toggleSection(sectionId: string): void {
		const currentState = this.navigationState.value;
		const newExpanded = {
			...currentState.expandedSections,
			[sectionId]: !currentState.expandedSections[sectionId]
		};

		this.navigationState.next({
			...currentState,
			expandedSections: newExpanded
		});
	}

	// Marca si la ruta indicada está activa.
	isRouteActive(route: string): boolean {
		const currentRoute = this.navigationState.value.currentRoute;

		// Casos especiales para admin base y dashboard
		if (route === '/admin' && currentRoute === '/admin/dashboard') return true;
		if (route === '/admin/dashboard' && (currentRoute === '/admin/dashboard' || currentRoute === '/admin')) return true;

		return this.isRouteMatch(currentRoute, route);
	}

	// Comprueba qué sección está activa.
	isSectionActive(sectionId: string): boolean {
		return this.navigationState.value.activeSection === sectionId;
	}

	// Indica si una sección está expandida.
	isSectionExpanded(sectionId: string): boolean {
		return !!this.navigationState.value.expandedSections[sectionId];
	}

	// Redirige a una ruta, normalizando rutas base (ej: dashboard).
	navigateTo(route: string): void {
		const targetRoute = route === '/admin' ? '/admin/dashboard' : route;
		this.router.navigate([targetRoute]);
	}



	// === MANEJO DE ÍTEMS DINÁMICOS ===
	// Agrega ítems dinámicos (ej: sucursales cargadas desde backend) a una sección
	addDynamicItems(parentSectionId: string, items: NavigationItem[]): void {
		const parentIndex = this.navigationConfig.findIndex(item => item.id === parentSectionId);
		if (parentIndex !== -1 && this.navigationConfig[parentIndex].children) {
			// Filtrar elementos estáticos existentes y agregar los dinámicos
			const staticItems = this.navigationConfig[parentIndex].children!.filter(child =>
				!child.id.includes('dynamic-')
			);
			this.navigationConfig[parentIndex].children = [...staticItems, ...items];
		}
	}

	// Emite evento para refrescar la lista de sucursales
	triggerRefreshBranches(): void {
		this.refreshBranchesSubject.next();
	}

	// Elimina ítems dinámicos de una sección.
	clearDynamicItems(parentSectionId: string): void {
		const parentIndex = this.navigationConfig.findIndex(item => item.id === parentSectionId);
		if (parentIndex !== -1 && this.navigationConfig[parentIndex].children) {
			this.navigationConfig[parentIndex].children = this.navigationConfig[parentIndex].children!.filter(child =>
				!child.id.includes('dynamic-')
			);
		}
	}
}
