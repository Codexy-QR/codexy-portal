import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ShowStaffComponent, TableConfig } from '../../../../Components/Shared/Tables/show-staff/show-staff.component';
import { UserService } from '../../../../Core/Service/SecurityModule/user.service';
import { BranchService } from '../../../../Core/Service/System/branch.service';
import { BranchInChargesMod } from '../../../../Core/Models/System/BranchMod.model';

@Component({
  selector: 'app-admin-subadmins',
  standalone: true,
  imports: [ShowStaffComponent],
  templateUrl: './admin-subadmins.component.html'
})
export class AdminSubadminsComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly userService = inject(UserService);
  private readonly branchService = inject(BranchService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router);

  loading = true;
  error: string | null = null;
  subadmins: BranchInChargesMod[] = [];

  // Configuración para la tabla genérica
  tableConfig: TableConfig = {
    title: 'Encargados de Sucursal',
    subtitle: 'Gestión de usuarios con permisos de Encargado de Sucursal',
    emptyState: {
      icon: 'admin_panel_settings',
      title: 'No hay encargados de Sucursal',
      description: 'Para tener encargados de Sucursal, primero debes crear sucursales y asignarles usuarios.',
      buttonText: 'Crear Sucursal',
      buttonIcon: 'add_business',
      buttonAction: () => this.navigateToBranches()
    },
    columns: [
      {
        key: 'fullName',
        label: 'Nombre Completo',
        type: 'text'
      },
      {
        key: 'phone',
        label: 'Teléfono Celular',
        type: 'icon',
        icon: 'phone',
        formatter: (value) => value || 'No especificado'
      },
      {
        key: 'branchName',
        label: 'Sucursal Asignada',
        type: 'icon',
        icon: 'store',
        formatter: (value) => value || 'Sin asignar'
      }
    ],
    modalSections: [
      {
        title: 'Información Personal',
        icon: 'person',
        fields: [
          { key: 'fullName', label: 'Nombre completo' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Teléfono Celular' }
        ]
      },
      {
        title: 'Documentación',
        icon: 'badge',
        fields: [
          {
            key: 'documentType',
            label: 'Tipo de documento',
            formatter: (value) => this.getDocumentTypeName(value)
          },
          { key: 'documentNumber', label: 'Número de documento' }
        ]
      },
      {
        title: 'Sucursal Asignada',
        icon: 'business',
        fields: [
          { key: 'branchName', label: 'Sucursal' }
        ]
      }
    ]
  };

  documentTypeMap: { [key: string]: string } = {
    "RC": 'Registro Civil',
    "TI": 'Tarjeta de Identidad',
    "CC": 'Cédula de Ciudadanía',
    "CE": 'Cédula de Extranjería',
    "PP": 'Pasaporte',
  };

  ngOnInit(): void {
    this.getInCharges();
  }

  getInCharges(): void {
    this.loading = true;
    this.userService.hasCompany().subscribe({
      next: (data) => {
        if (data.hasCompany && data.companyId) {
          this.branchService.getInCharges(data.companyId).subscribe({
            next: (subadmins) => {
              this.subadmins = subadmins;
              this.loading = false;
            },
            error: (error) => {
              this.loading = false;
              this.error = 'Error al cargar los encargados', error;
            }
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error al verificar la compañía', error;
      }
    });
  }

  getDocumentTypeName(code: string | undefined | null): string {
    return code ? (this.documentTypeMap[code] || code) : '';
  }

  navigateToBranches(): void {
    this.router.navigate(['/admin/register-branch']);
  }

  onRowClick(subadmin: any): void {
    console.log('Subadmin seleccionado:', subadmin);
  }
}
