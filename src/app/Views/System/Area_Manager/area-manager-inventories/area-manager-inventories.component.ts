import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { InventoryDetailComponent } from "../../../../Components/System/Area_Manager/Modals/inventory-detail/inventory-detail.component";
import { VerificationDetailComponent } from "../../../../Components/System/Area_Manager/Modals/verification-detail/verification-detail.component";
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { InventoryListItem, InventorySummaryResponse } from '../../../../Core/Models/System/Others/AreaManagerInventories/inventoryList.model';
import { InventoryDetailResponse } from '../../../../Core/Models/System/Others/AreaManagerInventories/inventoryDetail.model';
import { VerificationDetailResponse } from '../../../../Core/Models/System/Others/AreaManagerInventories/verificationDetail.model';
import { InventoryService } from '../../../../Core/Service/System/inventory.service';
import { VerificationService } from '../../../../Core/Service/System/verification.service';
import { ZoneService } from '../../../../Core/Service/System/zone.service';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { LoaderComponent } from '../../../../Components/Shared/app-loader/app-loader.component';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';


@Component({
	selector: 'app-area-manager-inventories',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatTableModule,
		MatIconModule,
		MatButtonModule,
		MatCardModule,
		MatProgressSpinnerModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule,
		InventoryDetailComponent,
		VerificationDetailComponent,
		MatPaginatorModule,
		LoaderComponent
	],
	templateUrl: './area-manager-inventories.component.html',
	styleUrls: ['./area-manager-inventories.component.css']
})
export class AreaManagerInventoriesComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly zoneService = inject(ZoneService);
	private readonly inventoryService = inject(InventoryService);
	private readonly verificationService = inject(VerificationService)
	private readonly alertService = inject(AlertTotalService);

	zoneId!: number;
	loading = true;
	error = false;
	errorMessage = '';

	// Signals para datos, filtros y modales del inventario
	readonly inventorySummary = signal<InventorySummaryResponse | null>(null);
	readonly inventoryDetail = signal<InventoryDetailResponse | null>(null);
	readonly loadingInventoryDetail = signal(false);
	readonly verificationDetail = signal<VerificationDetailResponse | null>(null);
	readonly loadingVerificationDetail = signal(false);

	// Signals para filtros de búsqueda
	readonly searchTerm = signal<string>('');
	readonly selectedStatus = signal<string[]>([]);
	readonly startDate = signal<Date | null>(null);
	readonly endDate = signal<Date | null>(null);

	// Signals para estado de modales y selección
	readonly isInventoryDetailModalOpen = signal(false);
	readonly selectedInventoryId = signal<number | null>(null);
	readonly isVerificationModalOpen = signal(false);
	readonly selectedVerificationInventoryId = signal<number | null>(null);

	// Signals para la configuración de paginación
	readonly pageIndex = signal(0);
	readonly pageSize = signal(10);
	readonly pageSizeOptions = [5, 10, 25, 50];

	// Computed para obtener información resumida del inventario
	readonly inventories = computed(() => this.inventorySummary()?.inventories || []);
	readonly totalInventories = computed(() => this.inventorySummary()?.totalInventories || 0);
	readonly lastInventory = computed(() => this.inventorySummary()?.lastInventory || null);

	// ===== CONFIGURACIÓN DE TABLA =====
	readonly displayedColumns: string[] = [
		'date',
		'operatingGroup',
		'itemsCount',
		'verificationStatus',
		'actions'
	];

	// Inventarios filtrados
	readonly filteredInventories = computed(() => {
		let filtered = this.inventories();

		if (this.searchTerm()) {
			const term = this.searchTerm().toLowerCase();
			filtered = filtered.filter(inventory =>
				inventory.operatingGroup.name.toLowerCase().includes(term)
			);
		}

		if (this.selectedStatus().length > 0 && !this.selectedStatus().includes('all')) {
			filtered = filtered.filter(inventory => {
				const status = inventory.verificationResult;
				// Convertimos selectedStatus a boolean
				const selectedBooleans = this.selectedStatus().map(s => s === 'Aprobado');
				return selectedBooleans.includes(status);
			});
		}


		if (this.startDate()) {
			filtered = filtered.filter(inventory => {
				const inventoryDate = new Date(inventory.date);
				return inventoryDate >= this.startDate()!;
			});
		}

		if (this.endDate()) {
			filtered = filtered.filter(inventory => {
				const inventoryDate = new Date(inventory.date);
				const endOfDay = new Date(this.endDate()!);
				endOfDay.setHours(23, 59, 59, 999);
				return inventoryDate <= endOfDay;
			});
		}

		return filtered;
	});

	readonly paginatedInventories = computed(() => {
		const start = this.pageIndex() * this.pageSize();
		return this.filteredInventories().slice(start, start + this.pageSize());
	});

	ngOnInit(): void {
		this.loadZoneAndInventories();
	}

	// ===== MÉTODOS PARA CARGAR DATOS =====

	private loadZoneAndInventories(): void {
		this.loading = true;
		this.error = false;
		this.errorMessage = '';


		// 1. Obtener el ID del usuario logueado
		const userId = this.authService.getIdUser();

		if (!userId) {
			console.error('No se pudo obtener el ID del usuario');
			this.loading = false;
			return;
		}

		// 2. Obtener la zona del Area Manager
		this.zoneService.getByIdAreaManager(parseInt(userId)).subscribe({
			next: (zone) => {
				this.zoneId = zone.id;
				// 3. Cargar los inventarios de la zona
				this.loadInventorySummary();
			},
			error: (error) => {
				console.error('Error al cargar la zona:', error);
				this.handleError('No se pudo cargar los inventarios');
				this.loading = false;
			}
		});
	}

	// Primera consulta - Listado y resumen por zona (REAL)
	loadInventorySummary(): void {
		this.loading = true;

		this.inventoryService.getInventorySummary(this.zoneId).subscribe({
			next: (summary) => {
				this.inventorySummary.set(summary);
				this.loading = false;
			},
			error: (error) => {
				console.error('Error al cargar el resumen de inventarios:', error);
				this.loading = false;
				// TODO: Mostrar mensaje de error al usuario
			}
		});
	}

	// Segunda consulta - Detalle completo de inventario (REAL)
	loadInventoryDetail(inventoryId: number): void {
		this.loadingInventoryDetail.set(true);

		this.inventoryService.getInventoryDetail(inventoryId).subscribe({
			next: (detail) => {
				this.inventoryDetail.set(detail);
				this.loadingInventoryDetail.set(false);
			},
			error: (error) => {
				console.error('Error al cargar el detalle del inventario:', error);
				this.loadingInventoryDetail.set(false);
				// TODO: Mostrar mensaje de error al usuario
			}
		});
	}

	// Tercera consulta - Detalle de verificación (REAL)
	loadVerificationDetail(inventoryId: number): void {
		this.loadingVerificationDetail.set(true);

		this.verificationService.getVerificationDetail(inventoryId).subscribe({
			next: (verification) => {
				this.verificationDetail.set(verification);
				this.loadingVerificationDetail.set(false);
			},
			error: (error) => {
				console.error('Error al cargar el detalle de verificación:', error);
				this.loadingVerificationDetail.set(false);
				// TODO: Mostrar mensaje de error al usuario
			}
		});
	}

	// ===== MÉTODOS DE UTILIDAD =====
	getOperativesCount(operatingGroup: { operativesCount: number }): number {
		return operatingGroup.operativesCount;
	}

	getVerificationStatusLabel(inventory: InventoryListItem): string {
		return inventory.verificationResult ? 'Aprobado' : 'Rechazado';
	}


	getVerificationStatusIcon(inventory: InventoryListItem): string {
		return inventory.verificationResult ? 'check_circle' : 'cancel';
	}

	getVerificationStatusClass(inventory: InventoryListItem): string {
		return inventory.verificationResult ? 'status-approved' : 'status-rejected';
	}

	getItemsVariety(inventory: InventoryListItem): number {
		return inventory.itemsVariety;
	}

	// ===== FILTROS =====
	onSearchChange(): void {
		this.pageIndex.set(0); // Reset pagination when searching
	}

	onPageChange(event: PageEvent): void {
		this.pageIndex.set(event.pageIndex);
		this.pageSize.set(event.pageSize);
	}

	applyFilters(): void {
		const errors = this.validateFilters();

		if (errors.length > 0) {
			this.alertService.warning('Filtros inválidos', errors.join('\n'));
			return;
		}

		this.pageIndex.set(0); // Reset paginación si todo está ok
	}

	private validateFilters(): string[] {
		const errors: string[] = [];

		if (this.startDate() && this.endDate()) {
			if (this.startDate()! > this.endDate()!) {
				errors.push('La fecha inicial no puede ser mayor a la fecha final.');
			}
		}

		return errors;
	}

	onStartDateChange(): void {
		const errors = this.validateFilters();
		if (errors.length > 0) {
			this.alertService.warning('Atención', errors.join('\n'));
		}
	}

	onEndDateChange(): void {
		const errors = this.validateFilters();
		if (errors.length > 0) {
			this.alertService.warning('Atención', errors.join('\n'));
		}
	}


	getDisplayedRange(): string {
		const total = this.filteredInventories().length;
		if (total === 0) return '0 de 0';
		const start = this.pageIndex() * this.pageSize() + 1;
		const end = Math.min((this.pageIndex() + 1) * this.pageSize(), total);
		return `${start}–${end}`;
	}

	clearFilters(): void {
		this.searchTerm.set('');
		this.selectedStatus.set([]);
		this.startDate.set(null);
		this.endDate.set(null);
		this.pageIndex.set(0);
	}

	clearSearch(): void {
		this.searchTerm.set('');
		this.pageIndex.set(0);
	}

	clearStatusFilter(): void {
		this.selectedStatus.set([]);
		this.pageIndex.set(0);
	}

	clearStartDate(): void {
		this.startDate.set(null);
		this.pageIndex.set(0);
	}

	clearEndDate(): void {
		this.endDate.set(null);
		this.pageIndex.set(0);
	}

	hasActiveFilters(): boolean {
		return this.searchTerm() !== '' ||
			this.selectedStatus().length > 0 ||
			this.startDate() !== null ||
			this.endDate() !== null;
	}

	formatFilterDate(date: Date): string {
		return date.toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// ===== MÉTODOS DE FORMATO =====
	formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	formatDateShort(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	formatTime(dateString: string): string {
		return new Date(dateString).toLocaleTimeString('es-ES', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	// ===== GESTIÓN DE MODALES =====

	// Modal de Inventario
	openInventoryDetail(inventory: InventoryListItem): void {
		this.inventoryDetail.set(null);
		this.selectedInventoryId.set(inventory.id);
		this.isInventoryDetailModalOpen.set(true);
		this.loadInventoryDetail(inventory.id);
	}

	closeInventoryDetailModal(): void {
		this.isInventoryDetailModalOpen.set(false);
		this.inventoryDetail.set(null);
		this.selectedInventoryId.set(null);
	}

	// Modal de Verificación
	viewVerificationDetail(inventory: InventoryListItem): void {
		this.selectedVerificationInventoryId.set(inventory.id);
		this.loadVerificationDetail(inventory.id);
		this.isVerificationModalOpen.set(true);
	}

	closeVerificationModal(): void {
		this.isVerificationModalOpen.set(false);
		this.selectedVerificationInventoryId.set(null);
		this.verificationDetail.set(null);
	}

	// Refresh data
	refreshInventories(): void {
		this.loadZoneAndInventories();
	}

	private handleError(message: string): void {
		this.error = true;
		this.errorMessage = message;
		this.loading = false;
		console.error(message);
	}
}
