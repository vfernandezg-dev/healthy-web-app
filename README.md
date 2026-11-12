# Healthy Bites · Web app

Aplicación web de [Healthy Bites](https://healthybites.vfernandezg.dev), la plataforma de nutrición y
hábitos saludables. Es una SPA en Angular con áreas para clientes y nutricionistas, y consume la API
REST de [`healthy-bites-api`](https://github.com/vfernandezg-dev/healthy-bites-api).

> El proyecto está en plena modernización: ya usa Angular 22; faltan la sesión segura y la interfaz nueva con
> PrimeNG. Este README se ampliará al terminar.

## Requisitos

- **Node 26** (LTS). La versión exacta está en [`.nvmrc`](.nvmrc); con
  [fnm](https://github.com/Schniz/fnm) basta con `fnm use`.
- **pnpm 12**. La versión se fija en `packageManager` (`package.json`). Este proyecto no se instala
  con npm ni con yarn.

## Desarrollo local

```bash
pnpm install
cp .env.example .env   # opcional: los valores por defecto sirven para desarrollo
pnpm start             # http://localhost:4210
```

`pnpm start` redirige `/api` a la API en `http://127.0.0.1:8090` ([`proxy.conf.json`](proxy.conf.json)): app y
API comparten origen, así que la cookie de sesión funciona sin CORS. Para levantar la API, sigue el README de
[`healthy-bites-api`](https://github.com/vfernandezg-dev/healthy-bites-api) (`./mvnw spring-boot:run`).

## Configuración

Las variables se leen en tiempo de compilación con [@ngx-env/builder](https://github.com/chihab/dotenv-run)
desde `.env` o desde el entorno del build. Solo las que empiezan por `NG_APP_` llegan al código y acaban en el
bundle: **aquí nunca va un secreto**.

| Variable         | Por defecto | Uso                                                                      |
| ---------------- | ----------- | ------------------------------------------------------------------------ |
| `NG_APP_API_URL` | `/api/v1`   | URL base de la API. Completa si la API vive en otro origen en producción |

## Sesión

- El **access token** (JWT de 15 minutos) se guarda **solo en memoria**, nunca en `localStorage`.
- El **refresh token** está en una cookie `HttpOnly` que JavaScript no puede leer. Al recargar la página, la
  sesión se restaura con ella antes de la primera navegación.
- Si una petición responde 401 porque el token caducó, la sesión se renueva una vez y la petición se reintenta.
  Un único refresh a la vez, también entre pestañas (Web Locks). Cerrar sesión cierra todas las pestañas.
- Las áreas de cada rol (`/cliente`, `/nutricionista`, `/admin`) están protegidas por rol con `canMatch`.

## Scripts

| Script            | Qué hace                                 |
| ----------------- | ---------------------------------------- |
| `pnpm start`      | Servidor de desarrollo en el puerto 4210 |
| `pnpm build`      | Build de producción en `dist/`           |
| `pnpm test`       | Tests unitarios (Vitest) una vez         |
| `pnpm test:watch` | Tests unitarios en modo observación      |

CI ejecuta `pnpm install --frozen-lockfile`, `pnpm test` y `pnpm build` en cada pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
