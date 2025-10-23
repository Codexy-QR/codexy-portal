import { CommonModule } from '@angular/common';
import {
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	Output,
	SimpleChanges,
	ViewChild,
	inject,
	signal,
	AfterViewInit
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { ItemMod } from '../../../../../Core/Models/System/ItemMod.model';
import { QrDownloadService } from '../../../../../Core/Service/System/Others/InventoryBase/Export/qr-download.service';

@Component({
	selector: 'app-item-details',
	standalone: true,
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule
	],
	templateUrl: './item-details.component.html',
	styleUrls: [
		'../../../../Shared/Styles/modal-shared.css',
		'./item-details.component.css'
	]
})
export class ItemDetailsModalComponent implements OnChanges, AfterViewInit {

	// Inyección de servicios propios del proyecto
	private readonly qrDownloadService = inject(QrDownloadService);

	// Inputs principales del componente
	@Input({ required: true }) itemData!: ItemMod;
	@Input({ required: true }) isOpen = false;

	// Outputs de eventos emitidos al componente padre
	@Output() onClose = new EventEmitter<void>();

	@ViewChild('qrImage') qrImage!: ElementRef<HTMLImageElement>;

	// Signals para controlar la carga, errores y descarga del QR
	qrLoading = signal(false);
	qrError = signal(false);
	isDownloading = signal(false);

	// Métodos del ciclo de vida del componente
	ngAfterViewInit(): void {
		if (this.qrImage?.nativeElement) {
			this.setupImageEvents();
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['itemData'] && this.itemData) {
			this.loadQrImage();

			// Reconfigurar eventos cuando cambian los datos
			setTimeout(() => {
				if (this.qrImage?.nativeElement) {
					this.setupImageEvents();
				}
			}, 0);
		}
	}

	private setupImageEvents(): void {
		const img = this.qrImage.nativeElement;

		// Remover event listeners previos
		img.onload = null;
		img.onerror = null;

		// Configurar nuevos event listeners
		img.onload = () => this.onQrLoad();
		img.onerror = () => this.onQrError();

		// Si la imagen ya está cargada (caché), disparar el evento load manualmente
		if (img.complete && img.naturalHeight !== 0) {
			this.onQrLoad();
		}
	}

	private loadQrImage(): void {
		if (this.itemData.qrPath) {
			this.qrLoading.set(true);
			this.qrError.set(false);

			// Verificar seguridad de la URL
			if (!this.isSafeUrl(this.itemData.qrPath)) {
				this.qrLoading.set(false);
				this.qrError.set(true);
				return;
			}
		} else {
			this.qrLoading.set(false);
			this.qrError.set(true);
		}
	}

	private isSafeUrl(url: string): boolean {
		// Verificación básica de seguridad
		try {
			// Verificar que sea una URL válida
			if (!url || typeof url !== 'string') return false;

			// Verificar protocolos permitidos
			const isHttp = url.startsWith('http://');
			const isHttps = url.startsWith('https://');
			const isData = url.startsWith('data:');

			// Para Cloudinary, generalmente usamos HTTPS
			if (!isHttps && !isData) {
				console.warn('URL con protocolo no permitido:', url);
				return false;
			}

			// Verificar que no contenga scripts maliciosos
			if (url.includes('javascript:') || url.includes('data:text/html')) {
				console.warn('URL potencialmente peligrosa:', url);
				return false;
			}

			return true;
		} catch (error) {
			console.error('Error validando URL:', error);
			return false;
		}
	}

	closeModal(): void {
		this.onClose.emit();
	}

	onQrLoad(): void {
		this.qrLoading.set(false);
	}

	onQrError(): void {
		this.qrLoading.set(false);
		this.qrError.set(true);
		console.error('Error al cargar el código QR');
	}

	/**
	 * Descargar QR usando el servicio
	 */
	async downloadQR(): Promise<void> {
		if (!this.itemData.qrPath) {
			console.error('No hay URL de QR para descargar');
			return;
		}

		this.isDownloading.set(true);

		try {
			const filename = this.qrDownloadService.generateFilename(
				this.itemData.code,
				this.itemData.name
			);

			await this.qrDownloadService.downloadImageFromUrl(this.itemData.qrPath, filename);
			console.log('QR descargado exitosamente');

		} catch (error) {
			console.error('Error descargando QR:', error);

			// Podrías mostrar un mensaje de error al usuario aquí
		} finally {
			this.isDownloading.set(false);
		}
	}
}
