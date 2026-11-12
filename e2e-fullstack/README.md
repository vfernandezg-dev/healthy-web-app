# Pruebas contra la API real

Los E2E de [`e2e/`](../e2e) simulan la API. Estos recorridos usan la API de verdad con sus datos de demostración, y
se ejecutan antes de cada release. Cubren lo que un simulacro no puede comprobar:

- la cookie de sesión a través del mismo origen y la sesión que vuelve al recargar;
- que los parámetros que envía la app (orden, filtros, páginas) son los que la API acepta;
- los correos reales: el enlace de invitación llega a Mailpit y crea la cuenta;
- el contrato con la landing (`POST /api/v1/contact` responde 204).

## Cómo ejecutarlos

Los recorridos crean datos (publicaciones, planes, una invitación) y esperan los de demostración recién cargados:
usa una base de datos nueva.

1. Una base de datos y un Mailpit de usar y tirar:

   ```bash
   docker run -d --name hb-e2e-db -p 127.0.0.1:5440:5432 \
     -e POSTGRES_DB=healthybites -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=solo-local \
     postgres:18-alpine
   docker run -d --name hb-e2e-mail -p 127.0.0.1:1026:1025 -p 127.0.0.1:8026:8025 axllent/mailpit:v1.33
   ```

2. La API (desde `healthy-bites-api`, con su `.env` y el jar de `./mvnw package`), con el perfil dev y apuntando a
   esos contenedores y al origen de las pruebas:

   ```bash
   DB_URL=jdbc:postgresql://127.0.0.1:5440/healthybites DB_USERNAME=postgres DB_PASSWORD=solo-local \
   MAIL_PORT=1026 STORAGE_LOCATION=/tmp/hb-e2e-storage \
   APP_FRONTEND_URL=http://localhost:4310 API_PUBLIC_URL=http://localhost:4310/api/v1 \
   CORS_APP_ORIGINS=http://localhost:4310 \
   java -jar target/healthy-bites-*.jar --spring.profiles.active=dev
   ```

3. El build del web-app y los recorridos (el servidor de `dist/` reenvía `/api` a la API):

   ```bash
   pnpm build
   MAILPIT_URL=http://localhost:8026 pnpm test:e2e:fullstack
   ```

4. Al terminar, borra los contenedores: `docker rm -f hb-e2e-db hb-e2e-mail`.
