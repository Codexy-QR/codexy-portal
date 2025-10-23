import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { MatIconModule } from "@angular/material/icon";

Chart.register(...registerables);

@Component({
	selector: 'app-category-chart',
	standalone: true,
	imports: [CommonModule, MatIconModule],
	templateUrl: './category-chart.component.html',
	styleUrl: './category-chart.component.css'
})
export class CategoryChartComponent implements OnChanges, AfterViewInit, OnDestroy {

	// Inputs principales del componente
	@Input() data!: { [category: string]: number };

	@ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

	// Variables de estado y control local
	hasData = false;
	private chart: Chart | null = null;
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

		const finalCategories = filteredData.map(item => item.status);
		const finalCounts = filteredData.map(item => item.count);

		const config: ChartConfiguration = {
			type: 'bar',
			data: {
				labels: finalCategories,
				datasets: [{
					label: 'Ítems por Categoría',
					data: finalCounts,
					backgroundColor: this.generateGradientColors(finalCategories.length),
					borderColor: 'rgba(255, 255, 255, 0.1)',
					borderWidth: 1,
					borderRadius: 6,
					hoverBackgroundColor: this.generateHoverColors(finalCategories.length)
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false,
					},
					title: {
						display: true,
						text: 'Distribución por Categoría',
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
						boxPadding: 6
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						grid: {
							color: 'rgba(255, 255, 255, 0.1)'
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)'
						}
					},
					x: {
						grid: {
							display: false
						},
						ticks: {
							color: 'rgba(255, 255, 255, 0.7)',
							font: {
								size: 12
							}
						}
					}
				}
			}
		};

		this.chart = new Chart(ctx, config);
	}

	private generateGradientColors(count: number): string[] {
		const baseColors = [
			'rgba(59, 130, 246, 0.8)',
			'rgba(139, 92, 246, 0.8)',
			'rgba(16, 185, 129, 0.8)',
			'rgba(245, 158, 11, 0.8)',
			'rgba(239, 68, 68, 0.8)',
			'rgba(236, 72, 153, 0.8)',
			'rgba(14, 165, 233, 0.8)'
		];

		return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
	}

	private generateHoverColors(count: number): string[] {
		const baseColors = [
			'rgba(59, 130, 246, 1)',
			'rgba(139, 92, 246, 1)',
			'rgba(16, 185, 129, 1)',
			'rgba(245, 158, 11, 1)',
			'rgba(239, 68, 68, 1)',
			'rgba(236, 72, 153, 1)',
			'rgba(14, 165, 233, 1)'
		];

		return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
	}
}
