import { NgTemplateOutlet } from '@angular/common';
import { Component, type ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideDynamicIcon, LucideLogOut, LucideMenu } from '@lucide/angular';
import { Avatar } from 'primeng/avatar';
import { ButtonDirective } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { filter, skip } from 'rxjs';
import { AuthStore } from '@core/auth/auth-store';
import { SIGNAL_FORMS_PROVIDERS } from '@shared/forms/forms.config';
import { BrandLogo } from '@shared/ui/brand-logo';
import { ROLE_LABELS } from '@shared/i18n/labels';
import { NAVIGATION } from '@core/routing/navigation';

/**
 * Marco de la aplicación con sesión: menú lateral en escritorio y cajón en móvil, según el rol. Tras cada
 * navegación interna, el foco pasa al contenido (los lectores de pantalla anuncian la página nueva).
 */
@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    LucideDynamicIcon,
    LucideMenu,
    LucideLogOut,
    Avatar,
    ButtonDirective,
    Drawer,
    BrandLogo,
  ],
  providers: [SIGNAL_FORMS_PROVIDERS],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private readonly auth = inject(AuthStore);
  private readonly main = viewChild.required<ElementRef<HTMLElement>>('main');

  protected readonly user = this.auth.user;
  protected readonly home = this.auth.homeUrl;
  protected readonly navigation = computed(() => {
    const role = this.auth.role();
    return role ? NAVIGATION[role] : [];
  });
  protected readonly roleLabel = computed(() => {
    const role = this.auth.role();
    return role ? ROLE_LABELS[role] : '';
  });
  protected readonly initials = computed(() => {
    const user = this.user();
    return user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : '';
  });
  protected readonly menuOpen = signal(false);

  constructor() {
    // La primera navegación es la que crea el marco: ahí el foco se queda al principio de la página (el primer
    // Tab llega a «Saltar al contenido»). En las siguientes pasa al contenido nuevo.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.main().nativeElement.focus({ preventScroll: true });
      });
  }

  protected logout(): void {
    void this.auth.logout();
  }
}
