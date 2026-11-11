// Entorno de desarrollo local (ng serve): backend en :8090, frontend en :4210.
// El build de produccion reemplaza este archivo por environment.prod.ts (ver angular.json).
export const environment = {
    production: false,
    baseUrl: 'http://localhost:8090/api/v1',
    paypalReturnUrl: 'http://localhost:4210/cliente/perfil'
};
