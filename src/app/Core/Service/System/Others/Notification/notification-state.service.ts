import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthService } from '../../../Auth/auth.service';
import { NotificationService } from '../../../ParametersModule/notification.service';
import { SignalrService } from '../../../signal-r.service';
import { HeaderNotificationsResponseMod, InventoryRequestNotificationMod } from '../../../../Models/ParametersModule/Notification.mod';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface NotificationAction {
	type: 'markRead' | 'markAllRead' | 'refresh';
	notificationId?: number;
	timestamp: number;
	source?: 'header' | 'main';
}

// ===== SERVICIO DE ESTADO GLOBAL DE NOTIFICACIONES =====
// Este servicio centraliza el estado y las acciones relacionadas con las
// notificaciones del sistema. Su objetivo es facilitar la comunicación entre
// componentes (header, panel principal, modales, etc.) sin generar dependencias
// directas.
//
// Principales responsabilidades:
// ✅ Emitir acciones globales para notificaciones (leer, leer todas, refrescar).
// ✅ Mantener el contador de notificaciones no leídas de forma reactiva.
// ✅ Permitir a cualquier componente actualizar o reaccionar ante cambios.
// ✅ Sincronizar las vistas del header y del panel principal.
@Injectable({
	providedIn: 'root'
})
export class NotificationStateService {

	private readonly signalrService = inject(SignalrService);
	private readonly notificationApi = inject(NotificationService);
	private readonly authService = inject(AuthService);
	private readonly destroyRef = inject(DestroyRef);

	// Subject para acciones (más predecible que signals para este caso)
	private readonly actionSubject = new Subject<NotificationAction>();

	// Observable público para que los componentes se suscriban
	readonly action$ = this.actionSubject.asObservable();

	// Signal para el contador de notificaciones no leídas
	private readonly _unreadCount = signal(0);

	// Estado para el Header (Dropdown)
	private readonly _headerState = signal<HeaderNotificationsResponseMod>({
		unreadCount: 0,
		notifications: []
	});

	// Estado para la Lista de Inventario (Página Principal)
	private readonly _inventoryListState = signal<InventoryRequestNotificationMod[]>([]);

	// Estado de Carga/Error
	readonly isLoading = signal(false);
	readonly error = signal<string | null>(null);

	// Exponer los estados completos
	readonly headerState = this._headerState.asReadonly();
	readonly inventoryListState = this._inventoryListState.asReadonly();

	readonly unreadCount = computed(() => this._headerState().unreadCount);

	constructor() {
		this.connectToRealtimeUpdates();
	}

	/**
	 * Se suscribe a los topics de SignalR para recibir actualizaciones PUSH.
	 */
	private connectToRealtimeUpdates(): void {
		// 1. Escuchar actualizaciones del Header
		this.signalrService.listenToTopic<HeaderNotificationsResponseMod>('ReceiveHeaderUpdate')
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(headerData => {
				console.log('SignalR Push: Actualizando Header', headerData);
				this._headerState.set(headerData);
			});

		// 2. Escuchar actualizaciones de la Lista de Inventario
		this.signalrService.listenToTopic<InventoryRequestNotificationMod[]>('ReceiveInventoryListUpdate')
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(listData => {
				console.log('SignalR Push: Actualizando Lista de Inventario', listData);
				this._inventoryListState.set(listData);
				// Sincronizar el contador por si acaso
				this.syncHeaderCountFromList(listData);
			});
	}

	/**
	 * Asegura que el contador del header coincida con la lista principal
	 * (útil cuando la lista se carga/actualiza).
	 */
	private syncHeaderCountFromList(requests: InventoryRequestNotificationMod[]): void {
		const unreadCount = requests.filter(r => !r.read).length;
		this._headerState.update(current => ({
			...current,
			unreadCount: unreadCount
		}));
	}

	/**
	 * Carga los datos iniciales para el Header (usado en ngOnInit del Header).
	 */
	loadHeaderNotifications(): void {
		this.isLoading.set(true);
		this.error.set(null);
		this.notificationApi.getHeaderNotifications().subscribe({
			next: (response) => {
				this._headerState.set(response);
				this.isLoading.set(false);
			},
			error: (err) => {
				console.error('Error cargando header notifications:', err);
				this.error.set('Error al cargar notificaciones');
				this.isLoading.set(false);
			}
		});
	}

	/**
	 * Carga los datos iniciales para la Lista (usado en ngOnInit de la Lista).
	 */
	loadInventoryRequests(): void {
		const userId = Number(this.authService.getIdUser());
		if (!userId) {
			this.error.set('No se pudo obtener el ID del usuario');
			return;
		}

		this.isLoading.set(true);
		this.error.set(null);
		this.notificationApi.getInventoryRequests(userId).subscribe({
			next: (requests) => {
				this._inventoryListState.set(requests);
				this.syncHeaderCountFromList(requests);
				this.isLoading.set(false);
			},
			error: (err) => {
				console.error('Error cargando inventory requests:', err);
				this.error.set('Error al cargar la lista');
				this.isLoading.set(false);
			}
		});
	}

	/**
	 * Marca una notificación como leída (usando Optimistic Update).
	 */
	markAsRead(notificationId: number, source?: 'header' | 'main'): void {
		// 1. Disparar evento UI (Tu lógica original)
		this.actionSubject.next({ type: 'markRead', notificationId, timestamp: Date.now(), source });

		// 2. Actualización Optimista del Estado Local
		this.optimisticUpdateMarkAsRead(notificationId);

		// 3. Llamada a la API
		this.notificationApi.markAsRead(notificationId).subscribe({
			error: (err) => {
				console.error('Error marcando como leído, revirtiendo:', err);
				// Revertir recargando todo
				this.refreshNotifications();
			}
		});
	}

	/**
	 * Marca TODAS como leídas.
	 */
	markAllAsRead(source?: 'header' | 'main'): void {
		// 1. Disparar evento UI (Tu lógica original)
		this.actionSubject.next({ type: 'markAllRead', timestamp: Date.now(), source });

		// 2. Actualización Optimista
		this._headerState.update(current => ({
			...current,
			unreadCount: 0,
			notifications: [] // Vaciar la lista del dropdown
		}));
		this._inventoryListState.update(requests =>
			requests.map(req => ({ ...req, read: true }))
		);

		// 3. Llamada a la API
		this.notificationApi.markAllAsRead().subscribe({
			error: (err) => {
				console.error('Error marcando todo como leído, revirtiendo:', err);
				this.refreshNotifications();
			}
		});
	}

	/**
	 * Recarga todos los datos de notificaciones desde la API.
	 */
	refreshNotifications(): void {
		// 1. Disparar evento UI (Tu lógica original)
		this.actionSubject.next({ type: 'refresh', timestamp: Date.now() });

		// 2. Recargar ambos estados desde la API
		this.loadHeaderNotifications();
		this.loadInventoryRequests();
	}

	private optimisticUpdateMarkAsRead(notificationId: number): void {
		// Actualizar el estado del Header
		this._headerState.update(current => ({
			unreadCount: Math.max(0, current.unreadCount - 1),
			notifications: current.notifications.filter(n => n.id !== notificationId)
		}));

		// Actualizar el estado de la Lista
		this._inventoryListState.update(requests =>
			requests.map(req =>
				req.id === notificationId ? { ...req, read: true } : req
			)
		);
	}
}
