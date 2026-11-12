import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Reglas WCAG 2.2 A y AA (incluye las de 2.0 y 2.1). */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Falla con la lista de infracciones de axe si la página no cumple WCAG 2.2 AA. */
export async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = results.violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}): ${violation.help} → ${violation.nodes
        .map((node) => node.target.join(' '))
        .join(', ')}`,
  );
  expect(summary, 'Infracciones de accesibilidad').toEqual([]);
}
