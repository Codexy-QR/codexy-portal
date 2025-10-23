import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { LoaderComponent } from '../../../../Components/Shared/app-loader/app-loader.component';
import { CategoryItemChartComponent } from '../../../../Components/System/Subadmin/Analytics/category-item-chart/category-item-chart.component';
import { InventoryFilterPipe } from '../../../../Core/Pipes/inventory-filter.pipe';
import { FormsModule } from '@angular/forms';
import { ZoneDetailsMod } from '../../../../Core/Models/System/ZoneMod.model';
import { ZoneService } from '../../../../Core/Service/System/zone.service';
import { delay, pipe } from 'rxjs';

@Component({
	selector: 'app-subadmin-zone',
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		MatIconModule,
		MatCardModule,
		MatButtonModule,
		LoaderComponent,
		CategoryItemChartComponent,
		InventoryFilterPipe
	],
	templateUrl: './subadmin-zone.component.html',
	styleUrls: ['../../../../Components/Shared/Styles/edification-view-shared.css', './subadmin-zone.component.css']
})
export class SubadminZoneComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly zoneService = inject(ZoneService);

	loading = true;
	error = false;
	errorMessage = '';
	zoneId: number = 0;

	// Variables para búsqueda y filtros (solo para la sección de inventario)
	searchText: string = '';
	categoryFilter: string = 'all';
	stateFilter: string = 'all';

	zone!: ZoneDetailsMod;

	// ✅ Datos del gráfico y KPIs - siempre muestran todos los datos de la zona
	itemsByCategory: { [key: string]: number } = {};
	itemsByState: { [key: string]: number } = {};

	// Obtener categorías únicas para el filtro
	get categories(): string[] {
		if (!this.zone?.items) return [];
		const uniqueCategories = [...new Set(this.zone.items.map(item => item.category))];
		return uniqueCategories.filter(category => category);
	}

	// Obtener estados únicos para el filtro
	get states(): string[] {
		if (!this.zone?.items) return [];
		const uniqueStates = [...new Set(this.zone.items.map(item => item.state))];
		return uniqueStates.filter(state => state);
	}

	constructor(private route: ActivatedRoute) { }

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.zoneId = Number(params.get('id'));
			this.loadZoneData();
		});
	}

	loadZoneData(): void {
		this.loading = true;
		this.error = false;
		this.errorMessage = '';

		this.zoneService.getZoneDetailsById(this.zoneId).pipe(
			delay(1500)
		).subscribe({
			next: (data) => {
				this.zone = data;
				this.loading = false;
				this.calculateSummaryData(); // KPIs y gráfico
			},
			error: (err) => {
				console.error('Error cargando zona:', err);
				this.error = true;
				this.errorMessage = 'No se pudo cargar la información de la zona.';
				this.loading = false;
			}
		});
	}


	// ✅ Método para calcular datos del resumen (KPIs y gráfico) - SIN filtros
	private calculateSummaryData(): void {
		if (!this.zone?.items) {
			this.itemsByCategory = {};
			this.itemsByState = {};
			return;
		}

		// Calcular itemsByCategory - TODOS los items de la zona
		this.itemsByCategory = this.zone.items.reduce((acc: { [key: string]: number }, item) => {
			if (item.category) {
				acc[item.category] = (acc[item.category] || 0) + 1;
			}
			return acc;
		}, {});

		// Calcular itemsByState - TODOS los items de la zona
		this.itemsByState = this.zone.items.reduce((acc: { [key: string]: number }, item) => {
			if (item.state) {
				acc[item.state] = (acc[item.state] || 0) + 1;
			}
			return acc;
		}, {});
	}

	// ✅ Limpiar filtros
	clearFilters(): void {
		this.searchText = '';
		this.categoryFilter = 'all';
		this.stateFilter = 'all';
	}

	getStateIcon(state: string): string {
		switch (state) {
			case 'Disponible': return 'check_circle';
			case 'En Inventario': return 'inventory';
			case 'En Verificación': return 'verified';
			default: return 'help';
		}
	}

	getStateClass(state: string): string {
		switch (state) {
			case 'Disponible': return 'state-available';
			case 'En Inventario': return 'state-inventory';
			case 'En Verificación': return 'state-verification';
			default: return 'state-unknown';
		}
	}

	getItemStateIcon(state: string): string {
		switch (state) {
			case 'En orden': return 'check_circle';
			case 'Reparación': return 'build';
			case 'Dañado': return 'warning';
			case 'Perdido': return 'search_off';
			default: return 'help';
		}
	}

	getItemStateClass(state: string): string {
		switch (state) {
			case 'En orden': return 'item-state-good';
			case 'Reparación': return 'item-state-repair';
			case 'Dañado': return 'item-state-damaged';
			case 'Perdido': return 'item-state-lost';
			default: return 'item-state-unknown';
		}
	}
}
