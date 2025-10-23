import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AlertTotalService } from '../../../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-import-excel',
	standalone: true,
	imports: [
		CommonModule,
		MatIconModule,
		MatButtonModule,
	],
	templateUrl: './import-excel.component.html',
	styleUrls: [
		'../../../../Shared/Styles/modal-shared.css',
		'./import-excel.component.css'
	]
})
export class ImportExcelComponent {

	// Inyección de servicios propios del proyecto
	private readonly alertService = inject(AlertTotalService);

	// Inputs principales del componente
	@Input() entityName: string = '';
	@Input() typeName: string = '';
	@Input() isOpen: boolean = false;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();
	@Output() onImport = new EventEmitter<File>();

	// Signals para controlar el arrastre y la carga
	isDragging = signal(false);
	isLoading = signal(false);

	selectedFile: File | null = null;

	// Abre el explorador de archivos dinámicamente
	triggerFileDialog(): void {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.xlsx,.xls';

		input.onchange = (event: Event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (file) {
				this.processFile(file);
			}
		};

		input.click();
	}

	// Drag & Drop
	onDragOver(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		this.isDragging.set(true);
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		this.isDragging.set(false);
	}

	onDrop(event: DragEvent): void {
		event.preventDefault();
		event.stopPropagation();
		this.isDragging.set(false);

		if (event.dataTransfer?.files?.length) {
			this.processFile(event.dataTransfer.files[0]);
		}
	}

	// Procesa el archivo
	private processFile(file: File): void {
		const validExtensions = ['.xlsx', '.xls'];
		const validMimeTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
			'application/vnd.ms-excel' // .xls
		];

		const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

		// Validación extensión y MIME
		if (!validExtensions.includes(fileExtension) || !validMimeTypes.includes(file.type)) {
			this.alertService.error('Archivo inválido', 'Por favor, selecciona un archivo Excel válido (.xlsx o .xls)');
			return;
		}

		// Validación tamaño
		if (file.size > 5 * 1024 * 1024) {
			this.alertService.error('Archivo demasiado grande', 'El archivo no debe exceder los 5MB');
			return;
		}

		// Si pasa las validaciones
		this.selectedFile = file;
	}

	// Acciones de UI
	removeFile(): void {
		this.selectedFile = null;
	}

	getFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' bytes';
		else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
		else return (bytes / 1048576).toFixed(1) + ' MB';
	}

	// Botones del modal
	importFile(): void {
		if (this.selectedFile) {
			this.onImport.emit(this.selectedFile);
		}
	}

	closeModal(): void {
		this.selectedFile = null;
		this.isDragging.set(false);
		this.onClose.emit();
	}
}
