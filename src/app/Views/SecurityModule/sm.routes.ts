import { Routes } from '@angular/router';
import { SMLandingComponent } from '../../Components/SecurityModule/Shared/SM-Landing/landing.component';
import { CreateFormComponent } from './Form/create-form/create-form.component';
import { IndiceFormComponent } from './Form/indice-form/indice-form.component';
import { UpdateFormComponent } from './Form/update-form/update-form.component';
import { CreateFormModuleComponent } from './FormModule/create-form-module/create-form-module.component';
import { IndiceFormModuleComponent } from './FormModule/indice-form-module/indice-form-module.component';
import { UpdateFormModuleComponent } from './FormModule/update-form-module/update-form-module.component';
import { CreateModuleComponent } from './Module/create-module/create-module.component';
import { IndiceModuleComponent } from './Module/indice-module/indice-module.component';
import { UpdateModuleComponent } from './Module/update-module/update-module.component';
import { CreatePermissionComponent } from './Permission/create-permission/create-permission.component';
import { IndicePermissionComponent } from './Permission/indice-permission/indice-permission.component';
import { UpdatePermissionComponent } from './Permission/update-permission/update-permission.component';
import { CreatePersonComponent } from './Person/create-person/create-person.component';
import { IndicePersonComponent } from './Person/indice-person/indice-person.component';
import { UpdatePersonComponent } from './Person/update-person/update-person.component';
import { CreateRoleComponent } from './Role/create-role/create-role.component';
import { IndiceRoleComponent } from './Role/indice-role/indice-role.component';
import { UpdateRoleComponent } from './Role/update-role/update-role.component';
import { CreateRoleFormPermissionComponent } from './RoleFormPermission/create-role-form-permission/create-role-form-permission.component';
import { IndiceRoleFormPermissionComponent } from './RoleFormPermission/indice-role-form-permission/indice-role-form-permission.component';
import { UpdateRoleFormPermissionComponent } from './RoleFormPermission/update-role-form-permission/update-role-form-permission.component';
import { SMDashboardComponent } from './sm-dashboard/sm-dashboard.component';
import { CreateUserComponent } from './User/create-user/create-user.component';
import { IndiceUserComponent } from './User/indice-user/indice-user.component';
import { UpdateUserComponent } from './User/update-user/update-user.component';
import { CreateUserRoleComponent } from './UserRole/create-user-role/create-user-role.component';
import { IndiceUserRoleComponent } from './UserRole/indice-user-role/indice-user-role.component';
import { UpdateUserRoleComponent } from './UserRole/update-user-role/update-user-role.component';


export const SM_ROUTES: Routes = [
  {
    path: '',
    component: SMDashboardComponent,
    children: [
      { path: 'Landing', component: SMLandingComponent },
      { path: '', redirectTo: 'Landing', pathMatch: 'full' },

      { path: 'Person', component: IndicePersonComponent },
      { path: 'Person/Create', component: CreatePersonComponent },
      { path: 'Person/Update/:id', component: UpdatePersonComponent },

			{ path: 'User', component: IndiceUserComponent },
      { path: 'User/Create', component: CreateUserComponent },
      { path: 'User/Update/:id', component: UpdateUserComponent },

			{ path: 'Role', component: IndiceRoleComponent },
      { path: 'Role/Create', component: CreateRoleComponent },
      { path: 'Role/Update/:id', component: UpdateRoleComponent },

			{ path: 'UserRole', component: IndiceUserRoleComponent },
      { path: 'UserRole/Create', component: CreateUserRoleComponent },
      { path: 'UserRole/Update/:id', component: UpdateUserRoleComponent },

			{ path: 'Form', component: IndiceFormComponent },
      { path: 'Form/Create', component: CreateFormComponent },
      { path: 'Form/Update/:id', component: UpdateFormComponent },

			{ path: 'Module', component: IndiceModuleComponent },
      { path: 'Module/Create', component: CreateModuleComponent },
      { path: 'Module/Update/:id', component: UpdateModuleComponent },

			{ path: 'FormModule', component: IndiceFormModuleComponent },
      { path: 'FormModule/Create', component: CreateFormModuleComponent },
      { path: 'FormModule/Update/:id', component: UpdateFormModuleComponent },

			{ path: 'Permission', component: IndicePermissionComponent },
      { path: 'Permission/Create', component: CreatePermissionComponent },
      { path: 'Permission/Update/:id', component: UpdatePermissionComponent },

			{ path: 'RoleFormPermission', component: IndiceRoleFormPermissionComponent },
      { path: 'RoleFormPermission/Create', component: CreateRoleFormPermissionComponent },
      { path: 'RoleFormPermission/Update/:id', component: UpdateRoleFormPermissionComponent },
    ]
  }
];
