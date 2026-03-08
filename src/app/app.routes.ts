import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'assets', loadComponent: () => import('./components/asset-list/asset-list.component').then(m => m.AssetListComponent), canActivate: [authGuard] },
  { path: 'assets/add', loadComponent: () => import('./components/asset-form/asset-form.component').then(m => m.AssetFormComponent), canActivate: [adminGuard] },
  { path: 'assets/edit/:id', loadComponent: () => import('./components/asset-form/asset-form.component').then(m => m.AssetFormComponent), canActivate: [adminGuard] },
  { path: 'assets/:id', loadComponent: () => import('./components/asset-detail/asset-detail.component').then(m => m.AssetDetailComponent), canActivate: [authGuard] },
  { path: 'transactions', loadComponent: () => import('./components/transaction-list/transaction-list.component').then(m => m.TransactionListComponent), canActivate: [authGuard] },
  { path: 'transactions/add', loadComponent: () => import('./components/transaction-form/transaction-form.component').then(m => m.TransactionFormComponent), canActivate: [authGuard] },
  { path: 'favorites', loadComponent: () => import('./components/favorite-list/favorite-list.component').then(m => m.FavoriteListComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];