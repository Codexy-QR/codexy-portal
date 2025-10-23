import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { ActivatedRoute, Router } from '@angular/router';
import { LoaderComponent } from '../../../../Components/Shared/app-loader/app-loader.component';
import { AddOperativeComponent } from '../../../../Components/System/Area_Manager/Modals/add-operative/add-operative.component';
import { EditGroupComponent } from '../../../../Components/System/Area_Manager/Modals/edit-group/edit-group.component';
import { InventoryHistoryMod } from '../../../../Core/Models/System/InventoryMod.model';
import { OpGroupMod } from '../../../../Core/Models/System/OpGroupMod';
import { OperativeAssignmentMod } from '../../../../Core/Models/System/OperativeMod';
import { BogotaDatePipe } from '../../../../Core/Pipes/bogota-date.pipe';
import { AreaManagerNavService } from '../../../../Core/Service/Navigation/areaManager-nav.service';
import { InventoryService } from '../../../../Core/Service/System/inventory.service';
import { OpGroupService } from '../../../../Core/Service/System/opGroup.service';
import { OperativeService } from '../../../../Core/Service/System/operative.service';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';
import { calcProgress, calcStatus } from '../../../../Core/Utils/date.utils';

@Component({
	selector: 'app-operative-group-details',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		MatButtonModule,
		MatProgressSpinnerModule,
		BogotaDatePipe,
		EditGroupComponent,
		AddOperativeComponent,
		LoaderComponent
	],
	templateUrl: './area-manager-op-group.component.html',
	styleUrls: ['./area-manager-op-group.component.css']
})
export class AreaManagerOpGroupComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly opGroupService = inject(OpGroupService);
	private readonly operativeService = inject(OperativeService);
	private readonly inventoryService = inject(InventoryService);
	private readonly navService = inject(AreaManagerNavService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);

	// Signals para datos operativos y estados de modales
	operativeGroup = signal<OpGroupMod | null>(null);
	operativeAssignments = signal<OperativeAssignmentMod[]>([]);
	inventoryHistory = signal<InventoryHistoryMod[]>([]);
	showEditModal = signal(false);
	showAddOperativeModal = signal(false);
	operativeChanged = signal(false);

	// Computed para el estado actual de la operación
	status = computed<'Programado' | 'En Progreso' | 'Completado'>(() => {
		const g = this.operativeGroup();
		return g ? calcStatus(g.dateStart, g.dateEnd) : 'Programado';
	});

	// Computed para el progreso actual
	progress = computed<number>(() => {
		const g = this.operativeGroup();
		return g ? calcProgress(g.dateStart, g.dateEnd) : 0;
	});

	// Computed para la clase CSS del estado actual
	statusClass = computed(() => this.STATUS_CLASSES[this.status()] || 'status-scheduled');

	// Computed para el ícono del estado actual
	statusIcon = computed(() => this.STATUS_ICONS[this.status()] || 'help');


	// Status mappings como constantes de clase
	private readonly STATUS_CLASSES: Record<string, string> = {
		'Programado': 'status-scheduled',
		'En Progreso': 'status-in-progress',
		'Completado': 'status-completed'
	};

	private readonly STATUS_ICONS: Record<string, string> = {
		'Programado': 'schedule',
		'En Progreso': 'play_circle',
		'Completado': 'check_circle'
	};

	loading = true;
	error = false;
	errorMessage = '';
	opGroupId: number = 0;

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.opGroupId = Number(params.get('id'));
			this.loadData();
		});
	}

	loadData(): void {
		this.opGroupId = Number(this.route.snapshot.paramMap.get('id'));
		this.loading = true;
		this.error = false;
		this.errorMessage = '';

		this.opGroupService.getById(this.opGroupId).subscribe({
			next: (group) => {
				this.operativeGroup.set(group);
				this.loadRelatedData(this.opGroupId);
			},
			error: (err) => {
				console.error('Error cargando grupo operativo', err);
				this.handleError('No se pudo cargar el grupo operativo');
				this.alertService.error('Error', 'No se pudo cargar el grupo operativo');
			}
		});
	}

	private loadRelatedData(groupId: number): void {
		// Cargar asignaciones
		this.operativeService.getAllOperativesAssignments(groupId).subscribe({
			next: (assignments) => this.operativeAssignments.set(assignments),
			error: (err) => {
				console.error('Error cargando asignaciones', err);
				this.alertService.error('Error', 'No se pudieron cargar las asignaciones');
			}
		});

		// Cargar historial de inventario
		this.inventoryService.getInventoryHistory(groupId).subscribe({
			next: (history) => {
				this.inventoryHistory.set(history);
				this.loading = false;
			},
			error: (err) => {
				console.error('Error cargando historial de inventario', err);
				this.alertService.error('Error', 'No se pudo cargar el historial de inventario');
				this.loading = false;
			}
		});
	}

	getProgressPercentage(completed: number, total: number): number {
		return total > 0 ? Math.round((completed / total) * 100) : 0;
	}

	getProgressStatusClass(completed: number, total: number): string {
		if (total === 0) return 'status-pending';

		const percentage = (completed / total) * 100;
		return percentage === 0 ? 'status-pending' :
			percentage < 100 ? 'status-in-progress' :
				'status-completed';
	}

	getVerificationClass(verification: boolean): string {
		return verification ? 'status-completed' : 'status-rejected';
	}

	getVerificationIcon(verification: boolean): string {
		return verification ? 'check_circle' : 'cancel';
	}

	// Acciones principales
	editGroup(): void {
		this.showEditModal.set(true);
	}

	addOperative(): void {
		this.showAddOperativeModal.set(true);
	}

	removeOperative(assignment: OperativeAssignmentMod): void {
		this.alertService.confirm(
			'¿Quitar operativo del grupo?',
			`¿Estás seguro de quitar a ${assignment.operativeName} del grupo?`,
			'Quitar',
			'Cancelar'
		).then(result => {
			if (result.isConfirmed) {
				this.operativeService.removeOpGrou(assignment.id).subscribe({
					next: () => {
						this.loadData();
						this.operativeChanged.set(!this.operativeChanged());
						this.alertService.success(
							'Operativo removido',
							`${assignment.operativeName} ha sido removido del grupo`
						);
					},
					error: (err) => {
						console.error('Error al remover operativo:', err);
						this.alertService.error(
							'Error',
							`No se pudo remover a ${assignment.operativeName} del grupo`
						);
					}
				});
			}
		});
	}

	// Manejadores de modales
	handleGroupSave(updatedGroup: OpGroupMod): void {
		this.operativeGroup.set(updatedGroup);
		this.alertService.success('Grupo actualizado', 'El grupo ha sido actualizado correctamente');
	}

	handleOperativeAdd(): void {
		this.loadData();
	}

	deleteGroup(): void {
		this.opGroupId = Number(this.route.snapshot.paramMap.get('id'));

		this.alertService.confirmDestroy(
			'¿Eliminar grupo?',
			'Se eliminarán todas las asignaciones relacionadas.',
			'Sí, eliminar'
		).then(result => {
			if (result.isConfirmed) {
				this.opGroupService.softDelete(this.opGroupId).subscribe({
					next: () => {
						this.alertService.success(
							'Grupo eliminado',
							'El grupo operativo se eliminó correctamente'
						);
						this.navService.triggerRefreshOperatingGroups();
						this.router.navigate(['/areaManager/dashboard']);
					},
					error: () => {
						this.alertService.error(
							'Error',
							'No se pudo eliminar el grupo operativo. Intente nuevamente.'
						);
					}
				});
			}
		});
	}

	private handleError(message: string): void {
		this.error = true;
		this.errorMessage = message;
		this.loading = false;
		console.error(message);
	}
}
