import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-loader',
	standalone: true,
	imports: [CommonModule, MatProgressSpinnerModule, MatIconModule, MatButtonModule],
	template: `
    <!-- Estado cargando -->
    <div class="loader-container" [class.fullscreen]="fullScreen" *ngIf="loading">
      <mat-progress-spinner
        mode="indeterminate"
        [diameter]="diameter"
        [color]="color">
      </mat-progress-spinner>
      <p *ngIf="loadingMessage">{{ loadingMessage }}</p>
    </div>

    <!-- Estado error -->
    <div class="loader-container error" [class.fullscreen]="fullScreen" *ngIf="!loading && error">
      <mat-icon>error</mat-icon>
      <p>{{ error }}</p>
      <button mat-raised-button color="warn" *ngIf="showRetry" (click)="onRetry()">Reintentar</button>
    </div>
  `,
	styleUrls: ['./app-loader.component.css']
})
export class LoaderComponent {

	// Inputs principales del componente
	@Input() loading: boolean = false;
	@Input() loadingMessage: string = 'Cargando...';
	@Input() error: string | null = null;
	@Input() fullScreen: boolean = false;
	@Input() diameter: number = 50;
	@Input() color: 'primary' | 'accent' | 'warn' = 'primary';
	@Input() showRetry: boolean = false;

	// Outputs de eventos emitidos al componente padre
	@Output() retry = new EventEmitter<void>();

	onRetry() {
		this.retry.emit();
	}
}
