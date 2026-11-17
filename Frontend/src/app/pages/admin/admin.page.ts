import { Component } from '@angular/core';
import { AdminReportsComponent } from '../../components/admin-reports/admin-reports.component';
import { AdminAccountsComponent } from '../../components/admin-accounts/admin-accounts.component';
import { LocationManagementComponent } from '../../components/location-management/location-management.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-admin.page',
  imports: [NavbarComponent, AdminReportsComponent, AdminAccountsComponent, LocationManagementComponent],
  templateUrl: './admin.page.html',
  styleUrl: './admin.page.scss',
})
export class AdminPage {

}
