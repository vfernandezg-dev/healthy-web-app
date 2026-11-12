import { Component, computed, inject, output, signal, input, linkedSignal } from '@angular/core';
import { FormField, form, max, maxLength, min, required } from '@angular/forms/signals';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import type { RewardResponse } from '@core/api/schema';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { RewardsApi } from '../data/rewards-api';
import { PAGE_SIZE } from '@shared/table/page-size';
import { ContentApi } from '@features/content/data/content-api';
import { MealPlansApi } from '@features/meal-plans/data/meal-plans-api';
import { FormDialog } from '@shared/forms/form-dialog';
import { formSubmitter } from '@shared/forms/form-submitter';

type PrizeType = 'CONTENT' | 'MEAL_PLAN';

interface RewardModel {
  title: string;
  description: string;
  requiredStreakDays: number | null;
  prizeType: PrizeType;
  prizeId: string | null;
}

/** Un contenido o un plan como opción del desplegable del premio. */
function optionsFor(prizes: readonly { id: string; title: string }[]) {
  return prizes.map((prize) => ({ label: prize.title, value: prize.id }));
}

/** Crear o editar una recompensa. El premio es un contenido o un plan propio y publicado. La página lo crea al abrirlo. */
@Component({
  selector: 'app-reward-dialog',
  imports: [
    FormField,
    InputText,
    InputNumber,
    Textarea,
    Select,
    SelectButton,
    LabeledField,
    FormDialog,
  ],
  templateUrl: './reward-dialog.html',
})
export class RewardDialog {
  private readonly api = inject(RewardsApi);

  private readonly submitForm = formSubmitter();

  /** La recompensa que se edita; null para crear una. */
  readonly reward = input.required<RewardResponse | null>();
  readonly saved = output<RewardResponse>();
  readonly closed = output();

  protected readonly open = signal(true);
  protected readonly editing = computed(() => this.reward() !== null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;
  protected readonly prizeTypes = [
    { label: 'Un contenido', value: 'CONTENT' },
    { label: 'Un plan', value: 'MEAL_PLAN' },
  ];

  /**
   * Premios posibles: sus contenidos y sus planes publicados (todos de una vez). Se piden al abrir el diálogo: la
   * página lo crea solo entonces.
   */
  private readonly content = inject(ContentApi).mine(
    signal({ status: 'PUBLISHED', page: 0, size: PAGE_SIZE.options, sort: 'updatedAt,desc' }),
  );
  private readonly plans = inject(MealPlansApi).mine(
    signal({ status: 'PUBLISHED', page: 0, size: PAGE_SIZE.options, sort: 'title,asc' }),
  );

  protected readonly model = linkedSignal<RewardModel>(() => {
    const reward = this.reward();
    return {
      title: reward?.title ?? '',
      description: reward?.description ?? '',
      requiredStreakDays: reward?.requiredStreakDays ?? 7,
      prizeType: reward?.target.type ?? 'CONTENT',
      prizeId: reward?.target.id ?? null,
    };
  });
  protected readonly rewardForm = form(this.model, (path) => {
    required(path.title, { message: 'Ponle un nombre' });
    maxLength(path.title, 120, { message: 'Máximo 120 caracteres' });
    required(path.description, { message: 'Describe la recompensa' });
    maxLength(path.description, 500, { message: 'Máximo 500 caracteres' });
    required(path.requiredStreakDays, { message: 'Indica cuántos días' });
    min(path.requiredStreakDays, 1, { message: 'Al menos 1 día' });
    max(path.requiredStreakDays, 365, { message: 'Como mucho 365 días' });
    required(path.prizeId, { message: 'Elige el premio' });
  });

  /**
   * Opciones del premio (la API ya manda solo lo publicado). Si una recarga trae lo mismo, conserva el array
   * anterior: así el desplegable no se vuelve a pintar (ni pierde la opción que se está pulsando) cuando llega la
   * respuesta con la lista abierta.
   */
  protected readonly prizeOptions = computed(
    () => {
      if (this.model().prizeType === 'CONTENT') {
        return optionsFor(this.content.hasValue() ? this.content.value().content : []);
      }
      return optionsFor(this.plans.hasValue() ? this.plans.value().content : []);
    },
    {
      equal: (a, b) =>
        a.length === b.length &&
        a.every((option, index) => {
          const other = b.at(index);
          return option.value === other?.value && option.label === other.label;
        }),
    },
  );

  protected save(event: Event): Promise<void> {
    return this.submitForm(event, this.rewardForm, {
      failure: this.failure,
      save: () => {
        const value = this.model();
        const body = {
          title: value.title.trim(),
          description: value.description.trim(),
          // El esquema exige los días y el premio: aquí nunca son null.
          requiredStreakDays: value.requiredStreakDays ?? 1,
          contentItemId: value.prizeType === 'CONTENT' ? value.prizeId : null,
          mealPlanId: value.prizeType === 'MEAL_PLAN' ? value.prizeId : null,
        };
        const current = this.reward();
        return current ? this.api.update(current.id, body) : this.api.create(body);
      },
      onSuccess: (reward) => {
        this.saved.emit(reward);
        this.open.set(false);
      },
    });
  }
}
