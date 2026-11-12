export const environment = {
    production: true,
    baseUrl: 'https://healthybites-api-latest.onrender.com/api/v1',
    // PayPal devuelve al usuario al mismo origen que sirve la app, sea cual sea el hosting.
    paypalReturnUrl: `${window.location.origin}/cliente/perfil`
};
