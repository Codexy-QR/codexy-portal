import { Routes } from '@angular/router';
import { AccessDeniedComponent } from './Components/Shared/access-denied/access-denied.component';
import { RecoveryPasswordComponent } from './Components/Shared/Forms/recovery-password/recovery-password.component';
import { PageNotFoundComponent } from './Components/Shared/page-not-found/page-not-found.component';
import { authGuard } from './Core/Guards/auth.guard';
import { roleGuard } from './Core/Guards/role.guard';
import { LoginComponent } from './Views/Auth/login/login.component';
import { RegisterComponent } from './Views/Auth/register/register.component';
import { LandingComponent } from './Views/System/Landing/landing.component';

export const routes: Routes = [
	{ path: '', component: LandingComponent },
	{ path: 'recovery-password', component: RecoveryPasswordComponent },

	// -----------------------
	// Auth
	// -----------------------
	{ path: 'Login', component: LoginComponent },
	{ path: 'Register', component: RegisterComponent },
	{ path: 'access-denied', component: AccessDeniedComponent },

	// -----------------------
	// SecurityModule
	// -----------------------
	{
		path: 'securitymodule',
		loadChildren: () => import('./Views/SecurityModule/sm.routes').then(m => m.SM_ROUTES),
		canActivate: [authGuard, roleGuard],
		data: { roles: ['SM_ACTION'] }
	},

	// -----------------------
	// System - Admin
	// -----------------------
	{
		path: 'admin',
		loadChildren: () => import('./Views/System/Admin/admin.routes').then(m => m.ADMIN_ROUTES),
		canActivate: [authGuard, roleGuard],
		data: { roles: ['ADMINISTRADOR'] }
	},

	// -----------------------
	// System - Subadmin
	// -----------------------
	{
		path: 'subadmin',
		loadChildren: () => import('./Views/System/Subadmin/subadmin.routes').then(m => m.SUBADMIN_ROUTES),
		canActivate: [authGuard, roleGuard],
		data: { roles: ['SUBADMINISTRADOR'] }
	},

		// -----------------------
	// System - Area_Manager
	// -----------------------
	{
		path: 'areaManager',
		loadChildren: () => import('./Views/System/Area_Manager/area-manager.routes').then(m => m.AREA_MANAGER_ROUTES),
		canActivate: [authGuard, roleGuard],
		data: { roles: ['ENCARGADO_ZONA'] }
	},

	// -----------------------
	// Redirecciones
	// -----------------------
	{ path: '', redirectTo: '', pathMatch: 'full' },
	{ path: '**', component: PageNotFoundComponent },
];
