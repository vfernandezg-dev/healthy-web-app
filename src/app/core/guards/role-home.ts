/** Roles que emite la API. */
export type Role = 'CLIENTE' | 'NUTRICIONISTA' | 'ADMIN';

const HOME_BY_ROLE: Record<Role, string> = {
  CLIENTE: '/cliente/perfil',
  NUTRICIONISTA: '/nutricionista/plan-alimenticio/list',
  ADMIN: '/admin',
};

/** Página de inicio de cada rol; sin sesión (o con un rol desconocido), el login. */
export function homeFor(role: string | null | undefined): string {
  return role && role in HOME_BY_ROLE ? HOME_BY_ROLE[role as Role] : '/auth/login';
}
