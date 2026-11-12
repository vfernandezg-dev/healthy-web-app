import { Component, inject } from '@angular/core';
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-cliente-layout',
    imports: [FooterComponent, NavbarComponent, RouterLink, RouterOutlet],
    templateUrl: './cliente-layout.component.html',
    styleUrl: './cliente-layout.component.css'
})
export class ClienteLayoutComponent {

  private authService = inject(AuthService);
  isAuthenticated: boolean = false;

  logout(): void {
    this.authService.logout();
    this.isAuthenticated = false;
  }
  
}

