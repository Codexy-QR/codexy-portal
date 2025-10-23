import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

export interface ProfileField {
	key: string;
	label: string;
	icon: string;
	visible?: boolean;
	formatter?: (value: any) => string;
}

@Component({
	selector: 'app-show-info-profile',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTabsModule,
		RouterModule
	],
	templateUrl: './show-info-profile.component.html',
	styleUrls: ['../../Styles/show-info-shared.css', './show-info-profile.component.css']
})
export class ShowInfoProfileComponent {

	// Inputs principales del componente
	@Input() profileData: any = null;
	@Input() profileFields: ProfileField[] = [];
	@Input() backRoute: string = '/';

	// Inputs para la configuración del header
	@Input() headerIcon: string = 'person';
	@Input() headerTitle: string = 'Mi Perfil';
	@Input() headerSubtitle: string = 'Gestiona tu información personal';

	// Inputs para la configuración del avatar
	@Input() avatarInitials: string = 'U';
	@Input() avatarTitle: string = 'Usuario';
	@Input() avatarSubtitle?: string = 'correo@ejemplo.com';
	@Input() avatarRole: string = 'USUARIO';

	// Outputs de eventos emitidos al componente padre
	@Output() onEdit = new EventEmitter<void>();
	@Output() onChangePassword = new EventEmitter<void>();

	getFieldValue(key: string): string {
		if (!this.profileData) return '';

		const value = this.getNestedValue(this.profileData, key);
		const fieldConfig = this.profileFields.find(f => f.key === key);

		if (fieldConfig && fieldConfig.formatter) {
			return fieldConfig.formatter(value);
		}

		return value !== null && value !== undefined ? value.toString() : '';
	}

	private getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj);
	}
}
