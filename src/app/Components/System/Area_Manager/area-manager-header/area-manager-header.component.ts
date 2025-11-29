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
	readonly notificationState = inject(NotificationStateService);

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);
	private readonly destroyRef = inject(DestroyRef);

	// Inputs principales del componente
	@Input() redirectUrl: string = '';
	@Input() isFixed: boolean = true;

	// Outputs de eventos emitidos al componente padre
	@Output() toggleSidebar = new EventEmitter<void>();

	// Computed para exponer datos derivados de las notificaciones
	readonly notificationCount = computed(() => this.notificationState.headerState().unreadCount);
	readonly notifications = computed(() => this.notificationState.headerState().notifications);
	readonly hasNotifications = computed(() => this.notificationCount() > 0);

	// Signals para estado de carga y manejo de errores
	readonly isLoading = this.notificationState.isLoading;
	readonly error = signal<string | null>(null);

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.notificationState.loadHeaderNotifications();
		this.setupActionListener();
	}

	private setupActionListener(): void {
		this.notificationState.action$
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				filter(action => action.source !== 'header') // Evita loops
			)
			.subscribe(action => {
				console.log('Header: Received action from another component', action);
				if (action.type === 'refresh') {
					this.notificationState.loadHeaderNotifications();
				}
			});
	}


	markAsRead(notification: HeaderNotificationMod, event: Event): void {
		event.stopPropagation();
		this.notificationState.markAsRead(notification.id, 'header');
	}

	markAllAsRead(event: Event): void {
		event.stopPropagation();
		// ¡La lógica se delega!
		this.notificationState.markAllAsRead('header');
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
