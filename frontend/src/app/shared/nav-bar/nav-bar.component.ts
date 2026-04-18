import { Component, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { RoleService } from '../../core/auth/role.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  // Signals voor de state van de component
  isMenuOpen = signal(false);
  isAuthenticated = signal(false);
  hasAdminAccess = signal(false);
  isAccountant = signal(false);
 
  constructor(
    public authService: AuthService,
    public roleService: RoleService
  ) {
    // Subscribe en zet de waarde in signals
    this.authService.isAuthenticated().subscribe(isAuth => {
      this.isAuthenticated.set(isAuth);
      
      // Reset andere permissies als niet ingelogd
      if (!isAuth) {
        this.hasAdminAccess.set(false);
        this.isAccountant.set(false);
        return;
      }

      // Alleen checken voor permissies als gebruiker ingelogd is
      this.roleService.hasPermission('manage:all').subscribe(hasAccess => {
        this.hasAdminAccess.set(hasAccess);
      });

      this.roleService.hasPermission('manage:transactions').subscribe(isAcc => {
        this.isAccountant.set(isAcc);
      });
    });
  }

  // Hulpfunctie voor initialen
  getUserInitials(username: string | undefined): string {
    if (!username) return '?';
    
    // Split de naam op spaties
    const nameParts = username.split(' ');
    if (nameParts.length === 1) {
      // Als het één woord is, neem de eerste twee tekens (of één als er maar één is)
      return (nameParts[0].substring(0, 2)).toUpperCase();
    } else {
      // Anders neem de eerste letter van het eerste en laatste deel
      const firstInitial = nameParts[0].charAt(0);
      const lastInitial = nameParts[nameParts.length - 1].charAt(0);
      return (firstInitial + lastInitial).toUpperCase();
    }
  }

  // Methods die de signals updaten
  toggleMenu() {
    this.isMenuOpen.update(current => !current);
  }

  logout() {
    this.authService.logout();
  }
}