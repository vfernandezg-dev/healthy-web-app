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
pnpm start      # http://localhost:4210
```

La app espera la API en `http://localhost:8090/api/v1`. Para levantarla, sigue el README de
[`healthy-bites-api`](https://github.com/vfernandezg-dev/healthy-bites-api).

## Scripts

| Script            | Qué hace                                       |
| ----------------- | ---------------------------------------------- |
| `pnpm start`      | Servidor de desarrollo en el puerto 4210       |
| `pnpm build`      | Build de producción en `dist/`                 |
| `pnpm test`       | Tests unitarios (Vitest) una vez               |
| `pnpm test:watch` | Tests unitarios en modo observación            |

CI ejecuta `pnpm install --frozen-lockfile`, `pnpm test` y `pnpm build` en cada pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
