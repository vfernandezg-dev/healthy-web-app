import { Component, input } from '@angular/core';
import {
  type FieldTree,
  FormField,
  type SchemaPathTree,
  max,
  maxLength,
  min,
  required,
} from '@angular/forms/signals';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import type { MealPlanDetailResponse, MealPlanRequest } from '@core/api/schema';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import {
  GOAL_LABELS,
  type MealPlanGoal,
  TIER_LABELS,
  type Tier,
  optionsOf,
} from '@shared/i18n/labels';

export interface PlanModel {
  title: string;
  description: string;
  goal: MealPlanGoal | null;
  requiredTier: Tier;
  durationDays: number | null;
}

export function emptyPlan(): PlanModel {
  return { title: '', description: '', goal: null, requiredTier: 'BASIC', durationDays: 7 };
}

export function planModelOf(detail: MealPlanDetailResponse): PlanModel {
  const { title, description, goal, requiredTier, durationDays } = detail.plan;
  return { title, description, goal, requiredTier, durationDays };
}

/** Reglas del plan (las mismas que valida la API). */
export function planSchema(path: SchemaPathTree<PlanModel>): void {
  required(path.title, { message: 'Ponle un título' });
  maxLength(path.title, 120, { message: 'Máximo 120 caracteres' });
  required(path.description, { message: 'Describe el plan' });
  maxLength(path.description, 2000, { message: 'Máximo 2000 caracteres' });
  required(path.goal, { message: 'Elige el objetivo' });
  required(path.durationDays, { message: 'Indica cuántos días dura' });
  min(path.durationDays, 1, { message: 'Al menos 1 día' });
  max(path.durationDays, 365, { message: 'Como mucho 365 días' });
}

/** Cuerpo para la API (el formulario ya ha validado los obligatorios). */
export function toPlanRequest(model: PlanModel): MealPlanRequest {
  return {
    title: model.title.trim(),
    description: model.description.trim(),
    goal: model.goal ?? 'MAINTENANCE',
    requiredTier: model.requiredTier,
    durationDays: model.durationDays ?? 1,
  };
}

/** Campos de un plan para crear o editar. Va dentro del <form> de la página, que gestiona el envío. */
@Component({
  selector: 'app-plan-fields',
  imports: [FormField, InputText, Textarea, Select, InputNumber, LabeledField],
  // Contenedor de consulta: en el lateral estrecho del editor, los tres selectores se apilan.
  host: { class: '@container block space-y-5' },
  templateUrl: './plan-fields.html',
})
export class PlanFields {
  readonly form = input.required<FieldTree<PlanModel>>();

  protected readonly describe = fieldDescription;
  protected readonly goalOptions = optionsOf(GOAL_LABELS);
  protected readonly tierOptions = optionsOf(TIER_LABELS).map((option) => ({
    ...option,
    label: option.value === 'BASIC' ? 'Gratis para todos' : `Solo ${option.label}`,
  }));
}
