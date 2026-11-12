import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, required, schema } from '@angular/forms/signals';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import type { GoalRequest, GoalResponse } from '@core/api/schema';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { ProgressApi } from './data/progress-api';

interface GoalModel {
  title: string;
  targetWeightKg: number | null;
  description: string;
}

export const goalSchema = schema<GoalModel>((path) => {
  required(path.title, { message: 'Ponle un nombre' });
  maxLength(path.title, 120, { message: 'Máximo 120 caracteres' });
  required(path.targetWeightKg, { message: 'Indica tu peso objetivo' });
  min(path.targetWeightKg, 20, { message: 'El peso mínimo es 20 kg' });
  max(path.targetWeightKg, 400, { message: 'El peso máximo es 400 kg' });
  maxLength(path.description, 500, { message: 'Máximo 500 caracteres' });
});

function modelOf(goal: GoalResponse | null): GoalModel {
  return {
    title: goal?.title ?? '',
    targetWeightKg: goal?.targetWeightKg ?? null,
    description: goal?.description ?? '',
  };
}

function requestOf(model: GoalModel): GoalRequest {
  return {
    title: model.title.trim(),
    // El esquema exige el peso: aquí nunca es null.
    targetWeightKg: model.targetWeightKg ?? 0,
    description: model.description.trim() || null,
  };
}

/** Crear o editar una meta de peso. La página lo crea al abrirlo (ver `dialogState`). */
@Component({
  selector: 'app-goal-dialog',
  imports: [FormField, InputText, InputNumber, Textarea, LabeledField, FormDialog],
  templateUrl: './goal-dialog.html',
})
export class GoalDialog {
  private readonly api = inject(ProgressApi);
  private readonly submitForm = formSubmitter();

  /** La meta que se edita; null para crear una. */
  readonly goal = input.required<GoalResponse | null>();
  readonly saved = output<GoalResponse>();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly failure = signal<string | null>(null);
  protected readonly editing = computed(() => this.goal() !== null);
  protected readonly describe = fieldDescription;

  protected readonly model = linkedSignal(() => modelOf(this.goal()));
  protected readonly goalForm = form(this.model, goalSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.goalForm, {
      failure: this.failure,
      save: () => {
        const current = this.goal();
        const body = requestOf(this.model());
        return current ? this.api.update(current.id, body) : this.api.create(body);
      },
      onSuccess: (goal) => {
        this.saved.emit(goal);
        this.open.set(false);
      },
    });
  }
}
