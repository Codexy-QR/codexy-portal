import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, finalize, of } from 'rxjs';
import { InventoryItemTable } from '../../../../../Components/System/Area_Manager/Inventory/inventory-table/inventory-table.component';
import { ZoneMod } from '../../../../../Core/Models/System/ZoneMod.model';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { ZoneService } from '../../../../../Core/Service/System/zone.service';
import { ItemInventoryBaseSimpleMod } from '../../../../Models/System/ItemMod.model';

// ===== SERVICIO DE GESTIÓN CENTRAL DEL INVENTARIO BASE =====
// Este servicio controla el ciclo completo de obtención, almacenamiento, mapeo
// y gestión de los datos de inventario base desde la API. Representa la "fuente
// de verdad" del estado actual del inventario dentro del frontend.
//
// Principales responsabilidades:
// ✅ Cargar datos de la zona asociada al usuario autenticado.
// ✅ Obtener y mapear el inventario base desde la API al formato de tabla.
// ✅ Manejar estados reactivos (loading, error, datos disponibles).
// ✅ Recargar datos después de operaciones como importaciones masivas.
// ✅ Centralizar el manejo de errores y reiniciar el estado del servicio.
@Injectable({
	providedIn: 'root'
})
export class InventoryManagerService {

	// Inyección de servicios propios del proyecto
	private readonly zoneService = inject(ZoneService);
	private readonly authService = inject(AuthService);

	// Signals para el estado del inventario
	readonly loading = signal(true);
	readonly error = signal(false);
	readonly errorMessage = signal('');
	readonly currentZone = signal<ZoneMod | null>(null);
	readonly allItems = signal<InventoryItemTable[]>([]);

	// Computed derivados del estado actual del inventario
	readonly zoneId = computed(() => this.currentZone()?.id || 0);
	readonly zoneName = computed(() => this.currentZone()?.name || 'Zona');
	readonly hasInventoryData = computed(() => this.allItems().length > 0);

	/**
	 * Inicializa la carga de datos de zona e inventario
	 */
	async initializeInventory(): Promise<void> {
		await this.loadZoneData();
	}

	/**
	 * Carga la información de la zona del usuario
	 */
	private async loadZoneData(): Promise<void> {
		this.loading.set(true);
		this.error.set(false);

		try {
			const userId = this.authService.getIdUser();

			return new Promise((resolve, reject) => {
				this.zoneService.getByIdAreaManager(Number(userId)).subscribe({
					next: (zone: ZoneMod) => {
						this.currentZone.set(zone);
						this.loadInventoryData().then(resolve).catch(reject);
					},
					error: (error) => {
						this.handleError('Error al cargar información de la zona');
						console.error('Error loading zone:', error);
						reject(error);
					}
				});
			});

		} catch (error) {
			this.handleError('Error al obtener datos del usuario');
			throw error;
		}
	}

	/**
	 * Carga los datos del inventario
	 */
	async loadInventoryData(): Promise<void> {
		const zoneId = this.zoneId();

		if (zoneId === 0) {
			this.handleError('ID de zona no válido');
			return;
		}

		this.loading.set(true);
		this.error.set(false);

		return new Promise((resolve, reject) => {
			this.zoneService.getInventoryBase(zoneId)
				.pipe(
					catchError(error => {
						this.handleError('Error al cargar el inventario base');
						console.error('Error loading inventory:', error);
						return of([]);
					}),
					finalize(() => this.loading.set(false))
				)
				.subscribe({
					next: (items: ItemInventoryBaseSimpleMod[]) => {
						const mappedItems: InventoryItemTable[] = this.mapApiItemsToTableItems(items);
						this.allItems.set(mappedItems);
						resolve();
					},
					error: (error) => {
						reject(error);
					}
				});
		});
	}

	/**
	 * Mapea items de la API al formato de tabla
	 */
	private mapApiItemsToTableItems(items: ItemInventoryBaseSimpleMod[]): InventoryItemTable[] {
		return items.map(item => ({
			id: item.id.toString(),
			code: item.code,
			name: item.name,
			description: item.description,
			category: item.categoryName,
			state: item.stateName
		}));
	}

	/**
	 * Recarga el inventario (útil después de importaciones)
	 */
	async reloadInventory(): Promise<void> {
		await this.loadInventoryData();
	}

	/**
	 * Maneja errores del servicio
	 */
	private handleError(message: string): void {
		this.error.set(true);
		this.errorMessage.set(message);
		this.loading.set(false);
		console.error(message);
	}

	/**
	 * Limpia el estado del servicio
	 */
	reset(): void {
		this.loading.set(true);
		this.error.set(false);
		this.errorMessage.set('');
		this.currentZone.set(null);
		this.allItems.set([]);
	}
}
