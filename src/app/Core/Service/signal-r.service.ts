import * as signalR from '@microsoft/signalr';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
	providedIn: 'root'
})
export class SignalrService implements OnDestroy {
	private hubConnection: signalR.HubConnection | undefined;
	private topicSubjects: Map<string, Subject<any>> = new Map<string, Subject<any>>();
	private connectionPromise: Promise<void> | null = null;

	public startConnection(): Promise<void> {
		// Evitar múltiples conexiones
		if (this.connectionPromise) {
			return this.connectionPromise;
		}

		this.hubConnection = new signalR.HubConnectionBuilder()
			.withUrl(environment.apiURL + 'appHub', {
				transport: signalR.HttpTransportType.WebSockets,
				withCredentials: true,
			})
			.withAutomaticReconnect()
			.configureLogging(signalR.LogLevel.Warning)
			.build();

		this.connectionPromise = this.hubConnection
			.start()
			.then(() => {
				console.log('SignalR Connection started');
				this.registerTopics();
			})
			.catch(err => {
				console.error('Error while starting SignalR connection: ' + err);
				this.connectionPromise = null; // Permitir reintento
				throw err;
			});

		return this.connectionPromise;
	}

	public stopConnection(): void {
		this.hubConnection?.stop().then(() => {
			console.log('SignalR Connection stopped');
			this.connectionPromise = null;
			this.topicSubjects.clear();
		});
	}

	/**
	 * Escucha un "topic" (método) específico enviado por el servidor.
	 * Es genérico y tipado.
	 */
	public listenToTopic<T>(topic: string): Observable<T> {
		let subject = this.topicSubjects.get(topic) as Subject<T> | undefined;

		if (!subject) {
			subject = new Subject<T>();
			this.topicSubjects.set(topic, subject);

			// Si la conexión ya está activa, registrar el topic
			if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
				this.registerTopic(topic, subject);
			}
		}
		return subject.asObservable();
	}

	/**
	 * Registra todos los topics almacenados cuando se (re)conecta.
	 */
	private registerTopics(): void {
		this.topicSubjects.forEach((subject, topic) => {
			this.registerTopic(topic, subject);
		});
	}

	private registerTopic(topic: string, subject: Subject<any>): void {
		this.hubConnection?.off(topic); // Limpiar listener anterior (seguridad en reconexión)
		this.hubConnection?.on(topic, (data: any) => {
			subject.next(data);
		});
	}

	ngOnDestroy(): void {
		this.stopConnection();
	}
}
