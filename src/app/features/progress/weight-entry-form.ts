import { Component, inject, input, linkedSignal, model, output } from '@angular/core';
import {
  FormField,
  form,
  max,
  maxLength,
  min,
  required,
  schema,
  validate,
} from '@angular/forms/signals';
import { ButtonDirective } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import type { WeightEntryResponse } from '@core/api/schema';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { todayIso } from '@shared/utils/date';
import { ProgressApi } from './data/progress-api';

interface EntryModel {
  measuredOn: string;
  weightKg: number | null;
  notes: string;
}

export const entrySchema = schema<EntryModel>((path) => {
  required(path.measuredOn, { message: 'Indica el día' });
  validate(path.measuredOn, ({ value }) =>
    value() > todayIso()
      ? { kind: 'future', message: 'La fecha del pesaje no puede ser futura' }
      : undefined,
  );
  required(path.weightKg, { message: 'Indica tu peso' });
  min(path.weightKg, 20, { message: 'El peso mínimo es 20 kg' });
  max(path.weightKg, 400, { message: 'El peso máximo es 400 kg' });
  maxLength(path.notes, 500, { message: 'Máximo 500 caracteres' });
});

function modelOf(entry: WeightEntryResponse | null): EntryModel {
  return entry
    ? { measuredOn: entry.measuredOn, weightKg: entry.weightKg, notes: entry.notes ?? '' }
    : { measuredOn: todayIso(), weightKg: null, notes: '' };
}

/** Añadir un pesaje a la meta, o editar el que se elija en la tabla (`editing`). */
@Component({
  selector: 'app-weight-entry-form',
  imports: [FormField, InputText, InputNumber, ButtonDirective, LabeledField],
  host: { class: 'block' },
  templateUrl: './weight-entry-form.html',
})
export class WeightEntryForm {
  private readonly api = inject(ProgressApi);
  private readonly submitForm = formSubmitter();

  readonly goalId = input.required<string>();
  /** El pesaje que se edita (lo elige la tabla); null para añadir uno. */
  readonly editing = model<WeightEntryResponse | null>(null);
  /** Guardado: `edited` si era un pesaje que ya existía. */
  readonly saved = output<{ readonly edited: boolean }>();

  protected readonly today = todayIso();
  protected readonly describe = fieldDescription;
  protected readonly model = linkedSignal(() => modelOf(this.editing()));
  protected readonly entryForm = form(this.model, entrySchema);

  protected save(event: Event): Promise<void> {
    const editing = this.editing();
    return this.submitForm(event, this.entryForm, {
      // Un pesaje repetido o con fecha futura: el error va en la fecha.
      codeFields: {
        'weight-entry-exists': this.entryForm.measuredOn,
        'future-date': this.entryForm.measuredOn,
      },
      save: () => {
        const value = this.model();
        const body = {
          measuredOn: value.measuredOn,
          // El esquema exige el peso: aquí nunca es null.
          weightKg: value.weightKg ?? 0,
          notes: value.notes.trim() || null,
        };
        return editing
          ? this.api.updateEntry(this.goalId(), editing.id, body)
          : this.api.addEntry(this.goalId(), body);
      },
      onSuccess: () => {
        this.cancel();
        this.saved.emit({ edited: editing !== null });
      },
    });
  }

  /** Deja de editar y vacía el formulario (para el siguiente pesaje). */
  protected cancel(): void {
    this.editing.set(null);
    this.entryForm().reset(modelOf(null));
  }
}
