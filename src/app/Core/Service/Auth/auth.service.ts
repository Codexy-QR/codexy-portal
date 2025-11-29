// ===== SERVICIO DE AUTENTICACIÓN =====
// Gestiona el flujo de autenticación del usuario: login, registro, recuperación de contraseñas,
// validación de tokens JWT y extracción de información del payload. Además, maneja la
// persistencia del token en localStorage y provee utilidades para validar roles y sesiones.

import { HttpClient, HttpRequest } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RoleMod } from '../../Models/SecurityModule/RoleMod.model';
import { SignalrService } from '../signal-r.service';

export interface UserInfo {
	userId: number;
	personId: number;
	username: string;
	role: string;
}

@Injectable({
	providedIn: 'root'
})
export class AuthService {

	private readonly http = inject(HttpClient);
	private readonly router = inject(Router);
	private readonly signalrService = inject(SignalrService);

	private readonly baseUrl = `${environment.apiURL}api/Auth/`;

	// Signal para almacenar la información del usuario
	private currentUser = signal<UserInfo | null>(null);
	private isAuthChecked = signal(false);

	// Variables de estado y control local
	private refreshInProgress = false;
	private refreshSubject = new BehaviorSubject<HttpRequest<any> | null>(null);
	private refreshTimer: any;
	private pendingRequests: HttpRequest<any>[] = [];
	private isRefreshing = false;

	constructor() { }

	login(credentials: { username: string; password: string }): Observable<{ message: string }> {
		return this.http.post<{ message: string }>(`${this.baseUrl}Login`, credentials, {
			withCredentials: true
		}).pipe(
			tap(() => {
				this.isAuthChecked.set(true);
				this.onTokensRefreshed(); // Iniciar timer después del login

				// Conectar a SignalR después de un login exitoso.
				this.signalrService.startConnection().catch(err => {
					console.error("Fallo al iniciar SignalR post-login", err);
				});
			})
		);
	}

	// Valida las credenciales sin generar token
	validateLogin(credentials: { username: string; password: string }) {
		return this.http.post<boolean>(`${this.baseUrl}ValidateLogin`, credentials);
	}

