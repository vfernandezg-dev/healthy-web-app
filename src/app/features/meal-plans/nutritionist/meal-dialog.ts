import { Component, computed, inject, input, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, required, submit } from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '../../../core/api/problem';
import type { MealResponse } from '../../../core/api/schema';
import { LabeledField, fieldDescription } from '../../../shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '../../../shared/forms/server-errors';
import { MEAL_CATEGORY_LABELS, type MealCategory, optionsOf } from '../../../shared/i18n/labels';
import { MealPlansApi } from '../data/meal-plans-api';

interface MealModel {
  dayNumber: number;
  category: MealCategory | null;
  name: string;
  calories: number | null;
  description: string;
}

/** Diálogo para añadir o editar una comida de un plan. Se abre con {@link MealDialog.open}. */
@Component({
  selector: 'app-meal-dialog',
  imports: [
    FormField,
    Dialog,
    InputText,
    InputNumber,
    Select,
    Textarea,
    Message,
    ButtonDirective,
    ButtonLabel,
    LabeledField,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="editing() ? 'Editar comida' : 'Nueva comida'"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(36rem,calc(100vw-2rem))]"
    >
      @if (failure(); as message) {
        <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
      }
      <form id="meal-form" class="space-y-5" novalidate (submit)="onSubmit($event)">
        <div class="grid gap-5 sm:grid-cols-2">
          <app-field label="Día" inputId="meal-day" [field]="mealForm.dayNumber">
            <p-select
              appendTo="body"
              inputId="meal-day"
              ariaLabelledBy="meal-day-label"
              [options]="dayOptions()"
              optionLabel="label"
              optionValue="value"
              [fluid]="true"
              [formField]="mealForm.dayNumber"
            />
          </app-field>
          <app-field label="Momento del día" inputId="meal-category" [field]="mealForm.category">
            <p-select
              appendTo="body"
              inputId="meal-category"
              ariaLabelledBy="meal-category-label"
              [options]="categoryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Elige uno"
              [fluid]="true"
              [formField]="mealForm.category"
            />
          </app-field>
        </div>
        <app-field label="Plato" inputId="meal-name" [field]="mealForm.name">
          <input
            pInputText
            id="meal-name"
            class="w-full"
            [formField]="mealForm.name"
            [attr.aria-describedby]="describe('meal-name', mealForm.name)"
          />
        </app-field>
        <app-field label="Calorías" inputId="meal-calories" [field]="mealForm.calories">
          <p-inputnumber
            inputId="meal-calories"
            suffix=" kcal"
            [fluid]="true"
            [formField]="mealForm.calories"
            [ariaDescribedBy]="describe('meal-calories', mealForm.calories) ?? undefined"
          />
        </app-field>
        <app-field
          label="Ingredientes o preparación"
          inputId="meal-description"
          [field]="mealForm.description"
          [optional]="true"
        >
          <textarea
            pTextarea
            id="meal-description"
            rows="3"
            class="w-full"
            [formField]="mealForm.description"
            [attr.aria-describedby]="describe('meal-description', mealForm.description)"
          ></textarea>
        </app-field>
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
        <button pButton type="submit" form="meal-form" [loading]="mealForm().submitting()">
          <span pButtonLabel>{{ editing() ? 'Guardar' : 'Añadir' }}</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class MealDialog {
  private readonly api = inject(MealPlansApi);

  readonly planId = input.required<string>();
  readonly durationDays = input.required<number>();
  /** Siguiente posición libre de un día (la comida nueva va al final). */
  readonly positionFor = input.required<(day: number) => number>();
  /** La comida guardada (nueva o editada). */
  readonly saved = output<MealResponse>();

  protected readonly visible = signal(false);
  private readonly meal = signal<MealResponse | null>(null);
  protected readonly editing = computed(() => this.meal() !== null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;
  protected readonly categoryOptions = optionsOf(MEAL_CATEGORY_LABELS);
  protected readonly dayOptions = computed(() =>
    Array.from({ length: this.durationDays() }, (_, index) => ({
      label: `Día ${index + 1}`,
      value: index + 1,
    })),
  );

  protected readonly model = signal<MealModel>({
    dayNumber: 1,
    category: null,
    name: '',
    calories: null,
    description: '',
  });
  protected readonly mealForm = form(this.model, (path) => {
    required(path.category, { message: 'Elige el momento del día' });
    required(path.name, { message: 'Escribe el plato' });
    maxLength(path.name, 120, { message: 'Máximo 120 caracteres' });
    required(path.calories, { message: 'Indica las calorías' });
    min(path.calories, 0, { message: 'No puede ser negativo' });
    max(path.calories, 10000, { message: 'Como mucho 10 000 kcal' });
    maxLength(path.description, 1000, { message: 'Máximo 1000 caracteres' });
  });

  /** Abre el diálogo para una comida nueva del día indicado o para editar una existente. */
  open(meal: MealResponse | null, day = 1): void {
    this.meal.set(meal);
    this.failure.set(null);
    const value: MealModel = meal
      ? {
          dayNumber: meal.dayNumber,
          category: meal.category,
          name: meal.name,
          calories: meal.calories,
          description: meal.description ?? '',
        }
      : { dayNumber: day, category: null, name: '', calories: null, description: '' };
    this.mealForm().reset(value);
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.mealForm, {
      action: async () => {
        const value = this.model();
        const current = this.meal();
        const position =
          current && current.dayNumber === value.dayNumber
            ? current.position
            : this.positionFor()(value.dayNumber);
        const body = {
          dayNumber: value.dayNumber,
          position,
          category: value.category ?? 'LUNCH',
          name: value.name.trim(),
          calories: value.calories ?? 0,
          description: value.description.trim() || null,
        };
        try {
          const saved = current
            ? await this.api.updateMeal(this.planId(), current.id, body)
            : await this.api.addMeal(this.planId(), body);
          this.visible.set(false);
          this.saved.emit(saved);
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.mealForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
