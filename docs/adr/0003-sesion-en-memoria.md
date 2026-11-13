# ADR 0003 · Sesión con el access token en memoria

- **Estado:** aceptada
- **Fecha:** 2026-11-11

## Contexto

La versión 1 guardaba un JWT de 30 días en `localStorage`: cualquier XSS podía leerlo y usarlo durante un mes. Un
guard con un bucle de redirecciones dejaba a los administradores en una pantalla en blanco.

La API emite ahora un access token de 15 minutos y un refresh token rotatorio en una cookie `HttpOnly`
([ADR 0002 de la API](https://github.com/vfernandezg-dev/healthybites-backend/blob/main/docs/adr/0002-sesion-con-tokens.md)).

## Decisión

- **`AuthStore`** (signals) guarda la sesión **solo en memoria**. Al arrancar, `provideAppInitializer` intenta un
  refresh silencioso con la cookie antes de la primera navegación. Las claves antiguas de `localStorage` se borran.
- **Interceptor de autenticación:** añade el bearer solo a las peticiones a la API. Ante un 401 por token caducado,
  hace **un único refresh** y reintenta la petición una vez. Si el refresh falla, cierra la sesión y lleva al login
  con `returnUrl`.
- **Un refresh a la vez, también entre pestañas,** con Web Locks: el servidor rota el refresh token en cada uso y
  gastarlo dos veces cerraría la sesión.
- **Cerrar sesión** llama a `/auth/logout` y avisa a las demás pestañas con BroadcastChannel.
- **Guards con `canMatch`** por rol (`/client`, `/nutritionist`, `/admin`): con otro rol se va a la página de inicio
  propia, y el código de las áreas ajenas no se descarga.
- Los tokens de los enlaces de correo van en el fragmento (`#token=…`) y se quitan de la URL al leerlos.

## Consecuencias

- Un XSS ya no se lleva una sesión duradera: el access token caduca en 15 minutos y el refresh token no es legible
  desde JavaScript.
- Recargar la página cuesta un refresh, y la primera navegación espera a que termine.
- Las imágenes y vídeos protegidos no pueden pedirse con el bearer: la API da URLs firmadas de vida corta.
- En desarrollo, el proxy de `pnpm start` pone app y API en el mismo origen para que la cookie funcione sin CORS.

## Alternativas descartadas

- **Token en `localStorage` o `sessionStorage`:** legible por cualquier script de la página.
- **Sesión con cookie de servidor (sin tokens):** obligaría a la API a tener sesión HTTP y protección CSRF en todos
  los endpoints, y complica servir app y API desde subdominios distintos.
- **Refresh por temporizador antes de que caduque:** gasta refresh tokens aunque la pestaña esté inactiva; renovar
  al recibir el 401 basta.
