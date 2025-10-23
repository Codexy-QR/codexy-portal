import { Injectable } from '@angular/core';

// ===== SERVICIO DE DESCARGA Y CONVERSIÓN DE CÓDIGOS QR =====
// Proporciona utilidades avanzadas para trabajar con imágenes QR asociadas a
// los ítems del inventario. Permite su descarga individual o múltiple, la
// conversión a Base64, y la validación de URL seguras.
//
// Principales responsabilidades:
// ✅ Descargar imágenes QR desde sus URLs, individual o en lote.
// ✅ Convertir imágenes QR a formato Base64 para usos avanzados (PDF, reportes, etc.).
// ✅ Generar nombres de archivos seguros y estandarizados.
// ✅ Validar URLs y evitar descargas inseguras.
@Injectable({
	providedIn: 'root'
})
export class QrDownloadService {

	constructor() { }

	/**
	 * Descarga una imagen desde una URL
	 * @param url URL de la imagen a descargar
	 * @param filename Nombre del archivo para descargar
	 * @returns Promise que se resuelve cuando la descarga es exitosa o se rechaza con error
	 */
	async downloadImageFromUrl(url: string, filename: string): Promise<void> {
		return new Promise(async (resolve, reject) => {
			try {
				// Validar URL
				if (!this.isValidUrl(url)) {
					throw new Error('URL no válida');
				}

				// Fetch de la imagen
				const response = await fetch(url, {
					mode: 'cors',
					credentials: 'omit'
				});

				if (!response.ok) {
					throw new Error(`Error HTTP: ${response.status}`);
				}

				// Convertir a blob
				const blob = await response.blob();

				// Crear URL del objeto blob
				const blobUrl = URL.createObjectURL(blob);

				// Crear elemento de descarga
				const link = document.createElement('a');
				link.href = blobUrl;
				link.download = filename;
				link.style.display = 'none';

				// Agregar al documento y hacer click
				document.body.appendChild(link);
				link.click();

				// Limpiar
				setTimeout(() => {
					document.body.removeChild(link);
					URL.revokeObjectURL(blobUrl);
					resolve();
				}, 100);

			} catch (error) {
				console.error('Error descargando imagen:', error);

				// Fallback: método simple de descarga
				try {
					this.downloadWithAnchorTag(url, filename);
					resolve();
				} catch (fallbackError) {
					reject(fallbackError);
				}
			}
		});
	}

	/**
	 * Método alternativo usando tag anchor para descargar
	 * @param url URL de la imagen
	 * @param filename Nombre del archivo
	 */
	private downloadWithAnchorTag(url: string, filename: string): void {
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.target = '_blank';
		link.style.display = 'none';

		document.body.appendChild(link);
		link.click();

		setTimeout(() => {
			document.body.removeChild(link);
		}, 100);
	}

	/**
	 * Convierte una imagen URL a Base64
	 * @param url URL de la imagen
	 * @returns Promise con la imagen en Base64
	 */
	async urlToBase64(url: string): Promise<string> {
		return new Promise(async (resolve, reject) => {
			try {
				const response = await fetch(url);
				const blob = await response.blob();

				const reader = new FileReader();
				reader.onloadend = () => {
					const base64data = reader.result as string;
					resolve(base64data);
				};
				reader.onerror = reject;
				reader.readAsDataURL(blob);
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * Descarga múltiples imágenes QR
	 * @param items Array de items con URL de QR y información para el nombre
	 */
	async downloadMultipleQrs(items: { qrPath: string; code: string; name: string }[]): Promise<void> {
		for (const item of items) {
			try {
				const filename = this.generateFilename(item.code, item.name);
				await this.downloadImageFromUrl(item.qrPath, filename);

				// Pequeña pausa entre descargas para evitar sobrecarga
				await new Promise(resolve => setTimeout(resolve, 300));
			} catch (error) {
				console.error(`Error descargando QR para ${item.code}:`, error);
			}
		}
	}

	/**
	 * Genera un nombre de archivo para el QR
	 * @param code Código del item
	 * @param name Nombre del item
	 * @returns Nombre del archivo formateado
	 */
	generateFilename(code: string, name: string): string {
		// Limpiar el nombre para que sea válido como nombre de archivo
		const cleanName = name.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s_-]/g, '').trim();
		const truncatedName = cleanName.length > 20 ? cleanName.substring(0, 20) + '...' : cleanName;

		return `QR_${code}_${truncatedName}.png`;
	}

	/**
	 * Valida si una URL es segura y válida
	 * @param url URL a validar
	 * @returns true si la URL es válida
	 */
	private isValidUrl(url: string): boolean {
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
}
