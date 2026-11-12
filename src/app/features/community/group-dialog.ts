import { Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, submit } from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '../../core/api/problem';
import type { GroupResponse } from '../../core/api/schema';
import { LabeledField, fieldDescription } from '../../shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '../../shared/forms/server-errors';
import { GROUP_VISIBILITY_LABELS, type GroupVisibility, optionsOf } from '../../shared/i18n/labels';
import { CommunityApi } from './data/community-api';

interface GroupModel {
  name: string;
  description: string;
  visibility: GroupVisibility;
}

/** Crear o editar un grupo. Se abre con {@link GroupDialog.open}. */
@Component({
  selector: 'app-group-dialog',
  imports: [
    FormField,
    Dialog,
    InputText,
    Textarea,
    SelectButton,
    Message,
    ButtonDirective,
    ButtonLabel,
    LabeledField,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="editing() ? 'Editar el grupo' : 'Nuevo grupo'"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(32rem,calc(100vw-2rem))]"
    >
      @if (failure(); as message) {
        <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
      }
      <form id="group-form" class="space-y-5" novalidate (submit)="onSubmit($event)">
        <app-field label="Nombre" inputId="group-name" [field]="groupForm.name">
          <input
            pInputText
            id="group-name"
            class="w-full"
            [formField]="groupForm.name"
            [attr.aria-describedby]="describe('group-name', groupForm.name)"
          />
        </app-field>
        <app-field
          label="Descripción"
          inputId="group-description"
          [field]="groupForm.description"
          [optional]="true"
        >
          <textarea
            pTextarea
            id="group-description"
            rows="3"
            class="w-full"
            [formField]="groupForm.description"
            [attr.aria-describedby]="describe('group-description', groupForm.description)"
          ></textarea>
        </app-field>
        <div>
          <span id="group-visibility-label" class="mb-1.5 block text-sm font-semibold text-ink"
            >¿Quién puede leerlo?</span
          >
          <p-selectbutton
            ariaLabelledBy="group-visibility-label"
            [options]="visibilityOptions"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            [formField]="groupForm.visibility"
          />
          <p class="mt-1.5 text-sm text-muted">
            {{
              model().visibility === 'PUBLIC'
                ? 'Cualquiera puede entrar y leer.'
                : 'Hay que pedir entrar y tú apruebas cada solicitud.'
            }}
          </p>
        </div>
      </form>
      <ng-template #footer>
        <button
          pButton
          type="button"
          severity="secondary"
          variant="text"
          (click)="visible.set(false)"
        >
          <span pButtonLabel>Cancelar</span>
        </button>
        <button pButton type="submit" form="group-form" [loading]="groupForm().submitting()">
          <span pButtonLabel>{{ editing() ? 'Guardar' : 'Crear el grupo' }}</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class GroupDialog {
  private readonly api = inject(CommunityApi);

  readonly saved = output<GroupResponse>();

  protected readonly visible = signal(false);
  private readonly group = signal<GroupResponse | null>(null);
  protected readonly editing = computed(() => this.group() !== null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;
  protected readonly visibilityOptions = optionsOf(GROUP_VISIBILITY_LABELS);

  protected readonly model = signal<GroupModel>({
    name: '',
    description: '',
    visibility: 'PUBLIC',
  });
  protected readonly groupForm = form(this.model, (path) => {
    required(path.name, { message: 'Ponle un nombre' });
    maxLength(path.name, 80, { message: 'Máximo 80 caracteres' });
    maxLength(path.description, 500, { message: 'Máximo 500 caracteres' });
  });

  open(group: GroupResponse | null): void {
    this.group.set(group);
    this.failure.set(null);
    this.groupForm().reset({
      name: group?.name ?? '',
      description: group?.description ?? '',
      visibility: group?.visibility ?? 'PUBLIC',
    });
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.groupForm, {
      action: async () => {
        const value = this.model();
        const body = {
          name: value.name.trim(),
          description: value.description.trim() || null,
          visibility: value.visibility,
        };
        const current = this.group();
        try {
          const saved = current
            ? await this.api.updateGroup(current.id, body)
            : await this.api.createGroup(body);
          this.visible.set(false);
          this.saved.emit(saved);
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.groupForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
