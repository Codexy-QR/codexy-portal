import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { filter } from 'rxjs';
import { LoaderComponent } from '../../../../../Components/Shared/app-loader/app-loader.component';
import { RequestDetailComponent } from '../../../../../Components/System/Area_Manager/Inventory/request-detail/request-detail.component';
import { InventoryRequestNotificationMod } from '../../../../../Core/Models/ParametersModule/Notification.mod';
import { AuthService } from '../../../../../Core/Service/Auth/auth.service';
import { NotificationService } from '../../../../../Core/Service/ParametersModule/notification.service';
import { NotificationStateService } from '../../../../../Core/Service/System/Others/Notification/notification-state.service';

@Component({
	selector: 'app-inventory-requests',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatCardModule,
		LoaderComponent,
		RequestDetailComponent
	],
	templateUrl: './inventory-requests.component.html',
	styleUrls: ['./inventory-requests.component.css']
})
export class InventoryRequestsComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	readonly notificationState = inject(NotificationStateService);

	readonly requests = this.notificationState.inventoryListState;
	readonly loading = this.notificationState.isLoading;

	// Inyección de servicios nativos de Angular
	private readonly destroyRef = inject(DestroyRef);

	// Signals para estados generales del componente
	readonly errorMessage = signal('');
	readonly error = signal(false);

	// Signals para el control del modal de detalle
	readonly isDetailModalOpen = signal(false);
	readonly selectedRequest = signal<InventoryRequestNotificationMod | null>(null);

	// Computed para exponer solicitudes y calcular información derivada
	readonly pendingRequests = computed(() => this.requests().filter(req => !req.read));
	readonly totalItemsToUpdate = computed(() =>
		this.requests().reduce((total, req) => total + (req.content.differences?.length || 0), 0)
	);

	ngOnInit(): void {
		this.notificationState.loadInventoryRequests();
		this.setupActionListener();
	}

	private setupActionListener(): void {
		this.notificationState.action$
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter(action => action.source !== 'main') // Evita loops
			)
			.subscribe(action => {
				console.log('InventoryRequests: Received action', action);

				if (action.type === 'refresh') {
					this.notificationState.loadInventoryRequests();
				}
			});
	}


	markAsRead(request: InventoryRequestNotificationMod): void {
		if (request.read) return;
		this.notificationState.markAsRead(request.id, 'main');
	}


	viewRequestDetails(request: InventoryRequestNotificationMod): void {
		this.selectedRequest.set(request);
		this.isDetailModalOpen.set(true);
	}

	closeDetailModal(): void {
		this.isDetailModalOpen.set(false);
		this.selectedRequest.set(null);
	}

	formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	getStateChangeClass(baseState: string, newState: string): string {
		const stateHierarchy = ['Perdido', 'Dañado', 'Reparación', 'En orden'];
		const baseIndex = stateHierarchy.indexOf(baseState);
		const newIndex = stateHierarchy.indexOf(newState);

		if (newIndex > baseIndex) return 'state-improved';
		if (newIndex < baseIndex) return 'state-worsened';
		return 'state-same';
	}

	retryData(): void {
		this.notificationState.loadInventoryRequests()
	}
}
