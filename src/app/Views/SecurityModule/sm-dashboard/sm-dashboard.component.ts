import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "../../../Components/SecurityModule/Shared/menu/menu.component";

@Component({
	selector: 'app-sm-dashboard',
	standalone: true,
	imports: [RouterOutlet, MenuComponent],
	templateUrl: './sm-dashboard.component.html',
  styleUrl: './sm-dashboard.component.css'
})
export class SMDashboardComponent { }
