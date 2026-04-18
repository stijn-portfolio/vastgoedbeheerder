// Update app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, ToastComponent, ConfirmationDialogComponent],
  template: `
    <app-nav-bar></app-nav-bar>
    <main class="min-h-screen bg-gray-50">
      <router-outlet></router-outlet>
    </main>
    <app-toast></app-toast>
    <app-confirmation-dialog></app-confirmation-dialog> <!-- Confirmation dialogs toegevoegd -->
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'vastgoedbeheerder';
  
}