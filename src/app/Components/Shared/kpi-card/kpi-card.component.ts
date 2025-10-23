import { Component, Input } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";

@Component({
	selector: 'app-kpi-card',
	imports: [MatIconModule],
	templateUrl: './kpi-card.component.html',
	styleUrl: './kpi-card.component.css'
})
export class KpiCardComponent {

	// Inputs principales del componente
	@Input() icon!: string;
	@Input() value!: number | string;
	@Input() label!: string;
}
