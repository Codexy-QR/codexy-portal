import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

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
	// Subject para acciones (más predecible que signals para este caso)
	private readonly actionSubject = new Subject<NotificationAction>();

	// Observable público para que los componentes se suscriban
	readonly action$ = this.actionSubject.asObservable();

	// Signal para el contador de notificaciones no leídas
	private readonly _unreadCount = signal(0);

	readonly unreadCount = this._unreadCount.asReadonly();

	markAsRead(notificationId: number, source?: 'header' | 'main'): void {
		this.actionSubject.next({
			type: 'markRead',
			notificationId,
			timestamp: Date.now(),
			source
		});

		// Decrementar contador
		this._unreadCount.update(count => Math.max(0, count - 1));
	}

	markAllAsRead(source?: 'header' | 'main'): void {
		this.actionSubject.next({
			type: 'markAllRead',
			timestamp: Date.now(),
			source
		});

		// Reset contador
		this._unreadCount.set(0);
	}

	refreshNotifications(): void {
		this.actionSubject.next({
			type: 'refresh',
			timestamp: Date.now()
		});
	}

	// Actualizar el contador desde componentes
	updateUnreadCount(count: number): void {
		this._unreadCount.set(count);
	}
}
