import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, inject, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './Core/Interceptors/auth.interceptor';
import { AuthService } from './Core/Service/Auth/auth.service';

// Inicializador de autenticación
export function initializeAuth(): () => Promise<void> {
	const authService = inject(AuthService);

	return () => {
		return new Promise<void>((resolve) => {
			authService.checkAuthentication().subscribe({
				next: (isAuthenticated) => {
					if (!isAuthenticated) {
						// NO redirigir aquí - dejar que los guards manejen la navegación
					}
					resolve();
				},
				error: (error) => {
					// En caso de error, simplemente resolver para que la app cargue
					resolve();
				}
			});
		});
	};
}

export const appConfig: ApplicationConfig = {
	providers: [
		provideAnimations(),
		provideHttpClient(
			withFetch(),
			withInterceptors([authInterceptor])
		),
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),

		// Inicializador de autenticación
		{
			provide: APP_INITIALIZER,
			useFactory: initializeAuth,
			multi: true
		}
	]
};
