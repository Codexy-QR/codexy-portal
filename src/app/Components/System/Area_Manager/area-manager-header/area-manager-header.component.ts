import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Input, OnInit, Output, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { LogoutButtonDirective } from "../../../../Core/Directives/logout-button.directive";
import { HeaderNotificationMod, HeaderNotificationsResponseMod } from '../../../../Core/Models/ParametersModule/Notification.mod';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { NotificationService } from '../../../../Core/Service/ParametersModule/notification.service';
import { NotificationStateService } from '../../../../Core/Service/System/Others/Notification/notification-state.service';

@Component({
	selector: 'app-area-manager-header',
	imports: [
		CommonModule,
		MatToolbarModule,
		MatIconModule,
		MatMenuModule,
		MatButtonModule,
		MatDividerModule,
		RouterLink,
		MatBadgeModule,
		LogoutButtonDirective,
		MatProgressSpinnerModule
	],
	standalone: true,
	templateUrl: './area-manager-header.component.html',
	styleUrls: ['../../../Shared/Styles/header-shared.css', './area-manager-header.component.css']
})
export class AreaManagerHeaderComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly notificationService = inject(NotificationService);
	private readonly notificationState = inject(NotificationStateService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);
	private readonly destroyRef = inject(DestroyRef);

	// Inputs principales del componente
	@Input() redirectUrl: string = '';
	@Input() isFixed: boolean = true;

	// Outputs de eventos emitidos al componente padre
	@Output() toggleSidebar = new EventEmitter<void>();

	// Signal para almacenar la respuesta de notificaciones
	private readonly _notificationsResponse = signal<HeaderNotificationsResponseMod>({
		unreadCount: 0,
		notifications: []
	});

	// Computed para exponer datos derivados de las notificaciones
	readonly notificationCount = computed(() => this._notificationsResponse().unreadCount);
	readonly notifications = computed(() => this._notificationsResponse().notifications);
	readonly hasNotifications = computed(() => this.notificationCount() > 0);

	// Signals para estado de carga y manejo de errores
	readonly isLoading = signal(false);
	readonly error = signal<string | null>(null);

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.loadHeaderNotifications();
		this.setupActionListener();
	}

	private setupActionListener(): void {
		this.notificationState.action$
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				// Filtrar acciones que vengan del mismo header (evita loops)
				filter(action => action.source !== 'header')
			)
			.subscribe(action => {
				console.log('Header: Received action', action);

				switch (action.type) {
					case 'markRead':
						if (action.notificationId) {
							this.removeNotification(action.notificationId);
						}
						break;

					case 'markAllRead':
						this.clearAllNotifications();
						break;

					case 'refresh':
						this.loadHeaderNotifications();
						break;
				}
			});
	}

	private removeNotification(notificationId: number): void {
		this._notificationsResponse.update(current => ({
			unreadCount: Math.max(0, current.unreadCount - 1),
			notifications: current.notifications.filter(n => n.id !== notificationId)
		}));
	}

	private clearAllNotifications(): void {
		this._notificationsResponse.set({
			unreadCount: 0,
			notifications: []
		});
	}

	markAsRead(notification: HeaderNotificationMod, event: Event): void {
		event.stopPropagation();

		console.log('Header: Marking as read', notification.id);

		// Optimistic update local
		this.removeNotification(notification.id);

		// Notificar a otros componentes (especificando source)
		this.notificationState.markAsRead(notification.id, 'header');

		// Llamada al backend
		this.notificationService.markAsRead(notification.id).subscribe({
			error: (err) => {
				console.error('Error marking notification as read:', err);
				// Recargar en caso de error
				this.loadHeaderNotifications();
			}
		});
	}

	markAllAsRead(event: Event): void {
		event.stopPropagation();

		console.log('Header: Marking all as read');

		// Optimistic update local
		this.clearAllNotifications();

		// Notificar a otros componentes
		this.notificationState.markAllAsRead('header');

		// Llamada al backend
		this.notificationService.markAllAsRead().subscribe({
			error: (err) => {
				console.error('Error marking all notifications as read:', err);
				// Recargar en caso de error
				this.loadHeaderNotifications();
			}
		});
	}

	loadHeaderNotifications(): void {
		this.isLoading.set(true);
		this.error.set(null);

		this.notificationService.getHeaderNotifications().subscribe({
			next: (response) => {
				this._notificationsResponse.set(response);

				// Actualizar contador global
				this.notificationState.updateUnreadCount(response.unreadCount);

				this.isLoading.set(false);
			},
			error: (err) => {
				console.error('Error loading header notifications:', err);
				this.error.set('Error al cargar notificaciones');
				this.isLoading.set(false);
			}
		});
	}

	get logoRedirectUrl(): string {
		return '/areaManager/dashboard';
	}

	onToggleSidebar(): void {
		this.toggleSidebar.emit();
	}

	get username(): string {
		return this.authService.getUsername();
	}

	get role(): string {
		return this.authService.getRole();
	}

	goToRQS(): void {
		this.router.navigate(['/areaManager/inventory-requests/']);
	}

	goToProfile(): void {
		this.router.navigate(['/areaManager/profile']);
	}

	goToBranch(): void {
		this.router.navigate(['/areaManager/zone/']);
	}

	formatTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Ahora mismo';
		if (diffMins < 60) return `Hace ${diffMins} min`;
		if (diffHours < 24) return `Hace ${diffHours} h`;
		if (diffDays === 1) return 'Ayer';
		if (diffDays < 7) return `Hace ${diffDays} días`;

		return date.toLocaleDateString('es-ES');
	}

	getNotificationIcon(type: number): string {
		switch (type) {
			case 6: return 'inventory_2';
			case 4: return 'fact_check';
			case 5: return 'check_circle';
			default: return 'notifications';
		}
	}

	getOperatingGroupName(notification: HeaderNotificationMod): string {
		if (!notification.content) return '';

		try {
			const contentObj = JSON.parse(notification.content);
			return contentObj.operatingGroupName || '';
		} catch (e) {
			console.error('Error parsing notification content:', e);
			return '';
		}
	}
}
