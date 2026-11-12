// Generado con `pnpm api:gen` a partir de openapi.yaml (openapi-typescript). No lo edites a mano.

export interface paths {
    "/admin/billing/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Suscripciones vigentes por nivel, ingreso mensual recurrente e ingresos de 30 días */
        get: operations["summary_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/moderation/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Denuncias por estado (por defecto, las abiertas) */
        get: operations["reports"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/moderation/reports/{id}/resolve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Oculta lo denunciado (cierra todas sus denuncias) o descarta la denuncia */
        post: operations["resolve"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/nutritionist-invitations": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lista las invitaciones con su estado */
        get: operations["list"];
        put?: never;
        /** Invita a un nutricionista: recibe un enlace por correo para crear su cuenta */
        post: operations["invite"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/nutritionist-invitations/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Revoca una invitación pendiente */
        delete: operations["revoke"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/nutritionist-invitations/{id}/resend": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reenvía la invitación con un enlace nuevo (el anterior deja de valer) */
        post: operations["resend"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pagos por estado */
        get: operations["payments_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/subscriptions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Suscripciones por estado y nivel */
        get: operations["subscriptions"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Busca cuentas por rol, estado y texto (nombre o correo) */
        get: operations["search"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/users/summary": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Totales por rol y estado y altas de los últimos 30 días */
        get: operations["summary"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/users/{id}/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reactiva una cuenta */
        post: operations["activate"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/admin/users/{id}/deactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Desactiva una cuenta y cierra sus sesiones */
        post: operations["deactivate_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Pide un enlace para restablecer la contraseña
         * @description Siempre 202, exista o no la cuenta: la respuesta no revela qué correos están registrados.
         */
        post: operations["forgotPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/invitations/accept": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Acepta la invitación: crea la cuenta de nutricionista con su contraseña */
        post: operations["acceptInvitation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/invitations/preview": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Datos de una invitación de nutricionista (para mostrarlos antes de aceptar) */
        post: operations["previewInvitation"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Abre una sesión: access token en el cuerpo y refresh token en una cookie httpOnly */
        post: operations["login"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cierra la sesión: revoca el refresh token y borra la cookie */
        post: operations["logout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Renueva la sesión con la cookie del refresh token, que se rota en cada uso */
        post: operations["refresh"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Registro público de clientes
         * @description Crea la cuenta y su perfil. Para entrar, el web-app inicia sesión con las mismas credenciales.
         */
        post: operations["register"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/auth/reset-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cambia la contraseña con el token del enlace y cierra todas las sesiones del usuario */
        post: operations["resetPassword"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["deleteComment"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/comments/{id}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["reportComment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/contact": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Envía un mensaje al equipo (204, 422, 429 o 503) */
        post: operations["sendMessage"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/content-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Contenido publicado, con filtros; locked indica si el usuario no puede abrirlo */
        get: operations["catalog_2"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/content-items/{id}/file": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Enlace firmado y temporal al fichero del contenido (vídeo, PDF...) */
        get: operations["file"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/content-items/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle con el cuerpo (403 subscription-required, con requiredTier, si está bloqueado) */
        get: operations["detail_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/groups": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Directorio de grupos (públicos y privados) con mi membresía */
        get: operations["directory"];
        put?: never;
        post: operations["create_3"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/groups/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["group"];
        put: operations["update_4"];
        post?: never;
        delete: operations["delete_2"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/groups/{id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Miembros (el creador ve también las solicitudes pendientes) */
        get: operations["members"];
        put?: never;
        /** Entra en un grupo público o pide entrar en uno privado */
        post: operations["join"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/groups/{id}/members/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["leave"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/groups/{id}/members/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Rechaza una solicitud o expulsa a un miembro (solo el creador) */
        delete: operations["remove"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/groups/{id}/members/{userId}/approve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["approve"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/groups/{id}/posts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["posts"];
        put?: never;
        post: operations["publish_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Usuario actual con el perfil de su rol */
        get: operations["me"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/content-unlocks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Contenido que he desbloqueado */
        get: operations["unlocked"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["goals"];
        put?: never;
        /** Crea una meta (solo puede haber una activa) */
        post: operations["createGoal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["goal"];
        put: operations["updateGoal"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals/{id}/abandon": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["abandon"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals/{id}/complete": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["complete"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals/{id}/recommendation": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Rango de peso saludable para tu altura y estimación del tiempo hasta el objetivo */
        get: operations["recommendation"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals/{id}/status-history": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["history"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals/{id}/weight-entries": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pesajes de la meta en un rango de fechas (todos si no hay rango), del más antiguo al último */
        get: operations["weights"];
        put?: never;
        post: operations["addWeight"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/goals/{id}/weight-entries/{entryId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["updateWeight"];
        post?: never;
        delete: operations["deleteWeight"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/habit-logs": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Registros de hábitos en un rango (por defecto, los últimos 30 días) */
        get: operations["habitLogs"];
        put?: never;
        /** Registra los hábitos de hoy (o de ayer); cuenta para las rachas */
        post: operations["logHabits"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/habit-logs/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["updateHabits"];
        post?: never;
        delete: operations["deleteHabits"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/meal-plan-enrollments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Planes que sigo */
        get: operations["enrollments"];
        put?: never;
        /** Empiezo a seguir un plan (hay que poder abrirlo) */
        post: operations["enroll"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/meal-plan-enrollments/{mealPlanId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Dejo de seguir un plan (los desbloqueados con una recompensa se conservan) */
        delete: operations["unenroll"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /**
         * Cambia la contraseña
         * @description Cierra todas las sesiones (también en otros dispositivos) y devuelve una nueva.
         */
        put: operations["changePassword"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Pagos del usuario */
        get: operations["payments"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/profile": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** Actualiza el nombre y los datos del perfil */
        put: operations["update_3"];
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/streaks": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["streaks"];
        put?: never;
        /** Empieza una racha: cuenta cada día que registres tus hábitos */
        post: operations["start"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/streaks/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete: operations["abandon_1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/subscription": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Nivel vigente del usuario y la suscripción que lo da */
        get: operations["current"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/subscription/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Cancela la renovación; el acceso sigue hasta el fin del período pagado */
        post: operations["cancel"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/subscription/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Empieza el pago de un plan
         * @description Devuelve la URL de PayPal donde el usuario aprueba el pago. PayPal vuelve a /client/subscription/checkout/return (o /cancel) del web-app.
         */
        post: operations["checkout"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/me/subscription/checkout/capture": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Captura el pago aprobado y activa la suscripción (idempotente) */
        post: operations["capture"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meal-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Planes publicados; locked indica si el usuario no puede abrirlos */
        get: operations["catalog_1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/meal-plans/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Detalle con comidas (403 subscription-required, con requiredTier, si está bloqueado) */
        get: operations["detail"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Sube un fichero
         * @description El tipo se detecta por su contenido. POST_IMAGE: cualquier usuario, solo imágenes. CONTENT_COVER y CONTENT_FILE: nutricionistas. Los CONTENT_FILE no tienen ruta pública: se abren desde el contenido.
         */
        post: operations["upload"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/media/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Lee un fichero: los públicos por id; los protegidos, solo con su URL firmada */
        get: operations["read"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/clients": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Clientes que siguen alguno de mis planes */
        get: operations["clients"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/content-items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Mi contenido (todos los estados) */
        get: operations["mine_2"];
        put?: never;
        /** Crea un borrador (portada y fichero: ids subidos antes con POST /media) */
        post: operations["create_2"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/content-items/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get_1"];
        put: operations["update_2"];
        post?: never;
        /** Borra un borrador (lo publicado se archiva) */
        delete: operations["delete_1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/content-items/{id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["archive_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/content-items/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["publish_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/meal-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Mis planes (todos los estados) */
        get: operations["mine_1"];
        put?: never;
        /** Crea un plan en borrador */
        post: operations["create_1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/meal-plans/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["get"];
        put: operations["update_1"];
        post?: never;
        /** Borra un borrador (un plan publicado se archiva) */
        delete: operations["delete"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/meal-plans/{id}/archive": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Retira el plan del catálogo (los clientes inscritos lo conservan) */
        post: operations["archive"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/meal-plans/{id}/meals": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post: operations["addMeal"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/meal-plans/{id}/meals/{mealId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["updateMeal"];
        post?: never;
        delete: operations["removeMeal"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/meal-plans/{id}/publish": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Publica el plan (necesita al menos una comida) */
        post: operations["publish"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/rewards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["mine"];
        put?: never;
        /** Crea una recompensa que desbloquea un contenido o un plan propio y publicado */
        post: operations["create"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/nutritionist/rewards/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put: operations["update"];
        post?: never;
        /** Deja de ofrecer la recompensa (las rachas completadas conservan su premio) */
        delete: operations["deactivate"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["post"];
        put: operations["edit"];
        post?: never;
        delete: operations["deletePost"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts/{id}/comments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["comments"];
        put?: never;
        post: operations["comment"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/posts/{id}/reports": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Denuncia una publicación (la revisa un ADMIN) */
        post: operations["reportPost"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/rewards": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Recompensas activas con mi racha hacia cada una */
        get: operations["catalog"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/subscription-plans": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Planes disponibles con su precio */
        get: operations["plans"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        AcceptInvitationRequest: {
            bio?: string | null;
            password: string;
            token: string;
        };
        AdminPaymentResponse: {
            amount: components["schemas"]["Money"];
            /** Format: date-time */
            capturedAt?: string | null;
            /** Format: date-time */
            createdAt?: string | null;
            /** Format: uuid */
            id: string;
            providerOrderId: string;
            /** @enum {string} */
            status: "CREATED" | "CAPTURED" | "FAILED" | "CANCELED";
            /** Format: uuid */
            subscriptionId: string;
            /** Format: uuid */
            userId: string;
        };
        AdminSubscriptionResponse: {
            /** Format: date-time */
            canceledAt?: string | null;
            /** Format: date-time */
            createdAt?: string | null;
            /** Format: date-time */
            currentPeriodEnd?: string | null;
            /** Format: date-time */
            currentPeriodStart?: string | null;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            status: "PENDING_PAYMENT" | "ACTIVE" | "CANCELED" | "EXPIRED";
            /** @enum {string} */
            tier: "BASIC" | "PREMIUM" | "VIP";
            /** Format: uuid */
            userId: string;
        };
        AdminUserResponse: {
            /** Format: date-time */
            createdAt?: string | null;
            email: string;
            firstName: string;
            /** Format: uuid */
            id: string;
            /** Format: date-time */
            lastLoginAt?: string | null;
            lastName: string;
            /** @enum {string} */
            role: "ADMIN" | "CLIENT" | "NUTRITIONIST";
            /** @enum {string} */
            status: "ACTIVE" | "DEACTIVATED";
        };
        AuthorResponse: {
            /** Format: uuid */
            id: string;
            name: string;
        };
        BillingSummaryResponse: {
            activeByTier: {
                [key: string]: number;
            };
            monthlyRecurringRevenue: components["schemas"]["Money"][];
            /** Format: int64 */
            paymentsLast30Days: number;
            revenueLast30Days: components["schemas"]["Money"][];
        };
        CaptureRequest: {
            orderId: string;
        };
        ChangePasswordRequest: {
            currentPassword: string;
            newPassword: string;
        };
        CheckoutRequest: {
            /** @enum {string} */
            tier: "BASIC" | "PREMIUM" | "VIP";
        };
        CheckoutResponse: {
            approvalUrl: string;
        };
        ClientData: {
            /** Format: date */
            birthDate?: string | null;
            heightCm?: number | null;
            /** @enum {string|null} */
            sex?: "FEMALE" | "MALE" | "OTHER" | null;
            weightKg?: number | null;
        };
        ClientProfileResponse: {
            /** Format: int32 */
            age?: number | null;
            /** Format: date */
            birthDate?: string | null;
            heightCm?: number | null;
            /** @enum {string|null} */
            sex?: "FEMALE" | "MALE" | "OTHER" | null;
            weightKg?: number | null;
        };
        CommentRequest: {
            body: string;
        };
        CommentResponse: {
            author?: components["schemas"]["PersonResponse"] | null;
            body: string;
            /** Format: date-time */
            createdAt?: string | null;
            /** Format: uuid */
            id: string;
        };
        ContactMessage: {
            apellido: string;
            /** Format: email */
            correo: string;
            mensaje: string;
            nombre: string;
            website?: string | null;
        };
        ContentDetailResponse: {
            body?: string | null;
            item: components["schemas"]["ContentSummaryResponse"];
        };
        ContentRequest: {
            body?: string | null;
            /** @enum {string} */
            category: "NUTRITION" | "EXERCISE" | "MENTAL_HEALTH";
            /** Format: uuid */
            coverMediaId?: string | null;
            /** Format: uuid */
            fileMediaId?: string | null;
            /** @enum {string} */
            requiredTier: "BASIC" | "PREMIUM" | "VIP";
            summary: string;
            title: string;
            /** @enum {string} */
            type: "ARTICLE" | "VIDEO" | "GUIDE";
        };
        ContentSummaryResponse: {
            author?: components["schemas"]["AuthorResponse"] | null;
            /** @enum {string} */
            category: "NUTRITION" | "EXERCISE" | "MENTAL_HEALTH";
            coverPath?: string | null;
            hasFile: boolean;
            /** Format: uuid */
            id: string;
            locked: boolean;
            /** Format: date-time */
            publishedAt?: string | null;
            /** @enum {string} */
            requiredTier: "BASIC" | "PREMIUM" | "VIP";
            slug: string;
            /** @enum {string} */
            status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
            summary: string;
            title: string;
            /** @enum {string} */
            type: "ARTICLE" | "VIDEO" | "GUIDE";
        };
        CurrentSubscriptionResponse: {
            /** Format: date-time */
            currentPeriodEnd?: string | null;
            renews: boolean;
            /** @enum {string|null} */
            status?: "PENDING_PAYMENT" | "ACTIVE" | "CANCELED" | "EXPIRED" | null;
            /** Format: uuid */
            subscriptionId?: string | null;
            /** @enum {string} */
            tier: "BASIC" | "PREMIUM" | "VIP";
        };
        EnrollRequest: {
            /** Format: uuid */
            mealPlanId: string;
        };
        EnrollmentResponse: {
            /** Format: date-time */
            enrolledAt: string;
            /** Format: uuid */
            id: string;
            plan: components["schemas"]["MealPlanSummaryResponse"];
            /** @enum {string} */
            source: "SELF" | "REWARD";
        };
        FileLinkResponse: {
            /** Format: int64 */
            expiresInSeconds: number;
            path: string;
        };
        ForgotPasswordRequest: {
            /** Format: email */
            email: string;
        };
        GoalRequest: {
            description?: string | null;
            targetWeightKg: number;
            title: string;
        };
        GoalResponse: {
            /** Format: date-time */
            completedAt?: string | null;
            /** Format: date-time */
            createdAt?: string | null;
            description?: string | null;
            /** Format: uuid */
            id: string;
            /** Format: date */
            startedOn: string;
            /** @enum {string} */
            status: "ACTIVE" | "COMPLETED" | "ABANDONED";
            targetWeightKg: number;
            title: string;
        };
        GroupRequest: {
            description?: string | null;
            name: string;
            /** @enum {string} */
            visibility: "PUBLIC" | "PRIVATE";
        };
        GroupResponse: {
            /** Format: date-time */
            createdAt?: string | null;
            description?: string | null;
            /** Format: uuid */
            id: string;
            /** Format: int64 */
            members: number;
            membership?: components["schemas"]["MembershipResponse"] | null;
            name: string;
            /** @enum {string} */
            visibility: "PUBLIC" | "PRIVATE";
        };
        HabitLogRequest: {
            /** Format: int32 */
            exercise: number;
            /** Format: int32 */
            hydration: number;
            /** Format: date */
            loggedOn?: string | null;
            notes?: string | null;
            /** Format: int32 */
            nutrition: number;
            /** Format: int32 */
            sleep: number;
        };
        HabitLogResponse: {
            /** Format: double */
            average: number;
            /** Format: int32 */
            exercise: number;
            /** Format: int32 */
            hydration: number;
            /** Format: uuid */
            id: string;
            /** Format: date */
            loggedOn: string;
            notes?: string | null;
            /** Format: int32 */
            nutrition: number;
            /** Format: int32 */
            sleep: number;
        };
        InvitationPreviewRequest: {
            token: string;
        };
        InvitationPreviewResponse: {
            email: string;
            firstName: string;
            lastName: string;
        };
        InvitationResponse: {
            /** Format: date-time */
            acceptedAt?: string | null;
            /** Format: date-time */
            createdAt?: string | null;
            email: string;
            /** Format: date-time */
            expiresAt: string;
            firstName: string;
            /** Format: uuid */
            id: string;
            lastName: string;
            /** @enum {string} */
            status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
        };
        InviteNutritionistRequest: {
            /** Format: email */
            email: string;
            firstName: string;
            lastName: string;
        };
        LoginRequest: {
            /** Format: email */
            email: string;
            password: string;
        };
        MeResponse: {
            client?: components["schemas"]["ClientProfileResponse"] | null;
            email: string;
            firstName: string;
            /** Format: uuid */
            id: string;
            lastName: string;
            nutritionist?: components["schemas"]["NutritionistProfileResponse"] | null;
            /** @enum {string} */
            role: "ADMIN" | "CLIENT" | "NUTRITIONIST";
        };
        MealPlanDetailResponse: {
            meals: components["schemas"]["MealResponse"][];
            plan: components["schemas"]["MealPlanSummaryResponse"];
            /** @enum {string} */
            status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
        };
        MealPlanRequest: {
            description: string;
            /** Format: int32 */
            durationDays: number;
            /** @enum {string} */
            goal: "WEIGHT_LOSS" | "MAINTENANCE" | "MUSCLE_GAIN";
            /** @enum {string} */
            requiredTier: "BASIC" | "PREMIUM" | "VIP";
            title: string;
        };
        MealPlanSummaryResponse: {
            author?: components["schemas"]["AuthorResponse"] | null;
            /** Format: int32 */
            averageDailyCalories: number;
            description: string;
            /** Format: int32 */
            durationDays: number;
            /** @enum {string} */
            goal: "WEIGHT_LOSS" | "MAINTENANCE" | "MUSCLE_GAIN";
            /** Format: uuid */
            id: string;
            locked: boolean;
            /** Format: date-time */
            publishedAt?: string | null;
            /** @enum {string} */
            requiredTier: "BASIC" | "PREMIUM" | "VIP";
            /** @enum {string} */
            status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
            title: string;
        };
        MealRequest: {
            /** Format: int32 */
            calories: number;
            /** @enum {string} */
            category: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
            /** Format: int32 */
            dayNumber: number;
            description?: string | null;
            name: string;
            /** Format: int32 */
            position: number;
        };
        MealResponse: {
            /** Format: int32 */
            calories: number;
            /** @enum {string} */
            category: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK";
            /** Format: int32 */
            dayNumber: number;
            description?: string | null;
            /** Format: uuid */
            id: string;
            name: string;
            /** Format: int32 */
            position: number;
        };
        MemberResponse: {
            person?: components["schemas"]["PersonResponse"] | null;
            /** @enum {string} */
            role: "OWNER" | "MEMBER";
            /** Format: date-time */
            since?: string | null;
            /** @enum {string} */
            status: "PENDING" | "ACTIVE";
        };
        MembershipResponse: {
            /** @enum {string} */
            role: "OWNER" | "MEMBER";
            /** @enum {string} */
            status: "PENDING" | "ACTIVE";
        };
        Money: {
            /**
             * Format: decimal
             * @example 5.99
             */
            amount: string;
            currency: string;
        };
        NutritionistClientResponse: {
            email: string;
            firstName: string;
            heightCm?: number | null;
            /** Format: uuid */
            id: string;
            lastName: string;
            plans: string[];
            /** Format: date-time */
            since: string;
            weightKg?: number | null;
        };
        NutritionistProfileResponse: {
            bio?: string | null;
        };
        PageMetadata: {
            /** Format: int64 */
            number: number;
            /** Format: int64 */
            size: number;
            /** Format: int64 */
            totalElements: number;
            /** Format: int64 */
            totalPages: number;
        };
        Pageable: {
            /** Format: int32 */
            page?: number;
            /** Format: int32 */
            size?: number;
            sort?: string[];
        };
        PagedModelAdminPaymentResponse: {
            content: components["schemas"]["AdminPaymentResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelAdminSubscriptionResponse: {
            content: components["schemas"]["AdminSubscriptionResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelAdminUserResponse: {
            content: components["schemas"]["AdminUserResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelContentSummaryResponse: {
            content: components["schemas"]["ContentSummaryResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelGroupResponse: {
            content: components["schemas"]["GroupResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelInvitationResponse: {
            content: components["schemas"]["InvitationResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelMealPlanSummaryResponse: {
            content: components["schemas"]["MealPlanSummaryResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelPaymentResponse: {
            content: components["schemas"]["PaymentResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelPostResponse: {
            content: components["schemas"]["PostResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PagedModelReportResponse: {
            content: components["schemas"]["ReportResponse"][];
            page: components["schemas"]["PageMetadata"];
        };
        PaymentResponse: {
            amount: components["schemas"]["Money"];
            /** Format: date-time */
            capturedAt?: string | null;
            /** Format: date-time */
            createdAt?: string | null;
            /** Format: uuid */
            id: string;
            /** @enum {string} */
            status: "CREATED" | "CAPTURED" | "FAILED" | "CANCELED";
            /** Format: uuid */
            subscriptionId: string;
        };
        PersonResponse: {
            /** Format: uuid */
            id: string;
            name: string;
        };
        PlanResponse: {
            description: string;
            /** Format: uuid */
            id: string;
            name: string;
            /** Format: int32 */
            periodDays: number;
            price: components["schemas"]["Money"];
            /** @enum {string} */
            tier: "BASIC" | "PREMIUM" | "VIP";
        };
        PostRequest: {
            body: string;
            /** Format: uuid */
            imageMediaId?: string | null;
            title: string;
        };
        PostResponse: {
            author?: components["schemas"]["PersonResponse"] | null;
            body: string;
            /** Format: date-time */
            createdAt?: string | null;
            /** Format: uuid */
            groupId: string;
            /** Format: uuid */
            id: string;
            imagePath?: string | null;
            title: string;
            /** Format: date-time */
            updatedAt?: string | null;
        };
        RecommendationResponse: {
            currentBmi?: number | null;
            currentWeightKg?: number | null;
            /** Format: int32 */
            estimatedWeeks?: number | null;
            healthyMaxKg: number;
            healthyMinKg: number;
            heightCm: number;
            message: string;
            targetBmi: number;
            targetInHealthyRange: boolean;
            targetWeightKg: number;
            weeklyChangeKg?: number | null;
        };
        RegisterRequest: {
            /** Format: email */
            email: string;
            firstName: string;
            lastName: string;
            password: string;
            profile?: components["schemas"]["ClientData"] | null;
        };
        ReportRequest: {
            reason: string;
        };
        ReportResponse: {
            /** Format: date-time */
            createdAt: string;
            excerpt: string;
            /** Format: uuid */
            id: string;
            reason: string;
            reporter?: components["schemas"]["PersonResponse"] | null;
            /** Format: date-time */
            resolvedAt?: string | null;
            /** @enum {string} */
            status: "OPEN" | "RESOLVED" | "DISMISSED";
            targetAuthor?: components["schemas"]["PersonResponse"] | null;
            targetHidden: boolean;
            /** Format: uuid */
            targetId: string;
            /** @enum {string} */
            targetType: "POST" | "COMMENT";
        };
        ResetPasswordRequest: {
            password: string;
            token: string;
        };
        ResolveRequest: {
            /** @enum {string} */
            action: "HIDE" | "DISMISS";
            note: string;
        };
        RewardRequest: {
            /** Format: uuid */
            contentItemId?: string | null;
            description: string;
            /** Format: uuid */
            mealPlanId?: string | null;
            /** Format: int32 */
            requiredStreakDays: number;
            title: string;
        };
        RewardResponse: {
            active: boolean;
            description: string;
            /** Format: uuid */
            id: string;
            /** Format: int32 */
            requiredStreakDays: number;
            streak?: components["schemas"]["StreakResponse"] | null;
            target: components["schemas"]["TargetResponse"];
            title: string;
        };
        SessionResponse: {
            accessToken: string;
            /** Format: int64 */
            expiresIn: number;
            tokenType: string;
            user: components["schemas"]["SessionUser"];
        };
        SessionUser: {
            email: string;
            firstName: string;
            /** Format: uuid */
            id: string;
            lastName: string;
            /** @enum {string} */
            role: "ADMIN" | "CLIENT" | "NUTRITIONIST";
        };
        StartStreakRequest: {
            /** Format: uuid */
            rewardId: string;
        };
        StatusChangeResponse: {
            /** Format: date-time */
            changedAt: string;
            /** @enum {string|null} */
            from?: "ACTIVE" | "COMPLETED" | "ABANDONED" | null;
            /** @enum {string} */
            to: "ACTIVE" | "COMPLETED" | "ABANDONED";
        };
        StreakResponse: {
            completed: boolean;
            /** Format: date-time */
            completedAt?: string | null;
            /** Format: int32 */
            currentDays: number;
            /** Format: uuid */
            id: string;
            /** Format: date */
            lastCountedOn?: string | null;
        };
        TargetResponse: {
            /** Format: uuid */
            id: string;
            title: string;
            /** @enum {string} */
            type: "CONTENT" | "MEAL_PLAN";
        };
        UpdateProfileRequest: {
            bio?: string | null;
            client?: components["schemas"]["ClientData"] | null;
            firstName: string;
            lastName: string;
        };
        UploadResponse: {
            contentType: string;
            /** Format: uuid */
            id: string;
            path?: string | null;
            /** Format: int64 */
            sizeBytes: number;
        };
        UserSummaryResponse: {
            /** Format: int64 */
            active: number;
            byRole: {
                [key: string]: number;
            };
            /** Format: int64 */
            deactivated: number;
            /** Format: int64 */
            newLast30Days: number;
            /** Format: int64 */
            total: number;
        };
        WeightEntryRequest: {
            /** Format: date */
            measuredOn: string;
            notes?: string | null;
            weightKg: number;
        };
        WeightEntryResponse: {
            /** Format: uuid */
            id: string;
            /** Format: date */
            measuredOn: string;
            notes?: string | null;
            weightKg: number;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type AcceptInvitationRequest = components['schemas']['AcceptInvitationRequest'];
export type AdminPaymentResponse = components['schemas']['AdminPaymentResponse'];
export type AdminSubscriptionResponse = components['schemas']['AdminSubscriptionResponse'];
export type AdminUserResponse = components['schemas']['AdminUserResponse'];
export type AuthorResponse = components['schemas']['AuthorResponse'];
export type BillingSummaryResponse = components['schemas']['BillingSummaryResponse'];
export type CaptureRequest = components['schemas']['CaptureRequest'];
export type ChangePasswordRequest = components['schemas']['ChangePasswordRequest'];
export type CheckoutRequest = components['schemas']['CheckoutRequest'];
export type CheckoutResponse = components['schemas']['CheckoutResponse'];
export type ClientData = components['schemas']['ClientData'];
export type ClientProfileResponse = components['schemas']['ClientProfileResponse'];
export type CommentRequest = components['schemas']['CommentRequest'];
export type CommentResponse = components['schemas']['CommentResponse'];
export type ContactMessage = components['schemas']['ContactMessage'];
export type ContentDetailResponse = components['schemas']['ContentDetailResponse'];
export type ContentRequest = components['schemas']['ContentRequest'];
export type ContentSummaryResponse = components['schemas']['ContentSummaryResponse'];
export type CurrentSubscriptionResponse = components['schemas']['CurrentSubscriptionResponse'];
export type EnrollRequest = components['schemas']['EnrollRequest'];
export type EnrollmentResponse = components['schemas']['EnrollmentResponse'];
export type FileLinkResponse = components['schemas']['FileLinkResponse'];
export type ForgotPasswordRequest = components['schemas']['ForgotPasswordRequest'];
export type GoalRequest = components['schemas']['GoalRequest'];
export type GoalResponse = components['schemas']['GoalResponse'];
export type GroupRequest = components['schemas']['GroupRequest'];
export type GroupResponse = components['schemas']['GroupResponse'];
export type HabitLogRequest = components['schemas']['HabitLogRequest'];
export type HabitLogResponse = components['schemas']['HabitLogResponse'];
export type InvitationPreviewRequest = components['schemas']['InvitationPreviewRequest'];
export type InvitationPreviewResponse = components['schemas']['InvitationPreviewResponse'];
export type InvitationResponse = components['schemas']['InvitationResponse'];
export type InviteNutritionistRequest = components['schemas']['InviteNutritionistRequest'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type MeResponse = components['schemas']['MeResponse'];
export type MealPlanDetailResponse = components['schemas']['MealPlanDetailResponse'];
export type MealPlanRequest = components['schemas']['MealPlanRequest'];
export type MealPlanSummaryResponse = components['schemas']['MealPlanSummaryResponse'];
export type MealRequest = components['schemas']['MealRequest'];
export type MealResponse = components['schemas']['MealResponse'];
export type MemberResponse = components['schemas']['MemberResponse'];
export type MembershipResponse = components['schemas']['MembershipResponse'];
export type Money = components['schemas']['Money'];
export type NutritionistClientResponse = components['schemas']['NutritionistClientResponse'];
export type NutritionistProfileResponse = components['schemas']['NutritionistProfileResponse'];
export type PageMetadata = components['schemas']['PageMetadata'];
export type Pageable = components['schemas']['Pageable'];
export type PagedModelAdminPaymentResponse = components['schemas']['PagedModelAdminPaymentResponse'];
export type PagedModelAdminSubscriptionResponse = components['schemas']['PagedModelAdminSubscriptionResponse'];
export type PagedModelAdminUserResponse = components['schemas']['PagedModelAdminUserResponse'];
export type PagedModelContentSummaryResponse = components['schemas']['PagedModelContentSummaryResponse'];
export type PagedModelGroupResponse = components['schemas']['PagedModelGroupResponse'];
export type PagedModelInvitationResponse = components['schemas']['PagedModelInvitationResponse'];
export type PagedModelMealPlanSummaryResponse = components['schemas']['PagedModelMealPlanSummaryResponse'];
export type PagedModelPaymentResponse = components['schemas']['PagedModelPaymentResponse'];
export type PagedModelPostResponse = components['schemas']['PagedModelPostResponse'];
export type PagedModelReportResponse = components['schemas']['PagedModelReportResponse'];
export type PaymentResponse = components['schemas']['PaymentResponse'];
export type PersonResponse = components['schemas']['PersonResponse'];
export type PlanResponse = components['schemas']['PlanResponse'];
export type PostRequest = components['schemas']['PostRequest'];
export type PostResponse = components['schemas']['PostResponse'];
export type RecommendationResponse = components['schemas']['RecommendationResponse'];
export type RegisterRequest = components['schemas']['RegisterRequest'];
export type ReportRequest = components['schemas']['ReportRequest'];
export type ReportResponse = components['schemas']['ReportResponse'];
export type ResetPasswordRequest = components['schemas']['ResetPasswordRequest'];
export type ResolveRequest = components['schemas']['ResolveRequest'];
export type RewardRequest = components['schemas']['RewardRequest'];
export type RewardResponse = components['schemas']['RewardResponse'];
export type SessionResponse = components['schemas']['SessionResponse'];
export type SessionUser = components['schemas']['SessionUser'];
export type StartStreakRequest = components['schemas']['StartStreakRequest'];
export type StatusChangeResponse = components['schemas']['StatusChangeResponse'];
export type StreakResponse = components['schemas']['StreakResponse'];
export type TargetResponse = components['schemas']['TargetResponse'];
export type UpdateProfileRequest = components['schemas']['UpdateProfileRequest'];
export type UploadResponse = components['schemas']['UploadResponse'];
export type UserSummaryResponse = components['schemas']['UserSummaryResponse'];
export type WeightEntryRequest = components['schemas']['WeightEntryRequest'];
export type WeightEntryResponse = components['schemas']['WeightEntryResponse'];
export type $defs = Record<string, never>;
export interface operations {
    summary_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["BillingSummaryResponse"];
                };
            };
        };
    };
    reports: {
        parameters: {
            query: {
                status?: "OPEN" | "RESOLVED" | "DISMISSED";
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelReportResponse"];
                };
            };
        };
    };
    resolve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResolveRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ReportResponse"];
                };
            };
        };
    };
    list: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelInvitationResponse"];
                };
            };
        };
    };
    invite: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InviteNutritionistRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InvitationResponse"];
                };
            };
        };
    };
    revoke: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    resend: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InvitationResponse"];
                };
            };
        };
    };
    payments_1: {
        parameters: {
            query: {
                status?: "CREATED" | "CAPTURED" | "FAILED" | "CANCELED" | null;
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelAdminPaymentResponse"];
                };
            };
        };
    };
    subscriptions: {
        parameters: {
            query: {
                status?: "PENDING_PAYMENT" | "ACTIVE" | "CANCELED" | "EXPIRED" | null;
                tier?: "BASIC" | "PREMIUM" | "VIP" | null;
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelAdminSubscriptionResponse"];
                };
            };
        };
    };
    search: {
        parameters: {
            query: {
                role?: "ADMIN" | "CLIENT" | "NUTRITIONIST" | null;
                status?: "ACTIVE" | "DEACTIVATED" | null;
                q?: string | null;
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelAdminUserResponse"];
                };
            };
        };
    };
    summary: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UserSummaryResponse"];
                };
            };
        };
    };
    activate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AdminUserResponse"];
                };
            };
        };
    };
    deactivate_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["AdminUserResponse"];
                };
            };
        };
    };
    forgotPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ForgotPasswordRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    acceptInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AcceptInvitationRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MeResponse"];
                };
            };
        };
    };
    previewInvitation: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["InvitationPreviewRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["InvitationPreviewResponse"];
                };
            };
        };
    };
    login: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SessionResponse"];
                };
            };
        };
    };
    logout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    refresh: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": Record<string, never>;
                };
            };
        };
    };
    register: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MeResponse"];
                };
            };
        };
    };
    resetPassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ResetPasswordRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    deleteComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    reportComment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    sendMessage: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContactMessage"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    catalog_2: {
        parameters: {
            query: {
                type?: "ARTICLE" | "VIDEO" | "GUIDE" | null;
                category?: "NUTRITION" | "EXERCISE" | "MENTAL_HEALTH" | null;
                q?: string | null;
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelContentSummaryResponse"];
                };
            };
        };
    };
    file: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["FileLinkResponse"];
                };
            };
        };
    };
    detail_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                slug: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentDetailResponse"];
                };
            };
        };
    };
    directory: {
        parameters: {
            query: {
                q?: string | null;
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelGroupResponse"];
                };
            };
        };
    };
    create_3: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GroupRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    group: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    update_4: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GroupRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    delete_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    members: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MemberResponse"][];
                };
            };
        };
    };
    join: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GroupResponse"];
                };
            };
        };
    };
    leave: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    remove: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    approve: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                userId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    posts: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelPostResponse"];
                };
            };
        };
    };
    publish_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PostResponse"];
                };
            };
        };
    };
    me: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MeResponse"];
                };
            };
        };
    };
    unlocked: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentSummaryResponse"][];
                };
            };
        };
    };
    goals: {
        parameters: {
            query?: {
                status?: "ACTIVE" | "COMPLETED" | "ABANDONED" | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GoalResponse"][];
                };
            };
        };
    };
    createGoal: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GoalResponse"];
                };
            };
        };
    };
    goal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GoalResponse"];
                };
            };
        };
    };
    updateGoal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["GoalRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GoalResponse"];
                };
            };
        };
    };
    abandon: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GoalResponse"];
                };
            };
        };
    };
    complete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["GoalResponse"];
                };
            };
        };
    };
    recommendation: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RecommendationResponse"];
                };
            };
        };
    };
    history: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["StatusChangeResponse"][];
                };
            };
        };
    };
    weights: {
        parameters: {
            query?: {
                from?: string | null;
                to?: string | null;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["WeightEntryResponse"][];
                };
            };
        };
    };
    addWeight: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WeightEntryRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["WeightEntryResponse"];
                };
            };
        };
    };
    updateWeight: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                entryId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["WeightEntryRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["WeightEntryResponse"];
                };
            };
        };
    };
    deleteWeight: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                entryId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    habitLogs: {
        parameters: {
            query?: {
                from?: string | null;
                to?: string | null;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["HabitLogResponse"][];
                };
            };
        };
    };
    logHabits: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HabitLogRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["HabitLogResponse"];
                };
            };
        };
    };
    updateHabits: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["HabitLogRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["HabitLogResponse"];
                };
            };
        };
    };
    deleteHabits: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    enrollments: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["EnrollmentResponse"][];
                };
            };
        };
    };
    enroll: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["EnrollRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    unenroll: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                mealPlanId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    changePassword: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangePasswordRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["SessionResponse"];
                };
            };
        };
    };
    payments: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelPaymentResponse"];
                };
            };
        };
    };
    update_3: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProfileRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MeResponse"];
                };
            };
        };
    };
    streaks: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RewardResponse"][];
                };
            };
        };
    };
    start: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["StartStreakRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RewardResponse"];
                };
            };
        };
    };
    abandon_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    current: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CurrentSubscriptionResponse"];
                };
            };
        };
    };
    cancel: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CurrentSubscriptionResponse"];
                };
            };
        };
    };
    checkout: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckoutRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CheckoutResponse"];
                };
            };
        };
    };
    capture: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CaptureRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CurrentSubscriptionResponse"];
                };
            };
        };
    };
    catalog_1: {
        parameters: {
            query: {
                goal?: "WEIGHT_LOSS" | "MAINTENANCE" | "MUSCLE_GAIN" | null;
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelMealPlanSummaryResponse"];
                };
            };
        };
    };
    detail: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealPlanDetailResponse"];
                };
            };
        };
    };
    upload: {
        parameters: {
            query: {
                purpose: "POST_IMAGE" | "CONTENT_COVER" | "CONTENT_FILE";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: {
            content: {
                "multipart/form-data": {
                    /** Format: binary */
                    file: string;
                };
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["UploadResponse"];
                };
            };
        };
    };
    read: {
        parameters: {
            query?: {
                expires?: number | null;
                signature?: string | null;
            };
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": string;
                };
            };
        };
    };
    clients: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["NutritionistClientResponse"][];
                };
            };
        };
    };
    mine_2: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelContentSummaryResponse"];
                };
            };
        };
    };
    create_2: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContentRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentDetailResponse"];
                };
            };
        };
    };
    get_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentDetailResponse"];
                };
            };
        };
    };
    update_2: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ContentRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentDetailResponse"];
                };
            };
        };
    };
    delete_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    archive_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentDetailResponse"];
                };
            };
        };
    };
    publish_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["ContentDetailResponse"];
                };
            };
        };
    };
    mine_1: {
        parameters: {
            query: {
                pageable: components["schemas"]["Pageable"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PagedModelMealPlanSummaryResponse"];
                };
            };
        };
    };
    create_1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MealPlanRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealPlanDetailResponse"];
                };
            };
        };
    };
    get: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealPlanDetailResponse"];
                };
            };
        };
    };
    update_1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MealPlanRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealPlanDetailResponse"];
                };
            };
        };
    };
    delete: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    archive: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealPlanDetailResponse"];
                };
            };
        };
    };
    addMeal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MealRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealResponse"];
                };
            };
        };
    };
    updateMeal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                mealId: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MealRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealResponse"];
                };
            };
        };
    };
    removeMeal: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
                mealId: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    publish: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["MealPlanDetailResponse"];
                };
            };
        };
    };
    mine: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RewardResponse"][];
                };
            };
        };
    };
    create: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RewardRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RewardResponse"];
                };
            };
        };
    };
    update: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RewardRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RewardResponse"];
                };
            };
        };
    };
    deactivate: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    post: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PostResponse"];
                };
            };
        };
    };
    edit: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["PostRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PostResponse"];
                };
            };
        };
    };
    deletePost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    comments: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CommentResponse"][];
                };
            };
        };
    };
    comment: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CommentRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["CommentResponse"];
                };
            };
        };
    };
    reportPost: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReportRequest"];
            };
        };
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    catalog: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["RewardResponse"][];
                };
            };
        };
    };
    plans: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description OK */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "*/*": components["schemas"]["PlanResponse"][];
                };
            };
        };
    };
}
