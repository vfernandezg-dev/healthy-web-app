import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, required, schema } from '@angular/forms/signals';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import type { MealPlanDetailResponse, MealResponse } from '@core/api/schema';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { MEAL_CATEGORY_LABELS, type MealCategory, optionsOf } from '@shared/i18n/labels';
import { positionOnSave } from '../data/meal-position';
import { MealPlansApi } from '../data/meal-plans-api';

interface MealModel {
  dayNumber: number;
  category: MealCategory | null;
  name: string;
  calories: number | null;
  description: string;
}

export const mealSchema = schema<MealModel>((path) => {
  required(path.category, { message: 'Elige el momento del día' });
  required(path.name, { message: 'Escribe el plato' });
  maxLength(path.name, 120, { message: 'Máximo 120 caracteres' });
  required(path.calories, { message: 'Indica las calorías' });
  min(path.calories, 0, { message: 'No puede ser negativo' });
  max(path.calories, 10000, { message: 'Como mucho 10 000 kcal' });
  maxLength(path.description, 1000, { message: 'Máximo 1000 caracteres' });
});

/** Qué comida se edita, o en qué día se añade una nueva. */
export type MealTarget =
  { readonly meal: MealResponse } | { readonly meal: null; readonly day: number };

function modelOf(target: MealTarget): MealModel {
  const { meal } = target;
  return meal
    ? {
        dayNumber: meal.dayNumber,
        category: meal.category,
        name: meal.name,
        calories: meal.calories,
        description: meal.description ?? '',
      }
    : { dayNumber: target.day, category: null, name: '', calories: null, description: '' };
}

/** Añadir o editar una comida de un plan. La página lo crea al abrirlo (ver `dialogState`). */
@Component({
  selector: 'app-meal-dialog',
  imports: [FormField, InputText, InputNumber, Select, Textarea, LabeledField, FormDialog],
  templateUrl: './meal-dialog.html',
})
export class MealDialog {
  private readonly api = inject(MealPlansApi);
  private readonly submitForm = formSubmitter();

  /** El plan con sus comidas: la nueva va al final del día elegido. */
  readonly plan = input.required<MealPlanDetailResponse>();
  readonly target = input.required<MealTarget>();
  /** La comida guardada (nueva o editada). */
  readonly saved = output<MealResponse>();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly failure = signal<string | null>(null);
  protected readonly editing = computed(() => this.target().meal !== null);
  protected readonly describe = fieldDescription;
  protected readonly categoryOptions = optionsOf(MEAL_CATEGORY_LABELS);
  protected readonly dayOptions = computed(() =>
    Array.from({ length: this.plan().plan.durationDays }, (_, index) => ({
      label: `Día ${index + 1}`,
      value: index + 1,
    })),
  );

  protected readonly model = linkedSignal(() => modelOf(this.target()));
  protected readonly mealForm = form(this.model, mealSchema);

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.mealForm, {
      failure: this.failure,
      save: () => {
        const value = this.model();
        const { plan, meals } = this.plan();
        const current = this.target().meal;
        const body = {
          dayNumber: value.dayNumber,
          position: positionOnSave(meals, current, value.dayNumber),
          // El esquema exige el momento y las calorías: aquí nunca son null.
          category: value.category ?? 'LUNCH',
          name: value.name.trim(),
          calories: value.calories ?? 0,
          description: value.description.trim() || null,
        };
        return current
          ? this.api.updateMeal(plan.id, current.id, body)
          : this.api.addMeal(plan.id, body);
      },
      onSuccess: (meal) => {
        this.saved.emit(meal);
        this.open.set(false);
      },
    });
  }
}
