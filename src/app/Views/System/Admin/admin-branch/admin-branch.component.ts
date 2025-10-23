import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ZoneFilterPipe } from '../../../../Core/Pipes/zone-filter.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { BranchDetailsMod, BranchInChargeMod } from '../../../../Core/Models/System/BranchMod.model';
import { BranchService } from '../../../../Core/Service/System/branch.service';
import { delay, forkJoin } from 'rxjs';
import { LoaderComponent } from "../../../../Components/Shared/app-loader/app-loader.component";

@Component({
	selector: 'app-admin-branch',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		MatCardModule,
		MatButtonModule,
		FormsModule,
		MatInputModule,
		ZoneFilterPipe,
		MatProgressSpinnerModule,
		LoaderComponent
	],
	templateUrl: './admin-branch.component.html',
	styleUrls: ['../../../../Components/Shared/Styles/edification-view-shared.css', './admin-branch.component.css']
})
export class AdminBranchComponent implements OnInit {

// Inyección de servicios propios del proyecto
	private readonly branchService = inject(BranchService);

	// Inyección de servicios nativos de Angular
	private readonly route = inject(ActivatedRoute);

	branchId: number = 0;
	sucursal: BranchDetailsMod | null = null;
	subAdministrador: BranchInChargeMod | null = null;

	loading = true;
	error = false;
	errorMessage = '';

	searchText: string = '';

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.branchId = Number(params.get('id'));
			this.cargarDatos();
		});
	}

	cargarDatos(): void {
		this.loading = true;
		this.error = false;
		this.errorMessage = '';

		forkJoin({
			sucursal: this.branchService.getByDetails(this.branchId).pipe(delay(1500)),
			encargado: this.branchService.getInCharge(this.branchId).pipe(delay(1500))
		}).subscribe({
			next: (res) => {
				this.sucursal = res.sucursal;
				this.subAdministrador = res.encargado;
				this.loading = false;
			},
			error: (err) => {
				console.error('Error al cargar datos de sucursal:', err);
				this.error = true;
				this.errorMessage = 'No se pudo cargar la información de la sucursal.';
				this.loading = false;
			}
		});
	}


	// Getter para verificar si hay zonas
	get hasZones(): boolean {
		return (this.sucursal?.zones?.length ?? 0) > 0;
	}

	get totalItems(): number {
		if (!this.sucursal?.zones) return 0;
		return this.sucursal.zones.reduce((sum, zone) => sum + zone.itemsCount, 0);
	}


	onDeleteSucursal() {
		console.log('Eliminar/Deshabilitar sucursal:', this.sucursal?.id);
		console.log(this.branchId);
		// Lógica para eliminar/deshabilitar
	}
}
