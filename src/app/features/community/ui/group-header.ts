import { DatePipe, I18nPluralPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import {
  LucideLogOut,
  LucidePencil,
  LucideTrash,
  LucideUserPlus,
  LucideUsers,
} from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import type { GroupResponse } from '@core/api/schema';
import { MEMBERS_PLURAL, type Relation } from '../data/membership';
import { VisibilityBadge } from './visibility-badge';
import { Badge } from '@shared/ui/badge';

/** La ficha de un grupo con las acciones de quien lo mira: editar y borrar, salir, retirar la solicitud o entrar. */
@Component({
  selector: 'app-group-header',
  imports: [
    Badge,
    DatePipe,
    I18nPluralPipe,
    ButtonDirective,
    LucideUsers,
    LucidePencil,
    LucideTrash,
    LucideLogOut,
    LucideUserPlus,
    VisibilityBadge,
  ],
  host: { class: 'card mb-8 block p-6 sm:p-8' },
  templateUrl: './group-header.html',
})
export class GroupHeader {
  readonly group = input.required<GroupResponse>();
  readonly relation = input.required<Relation>();
  /** «Miembro», «Solicitud pendiente»… */
  readonly membershipLabel = input<string | null>(null);
  /** Entrando, saliendo o retirando la solicitud. */
  readonly pending = input(false);
  readonly edit = output();
  readonly remove = output();
  readonly join = output();
  readonly leave = output();

  protected readonly membersPlural = MEMBERS_PLURAL;
}
