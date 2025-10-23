import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { LoaderComponent } from '../../../../Components/Shared/app-loader/app-loader.component';
import { PaginationComponent, PaginationData } from '../../../../Components/Shared/pagination/pagination.component';
import { CheckerService } from '../../../../Core/Service/System/checker.service';
import { CheckersInBranchMod } from '../../../../Core/Models/System/CheckerMod.model';
import { StaffFilterPipe } from '../../../../Core/Pipes/staff-filter.pipe';
import { AuthService } from '../../../../Core/Service/Auth/auth.service';
import { BranchService } from '../../../../Core/Service/System/branch.service';
import { catchError, of } from 'rxjs';
import { AlertTotalService } from '../../../../Core/Service/alert-total.service';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { CheckerVerificationsModalComponent } from "../../../../Components/System/Subadmin/checker-verifications-modal/checker-verifications-modal.component";

@Component({
	selector: 'app-subadmin-checkers',
	standalone: true,
	imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    LoaderComponent,
    StaffFilterPipe,
    PaginationComponent,
    CheckerVerificationsModalComponent
],
	templateUrl: './subadmin-checkers.component.html',
	styleUrl: './subadmin-checkers.component.css'
})
export class SubadminCheckersComponent implements OnInit {

	// Inyección de servicios propios del proyecto
	private readonly authService = inject(AuthService)
	private readonly branchService = inject(BranchService);
	private readonly checkerService = inject(CheckerService);
	private readonly userService = inject(UserService);
	private readonly alertService = inject(AlertTotalService)

	// Inyección de servicios nativos de Angular
	private readonly router = inject(Router);

	// Signals principales del componente
	private readonly _checkers = signal<CheckersInBranchMod[]>([]);
	readonly checkers = signal<CheckersInBranchMod[]>([]);
	currentPage = signal(1);
	readonly isVerificationsModalOpen = signal(false);
	readonly selectedChecker = signal<CheckersInBranchMod | null>(null);

	// Variables de estado y control local
	loading = true;
	error = false;
	errorMessage = '';
	branchId: number | null = null;
	searchText = '';
	itemsPerPage = 5;
	itemsPerPageOptions = [5, 10, 25, 50];

	// Columnas de la tabla
	readonly displayedColumns: string[] = [
		'fullName',
		'documentNumber',
		'phone',
		'actions'
	];

	// Computed properties
	readonly hasData = computed(() => this.checkers().length > 0);

	// Métodos del ciclo de vida del componente
	ngOnInit(): void {
		this.loadCheckers();
	}

	private loadCheckers(): void {
		this.loading = true;
		this.error = false;
		this.errorMessage = '';

		const userIdString = this.authService.getIdUser();
		const idUser = parseInt(userIdString, 10);

		if (isNaN(idUser)) {
			this.handleError('ID de usuario no válido');
			return;
		}

		this.branchService.getByIdInCharge(idUser).pipe(
			catchError(error => {
				console.error('Error al obtener la sucursal:', error);
				this.handleError('Error al obtener la sucursal');
				return of(null);
			})
		).subscribe(branch => {
			if (!branch) {
				console.error('No se pudo obtener la sucursal');
				this.handleError('No se pudo obtener la sucursal');
				return;
			}
			this.branchId = branch.id;

			this.checkerService.getByBranch(this.branchId).pipe(
				catchError(error => {
					this.handleError('Error al cargar el dashboard: ' + error.message);
					return of(null);
				})
			).subscribe(checkers => {
				if (!checkers) {
					this.handleError('No se pudieron cargar los datos del dashboard');
					return;
				}

				this._checkers.set(checkers);
				this.checkers.set(checkers);
				this.loading = false;
			});
		});
	}


	// Computed para datos paginados
	paginatedData(filteredData: any[]): any[] {
		const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
		const endIndex = startIndex + this.itemsPerPage;

		return filteredData.slice(startIndex, endIndex);
	}

	// Computed para la información de paginación
	paginationData(filteredData: any[]): PaginationData {
		const totalItems = filteredData.length;
		const totalPages = Math.ceil(totalItems / this.itemsPerPage);
		const currentPage = this.currentPage();
		const startIndex = (currentPage - 1) * this.itemsPerPage;
		const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);

		return {
			currentPage,
			itemsPerPage: this.itemsPerPage,
			totalItems,
			totalPages,
			startIndex,
			endIndex,
			hasPreviousPage: currentPage > 1,
			hasNextPage: currentPage < totalPages
		};
	}

	// Manejar cambio de página
	onPageChange(page: number): void {
		this.currentPage.set(page);
	}

	// Manejar cambio de tamaño de página
	onPageSizeChange(pageSize: number): void {
		this.itemsPerPage = pageSize;
		this.currentPage.set(1); // Reset a la primera página
	}

	// Método opcional para resetear a página 1 cuando se busca
	onSearchChange(): void {
		this.currentPage.set(1);
	}

	// Métodos de acciones
	registerChecker(): void {
		this.router.navigate(['subadmin/register-checker'])
	}

	viewVerifications(checker: CheckersInBranchMod): void {
		this.selectedChecker.set(checker);
		this.isVerificationsModalOpen.set(true);
	}

	closeVerificationsModal(): void {
		this.isVerificationsModalOpen.set(false);
		this.selectedChecker.set(null);
	}

	deleteChecker(checker: CheckersInBranchMod): void {
		this.alertService.confirmDestroy(
			'¿Eliminar verificador?',
			'El verificador será removido de esta sucursal.',
			'Sí, eliminar'
		).then(result => {
			if (result.isConfirmed) {
				this.userService.delete(checker.userId, 0).subscribe({
					next: () => {
						this.alertService.success(
							'Verificador eliminado',
							'El verificador se eliminó correctamente de la sucursal'
						);
						// Recargar la lista completa
						this.loadCheckers();
					},
					error: (error) => {
						console.error('Error al eliminar verificador:', error);
						this.alertService.error(
							'Error',
							'No se pudo eliminar el verificador. Intente nuevamente.'
						);
					}
				});
			}
		});
	}
	// Método de utilidad para formatear fechas
	formatDate(dateString: string): string {
		if (!dateString) return 'No especificado';

		return new Date(dateString).toLocaleDateString('es-ES', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	private handleError(message: string) {
		this.error = true;
		this.errorMessage = message;
		this.loading = false;
		console.error(message);
	}

	// Método para recargar los datos
	retryLoad(): void {
		this.loadCheckers();
	}
}
