import { Routes } from '@angular/router';
import { SubadminScreenComponent } from './subadmin-screen/subadmin-screen.component';
import { SubadminDashboardComponent } from './subadmin-dashboard/subadmin-dashboard.component';
import { SubadminProfileComponent } from './Forms/subadmin-profile/subadmin-profile.component';
import { SubadminBranchComponent } from './Forms/subadmin-branch/subadmin-branch.component';
import { RegisterZoneComponent } from './Forms/register-zone/register-zone.component';
import { SubadminZoneComponent } from './subadmin-zone/subadmin-zone.component';
import { SubadminAreaManagersComponent } from './subadmin-areaManagers/subadmin-areaManagers.component';
import { SubadminCheckersComponent } from './subadmin-checkers/subadmin-checkers.component';
import { RegisterCheckerComponent } from './Forms/register-checker/register-checker.component';




export const SUBADMIN_ROUTES: Routes = [
	{
		path: '',
		component: SubadminScreenComponent,
		children: [
			{ path: 'dashboard', component: SubadminDashboardComponent },
			{ path: 'profile', component: SubadminProfileComponent },
			{ path: 'branch', component: SubadminBranchComponent },
			{ path: 'register-zone', component: RegisterZoneComponent },
			{ path: 'zone/:id', component: SubadminZoneComponent },
			{ path: 'areaManagers-list', component: SubadminAreaManagersComponent },
			{ path: 'checkers-list', component: SubadminCheckersComponent },
			{ path: 'register-checker', component: RegisterCheckerComponent },


			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	}
];
