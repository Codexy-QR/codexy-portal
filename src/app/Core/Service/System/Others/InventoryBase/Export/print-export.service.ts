import { Injectable } from '@angular/core';

// ===== SERVICIO DE GENERACIÓN DE DOCUMENTOS IMPRIMIBLES =====
// Se encarga de construir documentos HTML completos con la información de los
// ítems y sus códigos QR. Permite su descarga directa o apertura en nueva
// ventana para impresión.
//
// Principales responsabilidades:
// ✅ Generar documentos HTML imprimibles con estilos profesionales.
// ✅ Construir elementos individuales con información y código QR.
// ✅ Permitir descarga o apertura directa del documento.
// ✅ Asegurar la sanitización del contenido HTML.
@Injectable({
	providedIn: 'root'
})
export class PrintExportService {

	constructor() { }

	/**
	 * Genera un documento HTML imprimible con todos los QR e información
	 * @param items Array de items con información de QR
	 * @returns Blob del documento HTML listo para imprimir/descargar
	 */
	generatePrintableDocument(items: { code: string; name: string; qrPath: string; description?: string }[]): Blob {
		// Crear el contenido HTML
		const htmlContent = this.buildHtmlContent(items);

		// Convertir a Blob
		return new Blob([htmlContent], { type: 'text/html' });
	}

	/**
	 * Construye el contenido HTML para la impresión
	 */
	private buildHtmlContent(items: any[]): string {
		return `
			<!DOCTYPE html>
			<html lang="es">
			<head>
			    <meta charset="UTF-8">
			    <meta name="viewport" content="width=device-width, initial-scale=1.0">
			    <title>Códigos QR del Inventario</title>
			    <style>
			        body {
			            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			            margin: 0;
			            padding: 20px;
			            background-color: #f5f5f5;
			        }
			        .print-container {
			            max-width: 210mm; /* A4 width */
			            margin: 0 auto;
			            background: white;
			            padding: 15mm;
			            box-shadow: 0 0 10px rgba(0,0,0,0.1);
			        }
			        .header {
			            text-align: center;
			            margin-bottom: 20px;
			            padding-bottom: 15px;
			            border-bottom: 2px solid #333;
			        }
			        .header h1 {
			            color: #2c3e50;
			            margin: 0;
			            font-size: 24px;
			        }
			        .header .subtitle {
			            color: #7f8c8d;
			            font-size: 14px;
			            margin-top: 5px;
			        }
			        .qr-grid {
			            display: grid;
			            grid-template-columns: repeat(3, 1fr);
			            gap: 15px;
			            margin-top: 20px;
			        }
			        .qr-item {
			            border: 1px solid #ddd;
			            padding: 15px;
			            text-align: center;
			            page-break-inside: avoid;
			            break-inside: avoid;
			            background: white;
			        }
			        .qr-code {
			            width: 120px;
			            height: 120px;
			            margin: 0 auto 10px;
			            border: 1px solid #eee;
			            padding: 5px;
			            background: white;
			        }
			        .qr-code img {
			            width: 100%;
			            height: 100%;
			            object-fit: contain;
			        }
			        .item-code {
			            font-weight: bold;
			            color: #2c3e50;
			            font-size: 14px;
			            margin: 5px 0;
			        }
			        .item-name {
			            color: #34495e;
			            font-size: 12px;
			            margin: 3px 0;
			            word-break: break-word;
			        }
			        .item-description {
			            color: #7f8c8d;
			            font-size: 11px;
			            margin: 3px 0;
			            font-style: italic;
			        }
			        .footer {
			            text-align: center;
			            margin-top: 30px;
			            padding-top: 15px;
			            border-top: 1px solid #ddd;
			            color: #95a5a6;
			            font-size: 12px;
			        }
			        @media print {
			            body {
			                background: white;
			                padding: 0;
			            }
			            .print-container {
			                box-shadow: none;
			                padding: 0;
			                margin: 0;
			                width: 100%;
			            }
			            .qr-grid {
			                grid-template-columns: repeat(4, 1fr);
			                gap: 10px;
			            }
			            .qr-item {
			                border: 1px solid #ccc;
			                padding: 10px;
			            }
			            .no-print {
			                display: none;
			            }
			        }
			        @page {
			            size: A4 portrait;
			            margin: 15mm;
			        }
			    </style>
			</head>
			<body>
			    <div class="print-container">
			        <div class="header">
			            <h1>Inventario - Códigos QR</h1>
			            <div class="subtitle">Generado el ${new Date().toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		})}</div>
			        </div>

			        <div class="qr-grid">
			            ${items.map(item => this.buildQrItem(item)).join('')}
			        </div>

			        <div class="footer">
			            <p>Total de items: ${items.length} | Página 1 de 1</p>
			        </div>
			    </div>

			    <div class="no-print" style="text-align: center; margin-top: 20px;">
			        <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
			            Imprimir Documento
			        </button>
			    </div>

			    <script>
			        // Auto-print when opened in new tab
			        setTimeout(() => {
			            if (window.location.search.includes('autoprint')) {
			                window.print();
			            }
			        }, 500);
			    </script>
			</body>
			</html>`;
	}

	/**
	 * Construye el HTML para cada item QR
	 */
	private buildQrItem(item: any): string {
		return `
<div class="qr-item">
    <div class="qr-code">
        <img src="${item.qrPath}" alt="QR Code ${item.code}" onerror="this.style.display='none'">
    </div>
    <div class="item-code">${this.escapeHtml(item.code)}</div>
    <div class="item-name">${this.escapeHtml(item.name)}</div>
    ${item.description ? `<div class="item-description">${this.escapeHtml(item.description)}</div>` : ''}
</div>`;
	}

	/**
	 * Escapa caracteres HTML para seguridad
	 */
	private escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	/**
	 * Descarga el documento como archivo HTML
	 */
	downloadPrintableDocument(items: any[], filename: string = 'inventory_qr_codes.html'): void {
		const blob = this.generatePrintableDocument(items);
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		link.style.display = 'none';

		document.body.appendChild(link);
		link.click();

		setTimeout(() => {
			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		}, 100);
	}

	/**
	 * Abre el documento en una nueva ventana para imprimir
	 */
	openPrintableDocument(items: any[]): void {
		const blob = this.generatePrintableDocument(items);
		const url = URL.createObjectURL(blob);

		// Abrir en nueva pestaña con opción de auto-impresión
		const printWindow = window.open(url, '_blank');

		if (printWindow) {
			// Limpiar la URL después de un tiempo
			setTimeout(() => URL.revokeObjectURL(url), 1000);
		}
	}
}
