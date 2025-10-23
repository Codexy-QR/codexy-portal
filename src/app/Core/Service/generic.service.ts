// ===== SERVICIO GENÉRICO PARA CRUD =====
// Servicio abstracto reutilizable que centraliza las operaciones CRUD básicas (crear, leer,
// actualizar y eliminar) contra una API REST. Utiliza tipos genéricos (TWrite, TRead) para
// diferenciar entre el modelo de escritura y el de lectura, facilitando la reutilización
// en múltiples entidades sin duplicar código.

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export abstract class GenericService<TWrite, TRead> {

	constructor(
		protected http: HttpClient,
		protected baseUrl: string
	) { }

	// Obtiene todos los registros
	getAll(): Observable<TRead[]> {
		return this.http.get<TRead[]>(`${this.baseUrl}GetAll/`);
	}

	// Obtiene un registro por su ID
	getById(id: number): Observable<TRead> {
		return this.http.get<TRead>(`${this.baseUrl}GetById/${id}`);
	}

	// Crea un nuevo registro en la API
	create(item: TWrite): Observable<TRead> {
		return this.http.post<TRead>(`${this.baseUrl}Create/`, item);
	}

	// Actualiza un registro completo (basado en objeto)
	update(item: TWrite): Observable<TRead> {
		return this.http.put<TRead>(`${this.baseUrl}Update/`, item);
	}

	// Elimina un registro por ID con estrategia opcional (0 = lógica, 1 = física, etc.)
	delete(id: number, strategy = 0): Observable<any> {
		return this.http.delete(`${this.baseUrl}Delete/${id}/?strategy=${strategy}`);
	}
}
