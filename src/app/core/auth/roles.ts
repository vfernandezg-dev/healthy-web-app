import type { SessionUser } from '../api/schema';

export type Role = SessionUser['role'];

const HOMES: Readonly<Record<Role, string>> = {
  CLIENT: '/client',
  NUTRITIONIST: '/nutritionist',
  ADMIN: '/admin',
};

/** Página de inicio de cada rol (sin sesión, el login). */
export function homeFor(role: Role | null | undefined): string {
  return role ? HOMES[role] : '/auth/login';
}

/**
 * Valida un `returnUrl` antes de navegar a él: solo rutas internas (nada de `//otro-sitio` ni `https://`) y del
 * espacio del propio rol. Si no vale, devuelve la página de inicio del rol.
 */
export function safeReturnUrl(returnUrl: string | null | undefined, role: Role): string {
  const home = HOMES[role];
  if (
    !returnUrl ||
    !returnUrl.startsWith('/') ||
    returnUrl.startsWith('//') ||
    returnUrl.includes('\\')
  ) {
    return home;
  }
  return returnUrl === home || returnUrl.startsWith(`${home}/`) || returnUrl.startsWith(`${home}?`)
    ? returnUrl
    : home;
}
