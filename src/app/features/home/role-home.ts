import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowRight, LucideDynamicIcon } from '@lucide/angular';
import { AuthStore } from '../../core/auth/auth-store';
import { NAVIGATION } from '../../layout/app-shell/nav-config';
import { PageHeader } from '../../shared/ui/page-header';

/**
 * Página de inicio de cada rol: saludo y accesos a cada sección. Los paneles con datos (resumen del cliente, del
 * nutricionista y de administración) la sustituyen en sus pasos.
 */
@Component({
  selector: 'app-role-home',
  imports: [RouterLink, LucideDynamicIcon, LucideArrowRight, PageHeader],
  template: `
    <app-page-header
      [title]="greeting()"
      description="¿Qué quieres hacer hoy? Estos son tus accesos directos."
    />
    <ul class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" role="list">
      @for (item of shortcuts(); track item.link) {
        <li>
          <a
            [routerLink]="item.link"
            class="card group flex h-full flex-col gap-3 p-6 transition-shadow hover:shadow-card-hover"
          >
            <span class="grid size-11 place-items-center rounded-2xl bg-brand-50 text-brand-700">
              <svg [lucideIcon]="item.icon"></svg>
            </span>
            <span class="flex items-center gap-2 text-lg font-bold">
              {{ item.label }}
              <svg
                lucideArrowRight
                class="size-4.5 text-brand-700 transition-transform group-hover:translate-x-1"
              ></svg>
            </span>
            <span class="text-muted">{{ item.description }}</span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class RoleHome {
  private readonly auth = inject(AuthStore);

  protected readonly greeting = computed(() => `Hola, ${this.auth.user()?.firstName ?? ''}`);
  protected readonly shortcuts = computed(() => {
    const role = this.auth.role();
    return role ? NAVIGATION[role].filter((item) => item.description) : [];
  });
}
