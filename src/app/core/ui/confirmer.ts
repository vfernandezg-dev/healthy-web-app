import { Injectable, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';

export interface ConfirmOptions {
  readonly header: string;
  readonly message: string;
  /** Texto del botón que confirma, con el verbo de la acción («Eliminar», «Cancelar suscripción»...). */
  readonly acceptLabel: string;
  readonly rejectLabel?: string;
  /** Acción destructiva: el botón de confirmar va en rojo. */
  readonly danger?: boolean;
}

/** Diálogo de confirmación (p-confirmdialog en la raíz de la app). El foco empieza en «Cancelar». */
@Injectable({ providedIn: 'root' })
export class Confirmer {
  private readonly confirmation = inject(ConfirmationService);

  ask(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmation.confirm({
        header: options.header,
        message: options.message,
        acceptLabel: options.acceptLabel,
        rejectLabel: options.rejectLabel ?? 'Cancelar',
        acceptButtonProps: options.danger ? { severity: 'danger' } : {},
        rejectButtonProps: { severity: 'secondary', variant: 'text' },
        defaultFocus: 'reject',
        closeOnEscape: true,
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }
}
