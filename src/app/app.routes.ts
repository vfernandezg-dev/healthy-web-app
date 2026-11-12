import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/auth.guard';
import { authInverseGuard } from './core/guards/auth-inverse.guard';
import { AuthService } from './core/services/auth.service';

export const routes: Routes = [
    // Con sesión, a la página de inicio de su rol; sin ella, al login.
    {path: '', pathMatch: 'full', redirectTo: () => inject(AuthService).homeUrl()},

    {
        path: 'auth',
        loadChildren: () => import('./pages/auth/auth.routes').then(a => a.authRoutes),
        canActivate: [authInverseGuard]
    },
    {
        path: 'cliente',
        loadChildren: () => import('./pages/cliente/cliente.routes').then(c => c.clienteRoutes),
        canMatch: [roleGuard('CLIENTE')]
    },
    {
        path: 'nutricionista',
        loadChildren: () => import('./pages/nutricionista/nutricionista.routes').then(n => n.nutricionistaRoutes),
        canMatch: [roleGuard('NUTRICIONISTA')]
    },
    {
        path: 'admin',
        loadComponent: () => import('./pages/admin/admin-placeholder.component').then(m => m.AdminPlaceholderComponent),
        canMatch: [roleGuard('ADMIN')]
    },
    {
        path: '**',
        loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
