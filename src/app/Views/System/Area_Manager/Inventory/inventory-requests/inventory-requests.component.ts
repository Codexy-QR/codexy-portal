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
	private readonly authService = inject(AuthService);
	private readonly notificationService = inject(NotificationService);
	private readonly notificationState = inject(NotificationStateService);

	// Inyección de servicios nativos de Angular
	private readonly destroyRef = inject(DestroyRef);

	// Signals para estados generales del componente
	readonly loading = signal(true);
	readonly error = signal(false);
	readonly errorMessage = signal('');

	// Signal para almacenar solicitudes de inventario
	private readonly _requests = signal<InventoryRequestNotificationMod[]>([]);

	// Signals para el control del modal de detalle
	readonly isDetailModalOpen = signal(false);
	readonly selectedRequest = signal<InventoryRequestNotificationMod | null>(null);

	// Computed para exponer solicitudes y calcular información derivada
	readonly requests = computed(() => this._requests());
	readonly pendingRequests = computed(() => this.requests().filter(req => !req.read));
	readonly totalItemsToUpdate = computed(() =>
		this.requests().reduce((total, req) => total + req.content.differences.length, 0)
	);


	ngOnInit(): void {
		this.loadRequests();
		this.setupActionListener();
	}

	private setupActionListener(): void {
		this.notificationState.action$
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				// Filtrar acciones que vengan del header (evita loops)
				filter(action => action.source !== 'main')
			)
			.subscribe(action => {
				console.log('InventoryRequests: Received action', action);

				switch (action.type) {
					case 'markRead':
						if (action.notificationId) {
							this.updateLocalReadState(action.notificationId, true);
						}
						break;

					case 'markAllRead':
						this.markAllLocallyAsRead();
						break;

					case 'refresh':
						this.loadRequests();
						break;
				}
			});
	}

	private updateLocalReadState(notificationId: number, read: boolean): void {
		this._requests.update(requests =>
			requests.map(req =>
				req.id === notificationId ? { ...req, read } : req
			)
		);
	}

	private markAllLocallyAsRead(): void {
		this._requests.update(requests =>
			requests.map(req => ({ ...req, read: true }))
		);
	}

	markAsRead(request: InventoryRequestNotificationMod): void {
		if (request.read) return;

		console.log('InventoryRequests: Marking as read', request.id);

		// Optimistic update local
		this.updateLocalReadState(request.id, true);

		// Notificar a otros componentes (especificando source)
		this.notificationState.markAsRead(request.id, 'main');

		// Llamada al backend
		this.notificationService.markAsRead(request.id).subscribe({
			error: (error) => {
				console.error('Error al marcar lectura', error);
				// Revertir si hay error
				this.updateLocalReadState(request.id, false);
				// Recargar para estar seguros
				this.notificationState.refreshNotifications();
			}
		});
	}

	loadRequests(): void {
		this.loading.set(true);
		this.error.set(false);

		const userId = Number(this.authService.getIdUser());

		if (!userId) {
			this.error.set(true);
			this.errorMessage.set('No se pudo obtener el ID del usuario');
			this.loading.set(false);
			return;
		}

		this.notificationService.getInventoryRequests(userId).subscribe({
			next: (requests) => {
				this._requests.set(requests);

				// Actualizar contador global
				const unreadCount = requests.filter(r => !r.read).length;
				this.notificationState.updateUnreadCount(unreadCount);

				this.loading.set(false);
			},
			error: (err) => {
				console.error('Error loading inventory requests:', err);
				this.error.set(true);
				this.errorMessage.set('Error al cargar las solicitudes de inventario');
				this.loading.set(false);
			}
		});
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
		this.loadRequests();
	}
}
