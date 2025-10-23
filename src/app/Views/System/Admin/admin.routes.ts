import { Routes } from '@angular/router';
import { AdminScreenComponent } from './admin-screen/admin-screen.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { RegisterCompanyComponent } from './Forms/register-company/register-company.component';
import { AdminWelcomeComponent } from './admin-welcome/admin-welcome.component';
import { AdminProfileComponent } from './Forms/admin-profile/admin-profile.component';
import { AdminCompanyComponent } from './Forms/admin-company/admin-company.component';
import { AdminBranchComponent } from './admin-branch/admin-branch.component';
import { RegisterBranchComponent } from './Forms/register-branch/register-branch.component';
import { AdminSubadminsComponent } from './admin-subadmins/admin-subadmins.component';



export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminScreenComponent,
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'welcome', component: AdminWelcomeComponent },
			{ path: 'register-company', component: RegisterCompanyComponent },
			{ path: 'profile', component: AdminProfileComponent },
			{ path: 'company', component: AdminCompanyComponent },
			{ path: 'register-branch', component: RegisterBranchComponent },
			{ path: 'branch/:id', component: AdminBranchComponent },
			{ path: 'subadmins-list', component: AdminSubadminsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
