// ===== SERVICIO DE NAVEGACIÓN DEL ENCARGADO DE ZONA =====
// Gestiona el menú lateral y el estado de navegación del panel de área manager.
// Aporta junto a AdminNavService una funcionalidad común: control de sidebars,
// menús dinámicos, estados de secciones y eventos para recargar datos.
// Incluye configuración de items estáticos y dinámicos, escucha de rutas,
// activación de secciones y utilidades para expandir/cerrar el sidebar.

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
export class AreaManagerNavService {

	// === EVENTOS COMPARTIDOS ===
	// Subjects que emiten eventos globales: cerrar sidebar o refrescar grupos operativos.
	private closeSidebarSubject = new Subject<void>();
	public closeSidebar$ = this.closeSidebarSubject.asObservable();

	private refreshOperatingGroupsSubject = new Subject<void>();
	public refreshOperatingGroups$ = this.refreshOperatingGroupsSubject.asObservable();



	// === CONFIGURACIÓN DE NAVEGACIÓN ===
	// Menú estático inicial: dashboard, inventario, operativos, grupos operativos y reportes.
	// Se pueden añadir ítems dinámicos (ej: grupos de operativos) en tiempo de ejecución.
	private readonly navigationConfig: NavigationItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: 'dashboard',
			route: '/areaManager/dashboard',
			expandable: false
		},
		{
			id: 'inventory',
			label: 'Inventario',
			icon: 'warehouse',
			expandable: true,
			children: [
				{
					id: 'inventoryBase',
					label: 'Inventario Base',
					icon: 'inventory_2',
					route: '/areaManager/inventory-base'
				},
				{
					id: 'requestsInventary',
					label: 'RQS Inventario',
					icon: 'assignment_late',
					route: '/areaManager/inventory-requests'
				},
				{
					id: 'Reports',
					label: 'Reportes',
					icon: 'bar_chart',
					route: '/areaManager/reports'
				}
			]
		},
		{
			id: 'operating',
			label: 'Operativos',
			icon: 'engineering',
			route: '/areaManager/operatives',
			expandable: false,
		},
		{
			id: 'operatingGroups',
			label: 'Grupos Operativos',
			icon: 'group_work',
			expandable: true,
			children: [
				{
					id: 'newGroup',
					label: 'Nueva Grupo',
					icon: 'add',
					route: '/areaManager/create-operative-group'
				}
				// Los elementos dinámicas se agregarán aquí
			]
		},
		{
			id: 'fullInventories',
			label: 'Inventarios Realizados',
			icon: 'assignment_turned_in',
			route: '/areaManager/inventories',
			expandable: false,
		},
	];



	// === ESTADO DE NAVEGACIÓN ===
	// Mantiene la ruta actual, secciones expandidas y activa.
	// Se expone como observable para que el sidebar se reactive automáticamente.
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
	// Se engancha al Router para escuchar cambios de ruta y actualizar el estado.
	// También cierra automáticamente el sidebar al cambiar de sección.
	private initializeNavigation(): void {
		// Escuchar cambios de ruta
		this.router.events
			.pipe(filter(event => event instanceof NavigationEnd))
			.subscribe((event: NavigationEnd) => {
				this.updateNavigationState(event.urlAfterRedirects || event.url);
				this.closeSidebarSubject.next();
			});

		// Estado inicial
		const currentRoute = this.router.url === '/areaManager' ? '/areaManager/dashboard' : this.router.url;
		this.updateNavigationState(currentRoute);
	}



	// === CONFIGURACIÓN DEL MENÚ ===
	// Devuelve una copia de la configuración de navegación.
	getNavigationConfig(): NavigationItem[] {
		return [...this.navigationConfig];
	}



	// === ACTUALIZACIÓN DE ESTADO ===
	// Determina la sección activa y cuáles deben expandirse según la ruta actual.
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
	// Identifica qué sección corresponde a una ruta.
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

	// Verifica si la ruta actual coincide con una ruta objetivo.
	private isRouteMatch(currentRoute: string, targetRoute: string): boolean {
		// Normalizar rutas
		const current = currentRoute.endsWith('/') ? currentRoute.slice(0, -1) : currentRoute;
		const target = targetRoute.endsWith('/') ? targetRoute.slice(0, -1) : targetRoute;

		return current === target || current.startsWith(target + '/');
	}

	// Calcula qué secciones deben estar expandidas automáticamente.
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

	// Busca una sección por su id dentro del menú.
	private findSectionById(id: string): NavigationItem | undefined {
		return this.navigationConfig.find(item => item.id === id);
	}



	// === MÉTODOS PÚBLICOS PARA EL SIDEBAR ===
	// Obtiene el estado actual de la navegación.
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

		// Casos especiales para areaManager base y dashboard
		if (route === '/areaManager' && currentRoute === '/areaManager/dashboard') return true;
		if (route === '/areaManager/dashboard' && (currentRoute === '/areaManager/dashboard' || currentRoute === '/areaManager')) return true;

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
		const targetRoute = route === '/areaManager' ? '/areaManager/dashboard' : route;
		this.router.navigate([targetRoute]);
	}



	// === ÍTEMS DINÁMICOS ===
	// Inserta elementos dinámicos en una sección (ej. grupos operativos).
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

	// Emite evento para refrescar la lista de grupos operativos
	triggerRefreshOperatingGroups(): void {
		this.refreshOperatingGroupsSubject.next();
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
