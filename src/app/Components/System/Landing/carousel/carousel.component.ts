import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
	selector: 'app-carousel',
	standalone: true,
	imports: [CommonModule, MatIconModule, MatButtonModule],
	templateUrl: './carousel.component.html',
	styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
	currentIndex = 0;
	autoSlideInterval: any;
	isTransitioning = false;

	images = [
		{
			src: '/img/Carousel/img_01.png',
			alt: 'Gestión de Inventario',
			title: 'Gestión Inteligente',
			description: 'Controla tu inventario de manera eficiente con códigos QR'
		},
		{
			src: '/img/Carousel/img_02.png',
			alt: 'Escaneo QR',
			title: 'Tecnología QR',
			description: 'Escanea y gestiona productos al instante'
		},
		{
			src: '/img/Carousel/img_03.png',
			alt: 'Dashboard Analytics',
			title: 'Análisis Avanzado',
			description: 'Obtén insights valiosos de tu inventario'
		}
	];

	// Métodos del ciclo de vida del componente
	ngOnInit() {
		this.startAutoSlide();
	}

	ngOnDestroy() {
		this.stopAutoSlide();
	}

	startAutoSlide() {
		this.autoSlideInterval = setInterval(() => {
			this.nextSlide();
		}, 5000);
	}

	stopAutoSlide() {
		if (this.autoSlideInterval) {
			clearInterval(this.autoSlideInterval);
		}
	}

	nextSlide() {
		if (this.isTransitioning) return;

		this.isTransitioning = true;
		this.currentIndex = (this.currentIndex + 1) % this.images.length;

		setTimeout(() => {
			this.isTransitioning = false;
		}, 500);
	}

	prevSlide() {
		if (this.isTransitioning) return;

		this.isTransitioning = true;
		this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;

		setTimeout(() => {
			this.isTransitioning = false;
		}, 500);
	}

	goToSlide(index: number) {
		if (this.isTransitioning || index === this.currentIndex) return;

		this.isTransitioning = true;
		this.currentIndex = index;

		setTimeout(() => {
			this.isTransitioning = false;
		}, 500);
	}

	onMouseEnter() {
		this.stopAutoSlide();
	}

	onMouseLeave() {
		this.startAutoSlide();
	}
}
