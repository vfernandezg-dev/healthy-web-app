const LOCK_NAME = 'healthybites-session-refresh';

/**
 * Ejecuta `task` con un cerrojo compartido por todas las pestañas del sitio (Web Locks API). El servidor rota el
 * refresh token en cada uso: si dos pestañas lo usaran a la vez, la segunda gastaría uno ya rotado. Sin soporte de
 * Web Locks (navegadores antiguos), se ejecuta directamente.
 */
export function withRefreshLock<T>(task: () => Promise<T>): Promise<T> {
  const locks = typeof navigator === 'undefined' ? undefined : navigator.locks;
  return locks ? locks.request(LOCK_NAME, task) : task();
}
