import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDivider } from "@angular/material/divider";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { LoaderComponent } from '../../../../../Components/Shared/app-loader/app-loader.component';
import { InventoryItemTable, InventoryTableComponent } from '../../../../../Components/System/Area_Manager/Inventory/inventory-table/inventory-table.component';
import { ImportExcelComponent } from '../../../../../Components/System/Area_Manager/Modals/import-excel/import-excel.component';
import { ItemDetailsModalComponent } from "../../../../../Components/System/Area_Manager/Modals/item-details/item-details.component";
import { ItemMod } from '../../../../../Core/Models/System/ItemMod.model';
import { CategoryInventoryBasePipe } from "../../../../../Core/Pipes/category-inventory-base.pipe";
import { StateInventoryBasePipe } from "../../../../../Core/Pipes/state-inventory-base.pipe";
import { BulkImportManagerService } from '../../../../../Core/Service/System/Others/InventoryBase/bulk-import-manager.service';
import { InventoryFilterService } from '../../../../../Core/Service/System/Others/InventoryBase/inventory-filter.service';
import { InventoryManagerService } from '../../../../../Core/Service/System/Others/InventoryBase/inventory-manager.service';
import { ItemService } from '../../../../../Core/Service/System/item.service';
import { ExportBridgeService } from '../../../../../Core/Service/System/Others/InventoryBase/Export/export-bridge.service';
import { Router } from '@angular/router';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-inventory-base',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		MatMenuModule,
		MatButtonModule,
		MatChipsModule,
		MatFormFieldModule,
		MatInputModule,
		MatPaginatorModule,
		MatDivider,
		LoaderComponent,
		ImportExcelComponent,
		InventoryTableComponent,
		StateInventoryBasePipe,
		CategoryInventoryBasePipe,
		ItemDetailsModalComponent
	],
	templateUrl: './inventory-base.component.html',
	styleUrls: ['../../../../../Components/Shared/Styles/area-manager-import-data-shared.css', './inventory-base.component.css']
})
export class InventoryBaseComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	readonly inventoryManager = inject(InventoryManagerService);
	readonly filterService = inject(InventoryFilterService);
	private readonly importManager = inject(BulkImportManagerService);
	private readonly itemService = inject(ItemService);
	private readonly exportBridge = inject(ExportBridgeService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router)

	// Signals locales del componente
	readonly showImportModal = signal(false);
	readonly showDetailsModal = signal(false);
	readonly selectedItem = signal<ItemMod | null>(null);
	readonly loadingDetails = signal(false);

	// Computed para filtrado, paginación y categorías
	readonly paginatedItems = computed(() =>
		this.filterService.getFilteredAndPaginatedItems(this.inventoryManager.allItems())
	);
	readonly totalItems = computed(() =>
		this.filterService.getFilteredItemsCount(this.inventoryManager.allItems())
	);
	readonly categories = computed(() =>
		this.filterService.getAvailableCategories(this.inventoryManager.allItems())
	);
	readonly statuses = computed(() =>
		this.filterService.getAvailableStatuses(this.inventoryManager.allItems())
	);

	async ngOnInit(): Promise<void> {
		await this.inventoryManager.initializeInventory();
	}

	// Métodos de filtrado (delegados al servicio)
	filterByCategory(category: string): void {
		this.filterService.filterByCategory(category);
	}

	filterByStatus(status: string): void {
		this.filterService.filterByStatus(status);
	}

	clearFilters(): void {
		this.filterService.clearFilters();
	}

	onSearchChange(): void {
		this.filterService.onSearchChange();
	}

	// Paginación (delegada al servicio)
	onPageChange(event: PageEvent): void {
		this.filterService.onPageChange(event);
	}

	getDisplayedRange(): string {
		return this.filterService.getDisplayedRange(this.totalItems());
	}

	// Gestión de modales
	openImportModal(): void {
		this.showImportModal.set(true);
	}

	closeImportModal(): void {
		this.showImportModal.set(false);
	}

	// Procesamiento de archivos (delegado al servicio)
	async processExcelImport(file: File): Promise<void> {
		this.closeImportModal();

		const success = await this.importManager.processExcelImport(
			file,
			this.inventoryManager.zoneId()
		);

		// Si fue exitoso, recargar inventario
		if (success) {
			await this.inventoryManager.reloadInventory();
		}
	}

	// Funciones utilitarias
	downloadTemplate(): void {
		this.alertService.toast('Descargando plantilla...', 'info');

		setTimeout(() => {
			const link = document.createElement('a');
			link.href = '/Templates/Plantilla_Inventario_Base.xlsx';
			link.download = 'Plantilla_Inventario_Base.xlsx';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			this.alertService.toast('Plantilla descargada correctamente', 'success');
		}, 1000);
	}

	navigateToCreateItem(): void {
		this.router.navigate(['/areaManager/inventory-create-item']);
	}

	navigateToEditItem(itemId: number): void {
		this.router.navigate(['/areaManager/inventory-update-item', itemId]);
	}

	// Acciones de la tabla
	onEditItem(item: InventoryItemTable): void {
		this.navigateToEditItem(Number(item.id));
	}

	onDeleteItem(item: InventoryItemTable): void {
		const itemIdAsNumber = parseInt(item.id, 10);

		this.alertService.confirmDestroyWithLoading(
			async () => {
				const result = await this.itemService.delete(itemIdAsNumber, 0).toPromise();
				this.inventoryManager.initializeInventory();
				return result;
			},
			{
				destroyTitle: '¿Eliminar item?',
				destroyText: `Se eliminará permanentemente: ${item.name}`,
				destroyConfirmText: 'Sí, eliminar',
				loadingTitle: 'Eliminando...',
				loadingText: 'Eliminando item del inventario',
				successTitle: 'Item eliminado',
				successText: 'El item ha sido eliminado correctamente'
			}
		).catch(() => {
			// Error ya manejado por confirmDestroyWithLoading
		});
	}

	onViewDetails(item: InventoryItemTable): void {
		this.loadingDetails.set(true);

		this.alertService.withLoading(
			async () => {
				return await this.itemService.getById(Number(item.id)).toPromise();
			},
			{
				loadingTitle: 'Cargando detalles...',
				loadingText: 'Obteniendo información del item',
				showSuccessAlert: false, // No mostrar alerta de éxito
				errorTitle: 'Error',
				errorText: 'Error al cargar detalles del item'
			}
		).then((itemDetails: ItemMod | undefined) => {
			if (itemDetails) {
				this.selectedItem.set(itemDetails);
				this.showDetailsModal.set(true);
			}
			this.loadingDetails.set(false);
		}).catch(error => {
			console.error('Error al cargar detalles del item:', error);
			this.loadingDetails.set(false);
		});
	}

	closeDetailsModal(): void {
		this.showDetailsModal.set(false);
		this.selectedItem.set(null);
	}

	exportToExcel(): void {
		this.alertService.withLoading(
			async () => {
				return await this.exportBridge.exportInventoryForPrint();
			},
			{
				loadingTitle: 'Exportando...',
				loadingText: 'Generando documento Excel',
				successTitle: 'Exportación completa',
				successText: 'Documento de impresión generado correctamente',
				errorTitle: 'Error de exportación',
				errorText: 'Error al generar el documento'
			}
		).then(() => {
			// Éxito ya manejado por withLoading
		}).catch(error => {
			console.error('Error en exportación:', error);
			// Error ya manejado por withLoading
		});
	}
}
