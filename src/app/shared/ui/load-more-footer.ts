import { Component, input } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import type { LoadMore } from '../utils/load-more';

/**
 * Pie de una lista con «Ver más» (ver `loadMore`): el botón mientras quedan páginas, o el error con «Reintentar» si
 * la última petición falló.
 */
@Component({
  selector: 'app-load-more-footer',
  imports: [ButtonDirective],
  host: { class: 'block' },
  template: `
    @if (list().resource.error()) {
      <p class="text-sm text-danger-700" role="alert">
        {{ errorText() }}
        <button type="button" class="font-semibold underline" (click)="list().resource.reload()">
          Reintentar
        </button>
      </p>
    } @else if (list().hasMore()) {
      <button
        pButton
        type="button"
        size="small"
        severity="secondary"
        variant="outlined"
        class="w-full"
        [attr.aria-describedby]="describedBy() ?? null"
        [loading]="list().resource.isLoading()"
        (click)="list().more()"
      >
        {{ label() }}
      </button>
    }
  `,
})
export class LoadMoreFooter {
  readonly list = input.required<LoadMore<unknown>>();
  /** «Ver más comentarios», «Ver más miembros». */
  readonly label = input.required<string>();
  readonly errorText = input('No se ha podido cargar la lista.');
  /** Id de lo que da contexto al botón (el título de la publicación, por ejemplo). */
  readonly describedBy = input<string>();
}
