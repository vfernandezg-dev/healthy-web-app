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
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
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
      // Inyección con inject(), estado con signals y entradas/salidas con input()/output().
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/prefer-signals': 'error',
      '@angular-eslint/prefer-output-readonly': 'error',
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
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
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,mjs,ts}', 'e2e/**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  prettier,
);
