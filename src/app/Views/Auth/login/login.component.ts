import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { InitialHeaderComponent } from "../../../Components/System/Landing/initial-header/initial-navbar.component";
import { AuthService } from '../../../Core/Service/Auth/auth.service';
import { RoleRedirectService } from '../../../Core/Service/Auth/role-redirect.service';
import { lastValueFrom } from 'rxjs';
import { AlertTotalService } from '../../../Core/Service/alert-total.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink, MatIconModule, InitialHeaderComponent],
	templateUrl: './login.component.html',
	styleUrl: './login.component.css'
})
export class LoginComponent {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService);
	private readonly roleRedirect = inject(RoleRedirectService);
	private readonly alertService = inject(AlertTotalService);

	// Inyección de servicios nativos de Angular
	private readonly fb = inject(FormBuilder);

	// Signal para controlar el estado del inicio de sesión
	isLoggingIn = signal(false);

	// Variables de estado y control local
	hidePassword = true;
	usernameFocused = false;
	passwordFocused = false;

	// Formulario reactivo del componente
	loginForm = this.fb.group({
		username: ['', Validators.required],
		password: ['', [Validators.required]]
	});

	async onSubmit(): Promise<void> {
		if (this.loginForm.invalid || this.isLoggingIn()) {
			this.loginForm.markAllAsTouched();
			return;
		}

		const { username, password } = this.loginForm.value;
		this.isLoggingIn.set(true);

		try {
			await this.alertService.withLoading(
				async () => {
					const loginResponse = await lastValueFrom(
						this.authService.login({ username: username!, password: password! })
					);

					// Obtener información del usuario después del login
					const userInfo = await lastValueFrom(
						this.authService.refreshUserInfo()
					);

					return loginResponse;
				},
				{
					loadingTitle: 'Iniciando sesión...',
					loadingText: 'Verificando credenciales',
					showSuccessAlert: false,
					errorTitle: 'Error de autenticación',
					errorText: 'Credenciales incorrectas'
				}
			);

			// Redirigir usando el rol obtenido del servicio
			const role = this.authService.getRole();
			this.roleRedirect.redirectUser(role);

		} catch (error: any) {
			console.error('Login error:', error);
		} finally {
			this.isLoggingIn.set(false);
		}
	}

	onForgotPassword(): void {
		this.alertService.inputEmail('Recuperar contraseña', {
			text: 'Ingresa tu correo electrónico',
			confirmButtonText: 'Enviar',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.isConfirmed && result.value) {
				const email = result.value;

				this.alertService.withLoading(
					() => lastValueFrom(this.authService.forgotPassword(email)),
					{
						loadingTitle: 'Enviando solicitud...',
						loadingText: 'Procesando recuperación de contraseña',
						successTitle: 'Solicitud enviada',
						successText: 'Si el email está registrado, recibirás instrucciones en tu bandeja de entrada',
						errorTitle: 'Error',
						errorText: 'Ocurrió un error al procesar la solicitud'
					}
				).then(() => {
					// Limpiar estado local por si el usuario estaba autenticado pero olvidó su contraseña
					this.authService.clearAuthState();
				});
			}
		});
	}

}
