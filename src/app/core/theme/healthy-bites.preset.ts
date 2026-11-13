import { definePreset } from '@primeuix/themes';
import { AuraLean } from './aura-lean';

/** Variable CSS de src/styles/tokens.css. */
const v = (token: string): string => `var(--${token})`;

/** Escala de color de tokens.css (50…950) como tokens de PrimeNG. */
function scale(name: string) {
  const step = (n: number) => v(`color-${name}-${n}`);
  return {
    50: step(50),
    100: step(100),
    200: step(200),
    300: step(300),
    400: step(400),
    500: step(500),
    600: step(600),
    700: step(700),
    800: step(800),
    900: step(900),
    950: step(950),
  };
}

/**
 * Preset de PrimeNG con la identidad «Despensa», sobre Aura (solo los componentes que usa la app: aura-lean.ts).
 *
 * Los colores, radios y sombras no se copian aquí: son referencias a las variables de src/styles/tokens.css, que es
 * la única fuente (PrimeNG escribe `--p-primary-700: var(--color-brand-700)` y el navegador lo resuelve).
 * `pnpm theme:check` comprueba que cada variable referenciada existe y calcula el contraste de los pares de colores.
 *
 * - primary: el verde de la marca. El color de acción es brand-700 (blanco encima: 6:1); el foco, brand-600.
 * - surface: los neutros cálidos (stone). surface.0 es el blanco de las tarjetas.
 * - Sin píldoras: botones, campos y avisos usan --radius-control; los diálogos, --radius-card.
 *
 * Solo tema claro: el oscuro llegará con la clase .app-dark (darkModeSelector) y valores light-dark().
 */
