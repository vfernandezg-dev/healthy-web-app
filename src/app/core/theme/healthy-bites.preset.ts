import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

/**
 * Preset de PrimeNG con la marca de Healthy Bites, sobre Aura. Los colores son los de
 * src/styles/tokens.css (los mismos que la landing).
 *
 * - primary: escala brand. El color de acción es brand-700 (blanco encima: 6:1, WCAG AA); el foco, brand-600.
 * - surface: neutros verdosos de surface (#fbfdfb) a ink (#12261b). surface-500 da 4,7:1 sobre blanco.
 * - Los botones de severidad usan tonos 700: los 500 de Aura no llegan a 4,5:1 con texto blanco.
 *
 * Solo tema claro: el oscuro llegará con la clase .app-dark (darkModeSelector) y valores light-dark().
 */
export const HealthyBitesPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#effaf3',
      100: '#d9f2e2',
      200: '#b5e5c8',
      300: '#8fd9ad',
      400: '#5bbf85',
      500: '#3aa56a',
      600: '#2e8b57',
      700: '#237047',
      800: '#1d593a',
      900: '#17482f',
      950: '#0b2a1b',
      color: '{primary.700}',
      contrastColor: '#ffffff',
      hoverColor: '{primary.800}',
      activeColor: '{primary.900}',
    },
    surface: {
      0: '#ffffff',
      50: '#fbfdfb',
      100: '#f2f7f3',
      200: '#e3ece6',
      300: '#ccd9d0',
      400: '#9fb1a5',
      500: '#66786c',
      600: '#546759',
      700: '#4b5d52',
      800: '#2c3d33',
      900: '#1b2f23',
      950: '#12261b',
    },
    text: {
      color: '{surface.950}',
      hoverColor: '{surface.950}',
      mutedColor: '{surface.700}',
      hoverMutedColor: '{surface.800}',
    },
    highlight: {
      background: '#c4f2d0',
      focusBackground: '{primary.200}',
      color: '{primary.950}',
      focusColor: '{primary.950}',
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
      borderRadius: '0.75rem',
      color: '{text.color}',
      placeholderColor: '{surface.500}',
      floatLabelColor: '{surface.700}',
      floatLabelFocusColor: '{primary.700}',
      floatLabelActiveColor: '{surface.700}',
      focusBorderColor: '{primary.600}',
    },
    content: {
      borderRadius: '1rem',
    },
    list: {
      option: {
        borderRadius: '0.5rem',
      },
    },
    navigation: {
      item: {
        borderRadius: '0.75rem',
      },
    },
    overlay: {
      select: {
        borderRadius: '0.75rem',
      },
      popover: {
        borderRadius: '1rem',
      },
      modal: {
        borderRadius: '1.5rem',
        padding: '1.5rem',
      },
    },
  },
  components: {
    button: {
      root: {
        borderRadius: '9999px',
        paddingX: '1.125rem',
        gap: '0.5rem',
        label: { fontWeight: '600' },
        danger: {
          background: '{red.700}',
          hoverBackground: '{red.800}',
          activeBackground: '{red.900}',
          borderColor: '{red.700}',
          hoverBorderColor: '{red.800}',
          activeBorderColor: '{red.900}',
          focusRing: { color: '{red.700}' },
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
        secondary: {
          color: '{surface.700}',
          hoverColor: '{surface.800}',
          activeColor: '{surface.900}',
        },
      },
      outlined: {
        danger: { color: '{red.700}', borderColor: '{red.300}' },
      },
      text: {
        danger: { color: '{red.700}' },
        secondary: { color: '{surface.700}' },
      },
    },
    // Opciones de p-selectbutton: el gris de Aura (surface-500 sobre surface-100) se queda en 4,3:1.
    togglebutton: {
      root: {
        color: '{surface.700}',
        hoverColor: '{surface.900}',
        checkedColor: '{primary.900}',
        borderRadius: '9999px',
      },
      content: {
        borderRadius: '9999px',
        padding: '0.25rem 0.875rem',
      },
      icon: {
        color: '{surface.700}',
        hoverColor: '{surface.900}',
        checkedColor: '{primary.900}',
      },
    },
    card: {
      root: {
        borderRadius: '1.5rem',
        shadow: '0 1px 2px rgb(18 38 27 / 0.04), 0 8px 24px -8px rgb(18 38 27 / 0.1)',
      },
      body: {
        padding: '1.5rem',
        gap: '0.75rem',
      },
      title: {
        fontWeight: '700',
      },
    },
  },
});
