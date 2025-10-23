import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { BaseTableComponent } from '../../../../Components/SecurityModule/Base/base-table/base-table.component';
import { ModuleMod } from '../../../../Core/Models/SecurityModule/ModuleMod.model';
import { ModuleService } from '../../../../Core/Service/SecurityModule/module.service';

@Component({
  selector: 'app-indice-module',
  standalone: true,
  imports: [MatCardModule, BaseTableComponent, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './indice-module.component.html',
  styleUrl: './indice-module.component.css'
})
export class IndiceModuleComponent implements OnInit {

	// Inyección de servicios propios del proyecto
  private readonly moduleService = inject(ModuleService);

	// Inyección de servicios nativos de Angular
  private readonly router = inject(Router)

  moduleData : ModuleMod[] = [];
  columnasMostrar : string[] = [
    'N°', 'name', 'description', 'active'
  ];

  ngOnInit(): void {
    this.cargarModules();
  }

  cargarModules(): void {
    this.moduleService.getAllJWT().subscribe({
      next: (data) => {
        this.moduleData = data;
        // console.log(data);
      },
      error: (err) => {
        console.log('Error al cargar los datos:', err);
        const mensajeCompleto = err?.error?.message || 'Ocurrio un error inesperado.';
        const mensaje = mensajeCompleto.split(':')[1]?.trim() || mensajeCompleto;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: mensaje,
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  eliminarModule(module: ModuleMod): void {
    Swal.fire({
      title: '¿Qué tipo de eliminación deseas?',
      text: `Module: ${module.name}`,
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Lógica',
      denyButtonText: 'Permanente',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      denyButtonColor: '#d33',
    }).then(result => {
      if (result.isConfirmed) {
        this.moduleService.delete(module.id, 0).subscribe(() => {
          Swal.fire('Eliminacion Logica ✅', '', 'success');
          this.cargarModules();
        });
      } else if (result.isDenied) {
        this.moduleService.delete(module.id, 1).subscribe(() => {
          Swal.fire('Eliminacion Permanente ✅', '', 'success');
          this.cargarModules();
        });
      }
    });
  }

  editarModule(module: ModuleMod): void {
    this.router.navigate([`/securitymodule/Module/Update/${module.id}`]);
  }
}
