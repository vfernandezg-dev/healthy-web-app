import { Location } from '@angular/common';
import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Lee el token de un enlace de correo (`#token=…`) y lo quita de la barra de direcciones. Va en el fragmento para
 * que no llegue al servidor ni quede en logs o en el Referer; aquí además se borra del historial.
 * Llamar en el contexto de inyección de la página.
 */
export function takeFragmentToken(): string | null {
  const fragment = inject(ActivatedRoute).snapshot.fragment;
  if (!fragment) {
    return null;
  }
  const location = inject(Location);
  location.replaceState(location.path(false));
  return new URLSearchParams(fragment).get('token')?.trim() || null;
}