export const HealthyBitesPreset = definePreset(AuraLean, {
  semantic: {
    primary: {
      ...scale('brand'),
      color: '{primary.700}',
      contrastColor: v('color-card'),
      hoverColor: '{primary.800}',
      activeColor: '{primary.900}',
    },
    surface: {
      0: v('color-card'),
      ...scale('stone'),
    },
    text: {
      color: '{surface.950}',
      hoverColor: '{surface.950}',
      mutedColor: '{surface.600}',
      hoverMutedColor: '{surface.800}',
    },
    highlight: {
      background: '{primary.100}',
      focusBackground: '{primary.200}',
      color: '{primary.950}',
      focusColor: '{primary.950}',
    },
    mask: {
      background: 'rgb(16 41 31 / 0.45)',
    },
    focusRing: {
      width: '2px',
      style: 'solid',
      color: '{primary.600}',
      offset: '2px',
      shadow: 'none',
    },
    typography: {
      fontFamily: 'inherit',
      // 16 px: con menos, Safari en iOS hace zoom al enfocar un campo.
      fontSize: '1rem',
    },
    iconSize: '1rem',
    formField: {
      paddingX: '0.875rem',
      paddingY: '0.625rem',
      borderRadius: v('radius-control'),
      shadow: 'none',
      color: '{text.color}',
      // stone-500 llega a 4,7:1 sobre el blanco de los campos (no sobre el papel).
      placeholderColor: '{surface.500}',
      floatLabelColor: '{surface.600}',
      floatLabelFocusColor: '{primary.700}',
      floatLabelActiveColor: '{surface.600}',
      focusBorderColor: '{primary.600}',
    },
    content: {
      borderRadius: v('radius-control'),
    },
    list: {
      option: {
        borderRadius: '0.375rem',
      },
    },
    navigation: {
      item: {
        borderRadius: '0.375rem',
      },
    },
    overlay: {
      select: {
        borderRadius: v('radius-control'),
        shadow: v('shadow-overlay'),
      },
      popover: {
        borderRadius: v('radius-control'),
        shadow: v('shadow-overlay'),
      },
      modal: {
        borderRadius: v('radius-card'),
        padding: '1.5rem',
        shadow: v('shadow-overlay'),
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: v('radius-control'),
        paddingX: '1rem',
        gap: '0.5rem',
        label: { fontWeight: '600' },
        // Secundario: blanco con borde (un relleno gris se confundiría con el papel).
        secondary: {
          background: '{surface.0}',
          hoverBackground: '{surface.50}',
          activeBackground: '{surface.100}',
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          activeBorderColor: '{surface.400}',
          color: '{surface.800}',
          hoverColor: '{surface.900}',
          activeColor: '{surface.950}',
        },
        success: {
          background: '{primary.700}',
          hoverBackground: '{primary.800}',
          activeBackground: '{primary.900}',
          borderColor: '{primary.700}',
          hoverBorderColor: '{primary.800}',
          activeBorderColor: '{primary.900}',
          focusRing: { color: '{primary.700}' },
        },
        // Los 500 de Aura no llegan a 4,5:1 con texto blanco.
        danger: {
          background: v('color-danger-700'),
          hoverBackground: v('color-danger-800'),
          activeBackground: v('color-danger-900'),
          borderColor: v('color-danger-700'),
          hoverBorderColor: v('color-danger-800'),
          activeBorderColor: v('color-danger-900'),
          focusRing: { color: v('color-danger-700') },
        },
      },
      outlined: {
        // Aura usa surface.500, que sobre el papel se queda en 4,2:1.
        secondary: { color: '{surface.700}', borderColor: '{surface.300}' },
        danger: { color: v('color-danger-700'), borderColor: v('color-danger-300') },
      },
      text: {
        danger: { color: v('color-danger-700') },
        secondary: { color: '{surface.700}' },
      },
    },
    // Avisos y mensajes: el texto en tono 800 sobre fondo 50 (más de 7:1). Info es neutro: no hay azul en la marca.
    toast: {
      success: {
        background: '{primary.50}',
        borderColor: '{primary.200}',
        color: '{primary.800}',
        closeButton: { hoverBackground: '{primary.100}', focusRing: { color: '{primary.700}' } },
      },
      info: {
        background: '{surface.0}',
        borderColor: '{surface.200}',
        color: '{surface.800}',
        closeButton: { hoverBackground: '{surface.100}', focusRing: { color: '{surface.700}' } },
      },
      warn: {
        background: v('color-saffron-50'),
        borderColor: v('color-saffron-200'),
        color: v('color-saffron-800'),
        closeButton: {
          hoverBackground: v('color-saffron-100'),
          focusRing: { color: v('color-saffron-700') },
        },
      },
      error: {
        background: v('color-danger-50'),
        borderColor: v('color-danger-200'),
        color: v('color-danger-800'),
        closeButton: {
          hoverBackground: v('color-danger-100'),
          focusRing: { color: v('color-danger-700') },
        },
      },
    },
    message: {
      success: { background: '{primary.50}', borderColor: '{primary.200}', color: '{primary.800}' },
      info: { background: '{surface.0}', borderColor: '{surface.200}', color: '{surface.800}' },
      warn: {
        background: v('color-saffron-50'),
        borderColor: v('color-saffron-200'),
        color: v('color-saffron-800'),
      },
      error: {
        background: v('color-danger-50'),
        borderColor: v('color-danger-200'),
        color: v('color-danger-800'),
      },
    },
    // p-selectbutton: un carril gris con la opción elegida en blanco.
    togglebutton: {
      root: {
        background: '{surface.200}',
        hoverBackground: '{surface.200}',
        checkedBackground: '{surface.200}',
        borderColor: '{surface.200}',
        checkedBorderColor: '{surface.200}',
        color: '{surface.700}',
        hoverColor: '{surface.900}',
        checkedColor: '{surface.950}',
        borderRadius: v('radius-control'),
      },
      content: {
        borderRadius: '0.375rem',
        padding: '0.25rem 0.875rem',
      },
      icon: {
        color: '{surface.700}',
        hoverColor: '{surface.900}',
        checkedColor: '{surface.950}',
      },
    },
    // Tablas: cabecera en papel claro con filetes; las mayúsculas pequeñas van en styles.css (no hay token).
    datatable: {
      headerCell: {
        background: '{surface.50}',
        hoverBackground: '{surface.100}',
        selectedBackground: '{surface.50}',
        color: '{surface.600}',
        hoverColor: '{surface.800}',
        selectedColor: '{surface.950}',
        borderColor: '{surface.200}',
        padding: '0.625rem 1rem',
      },
      bodyCell: {
        borderColor: '{surface.200}',
        padding: '0.875rem 1rem',
      },
      row: {
        hoverBackground: '{surface.50}',
      },
    },
    // Paginadores y pestañas se apoyan en la superficie que los contiene (papel o tarjeta).
    paginator: {
      root: { background: 'transparent' },
      navButton: { borderRadius: '0.375rem' },
    },
    tabs: {
      tablist: { background: 'transparent', borderColor: '{surface.200}' },
      tabpanel: { background: 'transparent' },
    },
    dialog: {
      title: { fontSize: '1.25rem', fontWeight: '600' },
    },
    skeleton: {
      root: { borderRadius: '0.375rem', background: '{surface.200}' },
    },
    progressspinner: {
      root: {
        colorOne: '{primary.700}',
        colorTwo: '{primary.700}',
        colorThree: '{primary.700}',
        colorFour: '{primary.700}',
      },
    },
  },
});
