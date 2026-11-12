// @ts-check
import js from '@eslint/js';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Fronteras entre capas (docs/frontend-guidelines.md): core ← shared ← features, y layout aparte. De otra feature
 * solo se importa su `data/` (API y modelos); sus páginas y componentes son internos. Fuera de la propia carpeta se
 * importa con alias, nunca con `../../`.
 */
const LAYERS = {
  'src/app/core/**': ['@shared', '@features', '@layout'],
  'src/app/shared/**': ['@features', '@layout'],
  'src/app/layout/**': ['@features'],
  'src/app/features/**': ['@layout'],
};

const COMMON_RESTRICTIONS = [
  {
    regex: String.raw`^\.\./\.\./`,
    message:
      'Fuera de la propia carpeta, importa con el alias (@core, @shared, @layout, @features).',
  },
];

function boundaries(files, forbidden) {
  const patterns = [
    ...COMMON_RESTRICTIONS,
    ...forbidden.map((alias) => ({
      regex: `^${alias}/`,
      message: `Esta capa no puede depender de ${alias} (ver docs/frontend-guidelines.md).`,
    })),
  ];
  if (files === 'src/app/features/**') {
    patterns.push({
      regex: '^@features/[^/]+/(?!data/)',
      message:
        'De otra feature solo se importa su data/ (API y modelos); dentro de la misma, con rutas relativas.',
    });
  }
  return { files: [files], rules: { 'no-restricted-imports': ['error', { patterns }] } };
}

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.angular/',
      'node_modules/',
      'coverage/',
      'playwright-report/',
      'playwright-report-fullstack/',
      'test-results/',
      // Generado desde el contrato OpenAPI (pnpm api:gen).
      'src/app/core/api/schema.d.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      js.configs.recommended,
      // Con tipos: promesas sin esperar, condiciones siempre ciertas, APIs deprecadas, switch incompletos...
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json', './tsconfig.e2e.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      // Inyección con inject(), estado con signals y entradas/salidas con input()/output()/model().
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-signal-model': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/prefer-output-emitter-ref': 'error',
      '@angular-eslint/no-uncalled-signals': 'error',
      '@angular-eslint/computed-must-return': 'error',
      '@angular-eslint/no-implicit-take-until-destroyed': 'error',
      '@angular-eslint/no-duplicates-in-metadata-arrays': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      // Con textos, || es a propósito: una cadena vacía cuenta como «sin valor».
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        { ignorePrimitives: { string: true } },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Scripts de Node en JavaScript: sin tsconfig, sin reglas con tipos.
    files: ['**/*.{js,mjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  ...Object.entries(LAYERS).map(([files, forbidden]) => boundaries(files, forbidden)),
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      '@angular-eslint/template/prefer-control-flow': 'error',
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/prefer-ngsrc': 'error',
      // Sin style="" estático (para eso, clases); sí enlaces a valores dinámicos como [style.width.%].
      '@angular-eslint/template/no-inline-styles': [
        'error',
        { allowNgStyle: false, allowBindToStyle: true },
      ],
      '@angular-eslint/template/button-has-type': 'error',
      '@angular-eslint/template/prefer-at-empty': 'error',
      '@angular-eslint/template/prefer-at-else': 'error',
      '@angular-eslint/template/prefer-contextual-for-variables': 'error',
      '@angular-eslint/template/prefer-template-literal': 'error',
      '@angular-eslint/template/no-empty-control-flow': 'error',
      // class="fijas" junto a [class]="variables" es la precedencia de estilos de Angular, no un duplicado.
      '@angular-eslint/template/no-duplicate-attributes': [
        'error',
        { allowStylePrecedenceDuplicates: true },
      ],
      '@angular-eslint/template/no-any': 'error',
      '@angular-eslint/template/conditional-complexity': ['error', { maxComplexity: 4 }],
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,mjs,ts}', 'e2e/**/*.ts', 'e2e-fullstack/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettier,
);
