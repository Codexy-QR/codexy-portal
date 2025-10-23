// ==================================================
// Directiva: NumericInputDirective
// ==================================================
// Esta directiva restringe la entrada de texto a valores numéricos únicamente.
// También limita el número de caracteres según el valor definido en `maxLength`.

import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
	selector: '[appNumericInput]',
	standalone: true
})
export class NumericInputDirective {

	// Input principal de la directiva: cantidad máxima de caracteres permitidos
	@Input() maxLength: number = Infinity;

	// Constructor para obtener referencia directa al elemento del DOM
	constructor(
		private el: ElementRef<HTMLInputElement>,
		private renderer: Renderer2
	) { }


	// Evento host: previene que se escriban caracteres no numéricos
	@HostListener('keydown', ['$event'])
	onKeyDown(event: KeyboardEvent): void {
		const allowedKeys = [
			'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'
		];

		// Permitir navegación y borrado
		if (allowedKeys.includes(event.key)) return;

		// Bloquear si ya alcanzó el máximo de caracteres
		const input = event.target as HTMLInputElement;
		if (input.value.length >= this.maxLength) {
			event.preventDefault();
			return;
		}

		// Permitir solo dígitos (0-9)
		if (!/^\d$/.test(event.key)) {
			event.preventDefault();
		}
	}

	// Evento host: ejecutado cada vez que cambia el valor del input
	@HostListener('input', ['$event'])
	onInput(event: Event): void {
		const input = event.target as HTMLInputElement;
		let value = input.value.replace(/\D/g, '');

		if (value.length > this.maxLength) {
			value = value.substring(0, this.maxLength);
		}

		// Solo actualizamos si cambió
		if (input.value !== value) {
			this.renderer.setProperty(input, 'value', value);
			// No disparamos otro evento aquí
		}
	}

	// Evento host: ejecutado cuando se pega texto en el input
	@HostListener('paste', ['$event'])
	onPaste(event: ClipboardEvent): void {
		event.preventDefault();
		const input = event.target as HTMLInputElement;
		const paste = event.clipboardData?.getData('text') || '';

		let value = paste.replace(/\D/g, '');
		if (value.length > this.maxLength) {
			value = value.substring(0, this.maxLength);
		}

		this.renderer.setProperty(input, 'value', value);
		// Notificamos al FormControl solo en este caso
		input.dispatchEvent(new Event('input', { bubbles: true }));
	}

	// Método privado para dar formato y validar el valor ingresado
	private formatValue(input: HTMLInputElement): void {
		let value = input.value.replace(/\D/g, '');
		if (value.length > this.maxLength) {
			value = value.substring(0, this.maxLength);
		}
		input.value = value;
		input.dispatchEvent(new Event('input', { bubbles: true }));
	}
}
