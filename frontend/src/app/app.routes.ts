import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { VastgoedListComponent } from './features/vastgoed/vastgoed-list/vastgoed-list.component';
import { VastgoedDetailComponent } from './features/vastgoed/vastgoed-detail/vastgoed-detail.component';
import { VastgoedFormComponent } from './features/vastgoed/vastgoed-form/vastgoed-form.component';
import { HuurderListComponent } from './features/huurders/huurder-list/huurder-list.component';
import { HuurderFormComponent } from './features/huurders/huurder-form/huurder-form.component';
import { VerhuurderListComponent } from './features/verhuurders/verhuurder-list/verhuurder-list.component';
import { VerhuurderFormComponent } from './features/verhuurders/verhuurder-form/verhuurder-form.component';
import { ContractListComponent } from './features/contracten/contract-list/contract-list.component';
import { ContractFormComponent } from './features/contracten/contract-form/contract-form.component';
import { TransactionListComponent } from './features/transactions/transaction-list/transaction-list.component';
import { TransactionFormComponent } from './features/transactions/transaction-form/transaction-form.component';
// import { CallbackComponent } from './features/auth/callback/callback.component';
// import { AuthGuard } from './core/auth/auth.guard';
import { AuthGuard } from '@auth0/auth0-angular';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: LoginComponent },  
  
  {
    path: 'vastgoed',
    component: VastgoedListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'vastgoed/add',
    component: VastgoedFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:vastgoed' } 
  },
  {
    path: 'vastgoed/edit/:id',
    component: VastgoedFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:vastgoed' } 
  },
  {
    path: 'vastgoed/:id',
    component: VastgoedDetailComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'huurders',
    component: HuurderListComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:huurders' } 
  },
  {
    path: 'huurders/add',
    component: HuurderFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:huurders' } 
  },
  {
    path: 'huurders/edit/:id',
    component: HuurderFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:huurders' } 
  },
  {
    path: 'syndici',
    component: VerhuurderListComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:huurders' } 
  },
  {
    path: 'syndici/add',
    component: VerhuurderFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:huurders' } 
  },
  {
    path: 'syndici/edit/:id',
    component: VerhuurderFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:huurders' } 
  },
  {
    path: 'contracten',
    component: ContractListComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:contracten' } 
  },
  {
    path: 'contracten/add',
    component: ContractFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:contracten' } 
  },
  {
    path: 'contracten/edit/:id',
    component: ContractFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:contracten' } 
  },
  // Nieuwe routes voor transacties
  {
    path: 'transactions',
    component: TransactionListComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:transactions' } 
  },
  {
    path: 'transactions/add',
    component: TransactionFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:transactions' } 
  },
  {
    path: 'transactions/edit/:id',
    component: TransactionFormComponent,
    canActivate: [AuthGuard],
    data: { permission: 'manage:transactions' } 
  },
  {
    path: 'vastgoed/:id/transactions',
    component: TransactionListComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
  
];