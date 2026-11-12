import { type EffectRef, Injectable, effect, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { type RouterStateSnapshot, TitleStrategy } from '@angular/router';

const APP_NAME = 'Healthy Bites';

/** «{página} · Healthy Bites», o solo el nombre de la app. */
export function documentTitle(page: string | null | undefined): string {
  return page ? `${page} · ${APP_NAME}` : APP_NAME;
}

/** Título de la pestaña: el de la ruta con el nombre de la app (ver {@link documentTitle}). */
@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(documentTitle(this.buildTitle(snapshot)));
  }
}

/**
 * Pone en la pestaña el nombre de lo que muestra la página (un plan, un contenido, un grupo) cuando llega de la
 * API: la ruta solo puede tener un título genérico. Se llama al crear el componente (contexto de inyección).
 */
export function titleFrom(name: () => string | null | undefined): EffectRef {
  const title = inject(Title);
  return effect(() => {
    const value = name();
    if (value) {
      title.setTitle(documentTitle(value));
    }
  });
}
