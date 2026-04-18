import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: `<div class="loading">Laden...</div>`,
  styles: [`
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  `]
})
export class CallbackComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Auth0 zal het aanmelden afhandelen, wij wachten hier alleen
    this.auth.isLoading$.subscribe(isLoading => {
      if (!isLoading) {
        // Navigeer naar de hoofdpagina na het laden
        this.router.navigate(['/']);
      }
    });
  }
}