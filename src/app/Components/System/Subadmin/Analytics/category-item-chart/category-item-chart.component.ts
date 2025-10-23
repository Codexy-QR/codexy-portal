import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MatIconModule } from "@angular/material/icon";

Chart.register(...registerables);

@Component({
	selector: 'app-category-item-chart',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './category-item-chart.component.html',
	styleUrl: './category-item-chart.component.css'
})
export class CategoryItemChartComponent implements OnChanges, AfterViewInit, OnDestroy {

	// Inputs principales del componente
	@Input() data!: { [status: string]: number };

	@ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

	// Variables de estado y control local
	hasData = false;
	private chart: Chart<'doughnut'> | null = null;
	private viewInitialized = false;


	// Métodos del ciclo de vida del componente
	ngAfterViewInit() {
		this.viewInitialized = true;
		this.evaluateData();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes['data']) {
			this.evaluateData();
		}
	}

	ngOnDestroy() {
		if (this.chart) {
			this.chart.destroy();
		}
	}

	private evaluateData() {
		// Verificar si hay datos válidos
		const validData = this.data &&
			Object.keys(this.data).length > 0 &&
			Object.values(this.data).some(v => v > 0);

		this.hasData = !!validData;

		// Solo intentar crear/actualizar el gráfico si la vista está inicializada
		if (this.viewInitialized) {
			if (this.hasData) {
				// Usar setTimeout para asegurar que el DOM se actualice
				setTimeout(() => {
					this.updateChart();
				}, 0);
			} else if (this.chart) {
				this.chart.destroy();
				this.chart = null;
			}
		}
	}

	private updateChart() {
		if (this.chart) {
			this.chart.destroy();
			this.chart = null;
		}
		this.createChart();
	}

	private createChart() {
		if (!this.hasData) return;

		const ctx = this.chartCanvas?.nativeElement;
		if (!ctx) {
			console.warn('Canvas element not found');
			return;
		}

		const filteredData = Object.entries(this.data)
			.filter(([_, value]) => value > 0)
			.map(([status, count]) => ({ status, count }));

		if (filteredData.length === 0) return;

		const finalStatuses = filteredData.map(item => item.status);
		const finalCounts = filteredData.map(item => item.count);

		const config: ChartConfiguration<'doughnut'> = {
			type: 'doughnut',
			data: {
				labels: finalStatuses,
				datasets: [
					{
						data: finalCounts,
						backgroundColor: this.generateStatusColors(finalStatuses),
						borderColor: 'rgba(255, 255, 255, 0.1)',
						borderWidth: 2,
						hoverBackgroundColor: this.generateStatusHoverColors(finalStatuses),
						hoverOffset: 8
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				cutout: '70%',
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							color: 'rgba(255, 255, 255, 0.8)',
							font: {
								size: 12,
								weight: 500
							},
							padding: 20,
							usePointStyle: true,
							pointStyle: 'circle'
						}
					},
					title: {
						display: true,
						text: 'Distribución por Estado de Items',
						color: 'rgba(255, 255, 255, 0.8)',
						font: {
							size: 16,
							weight: 600
						}
					},
					tooltip: {
						backgroundColor: 'rgba(30, 58, 138, 0.9)',
						titleColor: '#fff',
						bodyColor: '#fff',
						borderColor: 'rgba(255, 255, 255, 0.1)',
						borderWidth: 1,
						padding: 12,
						boxPadding: 6,
						callbacks: {
							label: (context) => {
								const data = context.dataset.data as number[];
								const total = data.reduce((a, b) => a + b, 0);
								const percentage =
									total > 0
										? Math.round(((context.parsed as number) / total) * 100)
										: 0;
								return `${context.label}: ${context.parsed} (${percentage}%)`;
							}
						}
					}
				}
			}
		};

		this.chart = new Chart<'doughnut'>(ctx, config);
	}

	private generateStatusColors(statuses: string[]): string[] {
		const colorMap: { [key: string]: string } = {
			"Cómputo": 'rgba(59, 130, 246, 0.8)',       // Azul
			"Periféricos": 'rgba(139, 92, 246, 0.8)',   // Morado
			"Muebles": 'rgba(16, 185, 129, 0.8)',       // Verde
			"Laboratorio": 'rgba(245, 158, 11, 0.8)',   // Amarillo
			"Papelería": 'rgba(239, 68, 68, 0.8)',      // Rojo
			"Comunicación": 'rgba(236, 72, 153, 0.8)',  // Rosa
			"Electrodomésticos": 'rgba(14, 165, 233, 0.8)'        // Celeste
		};

		return statuses.map(
			(status) => colorMap[status] || 'rgba(59, 130, 246, 0.8)'
		);
	}

	private generateStatusHoverColors(statuses: string[]): string[] {
		const colorMap: { [key: string]: string } = {
			"Cómputo": 'rgba(59, 130, 246, 1)',         // Azul
			"Periféricos": 'rgba(139, 92, 246, 1)',     // Morado
			"Muebles": 'rgba(16, 185, 129, 1)',         // Verde
			"Laboratorio": 'rgba(245, 158, 11, 1)',     // Amarillo
			"Papelería": 'rgba(239, 68, 68, 1)',        // Rojo
			"Comunicación": 'rgba(236, 72, 153, 1)',    // Rosa
			"Electro": 'rgba(14, 165, 233, 1)'          // Celeste
		};

		return statuses.map(
			(status) => colorMap[status] || 'rgba(59, 130, 246, 1)'
		);
	}
}
