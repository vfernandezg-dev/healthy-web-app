# ADR 0004 · Tipos de la API generados desde el contrato OpenAPI

- **Estado:** aceptada
- **Fecha:** 2026-11-12

## Contexto

La versión 1 definía a mano las interfaces de cada respuesta. Se desalineaban con la API (campos renombrados, ids
cruzados, fechas como texto libre) y los errores aparecían en tiempo de ejecución.

La API publica su contrato en `docs/openapi.yaml`, con los campos obligatorios y los que pueden ser `null`
marcados, y CI comprueba que no cambia sin commitearlo
([ADR 0007 de la API](https://github.com/vfernandezg-dev/healthy-bites-api/blob/main/docs/adr/0007-contrato-openapi.md)).

## Decisión

- **`pnpm api:sync`** copia `docs/openapi.yaml` de la API hermana a `src/app/core/api/openapi.yaml` y anota de qué
  commit sale (`openapi.source.json`).
- **`pnpm api:gen`** genera `src/app/core/api/schema.d.ts` con openapi-typescript: solo tipos, sin código. Los tipos
  raíz (`GroupResponse`, `PostRequest`...) se exportan con su nombre.
- **`pnpm api:check`** (en CI) regenera los tipos y falla si no coinciden con los commiteados.
- Los servicios de datos de cada funcionalidad (`data/*-api.ts`) son finos y están escritos a mano: usan
  `httpResource` y `HttpClient` con esos tipos. No se genera un cliente.

## Consecuencias

- Un cambio de contrato en la API se nota al compilar el web-app, no en producción.
- El contrato es lo que se versiona: los PR de la API que lo cambian obligan a sincronizarlo aquí.
- Los servicios siguen siendo legibles y se adaptan a cada pantalla (signals de parámetros, contexto para no mostrar
  avisos en los formularios).

## Alternativas descartadas

- **Interfaces escritas a mano:** es lo que falló en la versión 1.
- **Cliente generado completo (openapi-generator):** mucho código generado, servicios con observables y sin
  `httpResource`, y más difícil de adaptar a cada pantalla.
- **Compartir un paquete de tipos entre repositorios:** obligaría a publicar y versionar un paquete; copiar el
  contrato con su commit de origen es suficiente.
