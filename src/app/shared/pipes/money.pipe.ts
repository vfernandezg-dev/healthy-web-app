import { LOCALE_ID, Pipe, type PipeTransform, inject } from '@angular/core';
import type { Money } from '../../core/api/schema';

/** Importe de la API (`{amount: "5.99", currency: "USD"}`) con el formato de la app: `5,99 US$`. */
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  private readonly locale = inject(LOCALE_ID);

  transform(money: Money | null | undefined): string {
    if (!money) {
      return '';
    }
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: money.currency,
    }).format(Number(money.amount));
  }
}
