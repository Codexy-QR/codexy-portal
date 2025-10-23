// ===== SERVICIOS DE ENTIDADES =====
// Conjunto de servicios que heredan de GenericService<TWrite, TRead> para estandarizar
// las operaciones CRUD (GetAll, GetById, Create, Update, Delete).
// Cada servicio se especializa en una entidad del sistema, centralizando
// la comunicación con su respectiva API.


import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { GenericService } from '../generic.service';
import { HeaderNotificationsResponseMod, InventoryRequestNotificationMod, NotificationMod, NotificationOptionsMod } from '../../Models/ParametersModule/Notification.mod';
import { Observable } from 'rxjs';

// Servicio de gestión de Notificaciones.
// Además de CRUD genérico, provee métodos específicos:
// - getInventoryRequests → obtiene solicitudes de inventario.
// - markAsRead / markAllAsRead → marcan notificaciones como leídas.
// - getHeaderNotifications → obtiene resumen para header.
@Injectable({
	providedIn: 'root'
})
export class NotificationService extends GenericService<NotificationOptionsMod, NotificationMod> {

	constructor(http: HttpClient) {
		const urlBase = environment.apiURL + 'api/Notification/'
		super(http, urlBase)
	}

	getInventoryRequests(userId: number): Observable<InventoryRequestNotificationMod[]> {
		return this.http.get<InventoryRequestNotificationMod[]>(
			`${this.baseUrl}GetInventoryRequests/${userId}`
		);
	}

	markAsRead(notificationId: number): Observable<{ success: boolean }> {
		return this.http.patch<{ success: boolean }>(
			`${this.baseUrl}MarkAsRead/${notificationId}`,
			{}
		);
	}

	getHeaderNotifications(): Observable<HeaderNotificationsResponseMod> {
		return this.http.get<HeaderNotificationsResponseMod>(
			`${this.baseUrl}GetHeaderNotifications`
		);
	}

	markAllAsRead(): Observable<{ success: boolean }> {
		return this.http.patch<{ success: boolean }>(
			`${this.baseUrl}MarkAllAsRead`,
			{}
		);
	}
}
