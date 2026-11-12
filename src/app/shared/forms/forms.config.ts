import { provideSignalFormsConfig } from '@angular/forms/signals';

/**
 * Configuración de Signal Forms para los formularios de la app. Se provee en los layouts (acceso y marco de la app),
 * que se cargan en diferido: así los formularios no entran en el bundle inicial.
 *
 * [formField] pasa el estado «inválido» a los controles de PrimeNG desde el principio. Con la clase hb-untouched,
 * styles.css oculta ese rojo hasta que el campo se toca (o se intenta enviar el formulario).
 */
export const SIGNAL_FORMS_PROVIDERS = provideSignalFormsConfig({
  classes: { 'hb-untouched': (binding) => !binding.state().touched() },
});
