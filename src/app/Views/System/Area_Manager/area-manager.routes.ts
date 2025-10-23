import { Routes } from '@angular/router';
import { AreaManagerDashboardComponent } from './area-manager-dashboard/area-manager-dashboard.component';
import { AreaManagerScreenComponent } from './area-manager-screen/area-manager-screen.component';
import { AreaManagerProfileComponent } from './Forms/area-manager-profile/area-manager-profile.component';
import { AreaManagerZoneComponent } from './Forms/area-manager-zone/area-manager-zone.component';
import { InventoryBaseComponent } from './Inventory/inventory-base/inventory-base.component';
import { ItemFormOptionsComponent } from './Inventory/item-form-options/item-form-options.component';
import { AreaManagerOperativesComponent } from './area-manager-operatives/area-manager-operatives.component';
import { OperativeFormComponent } from './Forms/operative-form/operative-form.component';
import { AreaManagerOpGroupComponent } from './area-manager-op-group/area-manager-op-group.component';
import { CreateOperativeGroupComponent } from './Forms/create-operative-group/create-operative-group.component';
import { AreaManagerInventoriesComponent } from './area-manager-inventories/area-manager-inventories.component';
import { ZoneReportsComponent } from './Inventory/reports/reports.component';
import { InventoryRequestsComponent } from './Inventory/inventory-requests/inventory-requests.component';


export const AREA_MANAGER_ROUTES: Routes = [
	{
		path: '',
		component: AreaManagerScreenComponent,
		children: [
			{ path: 'dashboard', component:  AreaManagerDashboardComponent},
			{ path: 'profile', component:  AreaManagerProfileComponent},
			{ path: 'zone', component:  AreaManagerZoneComponent},
			{ path: 'inventory-base', component:  InventoryBaseComponent},
			{ path: 'inventory-create-item', component:  ItemFormOptionsComponent},
			{ path: 'inventory-update-item/:id', component:  ItemFormOptionsComponent},
			{ path: 'operatives', component:  AreaManagerOperativesComponent},
			{ path: 'operative-create', component: OperativeFormComponent },
			{ path: 'create-operative-group', component:  CreateOperativeGroupComponent},
			{ path: 'operative-group/:id', component:  AreaManagerOpGroupComponent},
			{ path: 'inventories', component:  AreaManagerInventoriesComponent},
			{ path: 'reports', component:  ZoneReportsComponent},
			{ path: 'inventory-requests', component:  InventoryRequestsComponent},
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full' }
		]
	}
];
