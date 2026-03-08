import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent {
  menuOpen = false;
  
  constructor(public authService: AuthService) {}
  
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  
  logout() {
    this.authService.logout();
    window.location.href = '/login';
  }
}