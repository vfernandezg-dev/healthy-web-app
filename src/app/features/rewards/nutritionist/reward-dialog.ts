import { Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, required, submit } from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '@core/api/problem';
import type { RewardResponse } from '@core/api/schema';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
import { RewardsApi } from '../data/rewards-api';

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

/** Crear o editar una recompensa. El premio es un contenido o un plan propio y publicado. */
@Component({
  selector: 'app-reward-dialog',
  imports: [
    FormField,
    Dialog,
    InputText,
    InputNumber,
    Textarea,
    Select,
    SelectButton,
    Message,
    ButtonDirective,
    ButtonLabel,
    LabeledField,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="editing() ? 'Editar la recompensa' : 'Nueva recompensa'"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(34rem,calc(100vw-2rem))]"
    >
      @if (failure(); as message) {
        <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
      }
      <form id="reward-form" class="space-y-5" novalidate (submit)="onSubmit($event)">
        <app-field label="Nombre" inputId="reward-title" [field]="rewardForm.title">
          <input
            pInputText
            id="reward-title"
            class="w-full"
            placeholder="Por ejemplo: Constancia de 7 días"
            [formField]="rewardForm.title"
            [attr.aria-describedby]="describe('reward-title', rewardForm.title)"
          />
        </app-field>
        <app-field
          label="Descripción"
          inputId="reward-description"
          [field]="rewardForm.description"
        >
          <textarea
            pTextarea
            id="reward-description"
            rows="2"
            class="w-full"
            [formField]="rewardForm.description"
            [attr.aria-describedby]="describe('reward-description', rewardForm.description)"
          ></textarea>
        </app-field>
        <app-field
          label="Días seguidos"
          inputId="reward-days"
          [field]="rewardForm.requiredStreakDays"
        >
          <p-inputnumber
            inputId="reward-days"
            suffix=" días"
            [useGrouping]="false"
            [fluid]="true"
            [formField]="rewardForm.requiredStreakDays"
            [ariaDescribedBy]="describe('reward-days', rewardForm.requiredStreakDays) ?? undefined"
          />
        </app-field>
        <div>
          <span id="reward-prize-type-label" class="mb-1.5 block text-sm font-semibold text-ink"
            >Premio</span
          >
          <p-selectbutton
            ariaLabelledBy="reward-prize-type-label"
            [options]="prizeTypes"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            [formField]="rewardForm.prizeType"
          />
        </div>
        <app-field
          [label]="model().prizeType === 'CONTENT' ? 'Contenido' : 'Plan alimenticio'"
          inputId="reward-prize"
          [field]="rewardForm.prizeId"
          hint="Solo aparecen tus contenidos y planes publicados."
        >
          <p-select
            appendTo="body"
            inputId="reward-prize"
            ariaLabelledBy="reward-prize-label"
            [options]="prizeOptions()"
            optionLabel="label"
            optionValue="value"
            placeholder="Elige uno"
            [fluid]="true"
            [formField]="rewardForm.prizeId"
          />
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
        <button pButton type="submit" form="reward-form" [loading]="rewardForm().submitting()">
          <span pButtonLabel>{{ editing() ? 'Guardar' : 'Crear la recompensa' }}</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class RewardDialog {
  private readonly api = inject(RewardsApi);

  readonly saved = output<RewardResponse>();

  protected readonly visible = signal(false);
  private readonly reward = signal<RewardResponse | null>(null);
  protected readonly editing = computed(() => this.reward() !== null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;
  protected readonly prizeTypes = [
    { label: 'Un contenido', value: 'CONTENT' },
    { label: 'Un plan', value: 'MEAL_PLAN' },
  ];

  private readonly content = this.api.ownContent();
  private readonly plans = this.api.ownMealPlans();

  protected readonly model = signal<RewardModel>({
    title: '',
    description: '',
    requiredStreakDays: 7,
    prizeType: 'CONTENT',
    prizeId: null,
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
        a.every(
          (option, index) => option.value === b[index].value && option.label === b[index].label,
        ),
    },
  );

  open(reward: RewardResponse | null): void {
    this.reward.set(reward);
    this.failure.set(null);
    this.rewardForm().reset({
      title: reward?.title ?? '',
      description: reward?.description ?? '',
      requiredStreakDays: reward?.requiredStreakDays ?? 7,
      prizeType: reward?.target.type ?? 'CONTENT',
      prizeId: reward?.target.id ?? null,
    });
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.rewardForm, {
      action: async () => {
        const value = this.model();
        const body = {
          title: value.title.trim(),
          description: value.description.trim(),
          requiredStreakDays: value.requiredStreakDays ?? 1,
          contentItemId: value.prizeType === 'CONTENT' ? value.prizeId : null,
          mealPlanId: value.prizeType === 'MEAL_PLAN' ? value.prizeId : null,
        };
        const current = this.reward();
        try {
          const saved = current
            ? await this.api.update(current.id, body)
            : await this.api.create(body);
          this.visible.set(false);
          this.saved.emit(saved);
          return undefined;
        } catch (error) {
          const problem = toProblem(error);
          if (problem.errors.length > 0) {
            return serverFieldErrors(this.rewardForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
