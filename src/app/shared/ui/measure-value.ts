import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

/** Un número con su unidad («172 cm»), o «—» (y «Sin datos» para lectores de pantalla) si no lo hay. */
@Component({
  selector: 'app-measure-value',
  imports: [DecimalPipe],
  template: `
    @if (value() !== null) {
      {{ value() | number: digits() }} {{ unit() }}
    } @else {
      <span class="text-muted" aria-hidden="true">—</span>
      <span class="sr-only">Sin datos</span>
    }
  `,
})
export class MeasureValue {
  readonly value = input.required<number | null>();
  readonly unit = input('');
  /** Formato de DecimalPipe. */
  readonly digits = input('1.0-1');
}
