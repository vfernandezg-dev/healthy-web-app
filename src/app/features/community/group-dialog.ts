import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormField, form, maxLength, required, schema } from '@angular/forms/signals';
import { InputText } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import type { GroupRequest, GroupResponse } from '@core/api/schema';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { GROUP_VISIBILITY_LABELS, type GroupVisibility, optionsOf } from '@shared/i18n/labels';
import { CommunityApi } from './data/community-api';

interface GroupModel {
  name: string;
  description: string;
  visibility: GroupVisibility;
}

/** Las reglas del formulario, las mismas que valida la API. */
export const groupSchema = schema<GroupModel>((path) => {
  required(path.name, { message: 'Ponle un nombre' });
  maxLength(path.name, 80, { message: 'Máximo 80 caracteres' });
  maxLength(path.description, 500, { message: 'Máximo 500 caracteres' });
});

function modelOf(group: GroupResponse | null): GroupModel {
  return {
    name: group?.name ?? '',
    description: group?.description ?? '',
    visibility: group?.visibility ?? 'PUBLIC',
  };
}

function requestOf(model: GroupModel): GroupRequest {
  return {
    name: model.name.trim(),
    description: model.description.trim() || null,
    visibility: model.visibility,
  };
}

/** Crear o editar un grupo. La página lo crea al abrirlo (ver `dialogState`). */
@Component({
  selector: 'app-group-dialog',
  imports: [FormField, InputText, Textarea, SelectButton, LabeledField, FormDialog],
  templateUrl: './group-dialog.html',
})
export class GroupDialog {
  private readonly api = inject(CommunityApi);
  private readonly submitForm = formSubmitter();

  /** El grupo que se edita; null para crear uno. */
  readonly group = input.required<GroupResponse | null>();
  readonly saved = output<GroupResponse>();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly failure = signal<string | null>(null);
  protected readonly editing = computed(() => this.group() !== null);
  protected readonly describe = fieldDescription;
  protected readonly visibilityOptions = optionsOf(GROUP_VISIBILITY_LABELS);

  protected readonly model = linkedSignal(() => modelOf(this.group()));
  protected readonly groupForm = form(this.model, groupSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.groupForm, {
      failure: this.failure,
      save: () => {
        const current = this.group();
        const body = requestOf(this.model());
        return current ? this.api.updateGroup(current.id, body) : this.api.createGroup(body);
      },
      onSuccess: (group) => {
        this.saved.emit(group);
        this.open.set(false);
      },
    });
  }
}
