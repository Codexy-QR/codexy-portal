import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

export interface DataField {
	key: string;
	label: string;
	icon: string;
	visible?: boolean;
	formatter?: (value: any) => string;
}

@Component({
	selector: 'app-show-info-edification',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatTooltipModule,
		MatTabsModule,
		RouterModule
	],
	templateUrl: './show-info-edification.component.html',
	styleUrls: ['../../Styles/show-info-shared.css', './show-info-edification.component.css']
})
export class ShowInfoEdificationComponent {

	// Inputs principales del componente
	@Input() entityData: any = null;
	@Input() entityType: string = 'Entidad';
	@Input() dataFields: DataField[] = [];
	@Input() showDeleteButton: boolean = true;
	@Input() backRoute: string = '/';

	// Inputs para la configuración del header
	@Input() headerIcon: string = 'business';
	@Input() headerTitle: string = 'Datos';
	@Input() headerSubtitle: string = 'Gestión de información';

	// Inputs para la configuración de la sección de avatar
	@Input() showAvatarSection: boolean = true;
	@Input() avatarBadgeIcon: string = 'business';
	@Input() avatarBadgeText: string = 'Entidad';
	@Input() avatarInitials: string = 'E';
	@Input() avatarTitle: string = 'Entidad';
	@Input() avatarSubtitle: string = 'información';
	@Input() avatarRole: string = 'EMPRESA';

	// Outputs de eventos emitidos al componente padre
	@Output() onEdit = new EventEmitter<void>();
	@Output() onDelete = new EventEmitter<void>();

	getFieldValue(key: string): string {
		if (!this.entityData) return '';

		const value = this.getNestedValue(this.entityData, key);
		const fieldConfig = this.dataFields.find(f => f.key === key);

		if (fieldConfig && fieldConfig.formatter) {
			return fieldConfig.formatter(value);
		}

		return value !== null && value !== undefined ? value.toString() : '';
	}

	private getNestedValue(obj: any, path: string): any {
		return path.split('.').reduce((acc, part) => acc && acc[part], obj);
	}
}