	// Registra un nuevo usuario
	register(userData: {
		username: string;
		password: string;
		name: string;
		lastName: string;
		email: string;
		documentType: string;
		documentNumber: string;
		phone: string;
	}): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}Register`, userData);
	}

	// Cierra sesión
	logout(): Observable<{ message: string }> {
		return this.http.post<{ message: string }>(`${this.baseUrl}Logout`, {}, {
			withCredentials: true
		}).pipe(
			tap(() => {
				// clearAuthState() ahora también detendrá SignalR
				this.clearAuthState();
			})
		);
	}

	// Agregar request a la cola
	addPendingRequest(request: HttpRequest<any>): void {
		this.pendingRequests.push(request);
	}

	// Procesar todos los requests pendientes después del refresh
	private processPendingRequests(): void {
		this.pendingRequests.forEach(request => {
			this.refreshSubject.next(request);
		});
		this.pendingRequests = [];
		this.isRefreshing = false;
	}

	// Verificar estado de refresh
	isRefreshInProgress(): boolean {
		return this.isRefreshing;
	}

	// Obtener observable de refresh
	getRefreshObservable(): Observable<any> {
		return this.refreshSubject.asObservable();
	}

	private scheduleTokenRefresh(): void {
		// Limpiar timer existente
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
		}

		// Calcular tiempo para refresh (ej: 5 minutos antes de expirar)
		const refreshTime = 5 * 60 * 1000; // 5 minutos

		this.refreshTimer = setTimeout(() => {
			if (this.isAuthenticated()) {
				console.log('🔄 Refresh token proactivo');
				this.refreshToken().subscribe();
			}
		}, refreshTime);
	}

	// Llamar este método después de login y después de cada refresh exitoso
	private onTokensRefreshed(): void {
		this.scheduleTokenRefresh();
	}

	// Actualizar el método refreshToken
	refreshToken(): Observable<{ message: string }> {
		this.isRefreshing = true;
		this.refreshInProgress = true;

		return this.http.post<{ message: string }>(`${this.baseUrl}Refresh`, {}, {
			withCredentials: true
		}).pipe(
			tap(() => {
				console.log('✅ Token refrescado exitosamente');
				this.isRefreshing = false;
				this.refreshInProgress = false;
				this.onTokensRefreshed();
				this.processPendingRequests();

				// --- [NUEVO] ---
				// Asegurar que la conexión de SignalR esté activa después de un refresh.
				// La lógica 'connectionPromise' en el servicio evitará conexiones duplicadas.
				this.signalrService.startConnection().catch(err => {
					console.error("Fallo al (re)iniciar SignalR post-refresh", err);
				});
				// --- [FIN NUEVO] ---
			}),
			catchError((error) => {
				console.error('❌ Error refrescando token:', error);
				this.isRefreshing = false;
				this.refreshInProgress = false;

				// clearAuthState() detendrá SignalR
				this.clearAuthState();

				if (this.refreshTimer) {
					clearTimeout(this.refreshTimer);
				}
				this.router.navigate(['/Login']);
				return throwError(() => error);
			})
		);
	}

	// Obtiene todos los roles disponibles
	getAllRoles(): Observable<RoleMod[]> {
		return this.http.get<RoleMod[]>(`${this.baseUrl}GetAllRoles/`);
	}

	// Envía solicitud para recuperar contraseña
	forgotPassword(email: string): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}forgot-password`, { email });
	}

	// Valida un token de recuperación
	validateRecoveryToken(token: string): Observable<any> {
		return this.http.get<any>(`${this.baseUrl}validate-recovery-token?token=${token}`);
	}

	// Restablece la contraseña
	resetPassword(data: { token: string; newPassword: string; }): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}reset-password`, data, {
			withCredentials: true
		});
	}

	// ========== MÉTODOS PARA COOKIES ==========

	// Obtiene información del usuario desde el backend
	getCurrentUserInfo(): Observable<UserInfo> {
		return this.http.get<UserInfo>(`${this.baseUrl}Me`, {
			withCredentials: true
		}).pipe(
			tap(userInfo => {
				this.currentUser.set(userInfo);
				this.isAuthChecked.set(true);

				// --- [NUEVO] ---
				// Punto clave para la inicialización (APP_INITIALIZER).
				// Si 'Me' es exitoso, estamos autenticados. Conectar SignalR.
				this.signalrService.startConnection().catch(err => {
					console.error("Fallo al iniciar SignalR en check-auth", err);
				});
				// --- [FIN NUEVO] ---
			}),
			catchError(error => {
				if (error.status === 401) {
					console.log('🔐 Usuario no autenticado - comportamiento esperado');
				} else {
					console.error('❌ Error obteniendo user info:', error);
				}
				this.currentUser.set(null);
				this.isAuthChecked.set(true);

				// --- [NUEVO] ---
				// Si 'Me' falla (401 o error), nos aseguramos de detener
				// cualquier conexión SignalR que pudiera estar activa/intentando.
				this.signalrService.stopConnection();
				// --- [FIN NUEVO] ---

				throw error;
			})
		);
	}

	// Verifica autenticación llamando al backend
	checkAuthentication(): Observable<boolean> {
		return this.getCurrentUserInfo().pipe(
			tap(userInfo => {
				console.log('✅ Usuario autenticado al inicializar:', userInfo);
				this.currentUser.set(userInfo);
				this.isAuthChecked.set(true);
				// (La conexión de SignalR se inicia dentro de getCurrentUserInfo)
			}),
			map(() => true),
			catchError((error) => {
				console.log('🔐 Usuario no autenticado o error:', error.status);
				this.currentUser.set(null);
				this.isAuthChecked.set(true);
				// (El stop de SignalR se maneja dentro de getCurrentUserInfo)
				return of(false);
			})
		);
	}

	// Limpia el estado local de autenticación
	clearAuthState(): void {
		this.currentUser.set(null);
		this.isAuthChecked.set(true);

		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}

		this.pendingRequests = [];
		this.isRefreshing = false;
		this.refreshInProgress = false;
		this.refreshSubject.next(null);

		// --- [NUEVO] ---
		// Punto centralizado para detener SignalR.
		// Se llama en logout() y en el catchError de refreshToken().
		this.signalrService.stopConnection();
		// --- [FIN NUEVO] ---
	}

	// ========== MÉTODOS COMPATIBLES (misma interfaz) ==========

	// Verifica si está autenticado (usa cache local + verificación)
	isAuthenticated(): boolean {
		return this.currentUser() !== null;
	}

	// Obtiene el ID del usuario
	getIdUser(): string {
		return this.currentUser()?.userId?.toString() || '';
	}

	// Obtiene el ID de la persona
	getIdPerson(): string {
		return this.currentUser()?.personId?.toString() || '';
	}

	// Obtiene el rol
	getRole(): string {
		return this.currentUser()?.role || '';
	}

	// Obtiene el username
	getUsername(): string {
		return this.currentUser()?.username || '';
	}

	// Obtiene toda la información del usuario
	getUserInfo(): UserInfo | null {
		return this.currentUser();
	}

	// Force refresh de la información del usuario
	refreshUserInfo(): Observable<UserInfo> {
		return this.getCurrentUserInfo();
	}

	// Verifica si ya se hizo la verificación inicial de autenticación
	isAuthInitialized(): boolean {
		return this.isAuthChecked();
	}
}
