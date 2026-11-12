import { Component, computed, inject, output, signal } from '@angular/core';
import { FormField, form, max, maxLength, min, required, submit } from '@angular/forms/signals';
import { ButtonDirective, ButtonLabel } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';
import { toProblem } from '@core/api/problem';
import type { GoalResponse } from '@core/api/schema';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import { focusFirstInvalid, serverFieldErrors } from '@shared/forms/server-errors';
import { ProgressApi } from './data/progress-api';

interface GoalModel {
  title: string;
  targetWeightKg: number | null;
  description: string;
}

/** Crear o editar una meta de peso. Se abre con {@link GoalDialog.open}. */
@Component({
  selector: 'app-goal-dialog',
  imports: [
    FormField,
    Dialog,
    InputText,
    InputNumber,
    Textarea,
    Message,
    ButtonDirective,
    ButtonLabel,
    LabeledField,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [header]="editing() ? 'Editar la meta' : 'Nueva meta'"
      [modal]="true"
      [draggable]="false"
      closeAriaLabel="Cerrar"
      styleClass="w-[min(32rem,calc(100vw-2rem))]"
    >
      @if (failure(); as message) {
        <p-message severity="error" class="mb-4 block">{{ message }}</p-message>
      }
      <form id="goal-form" class="space-y-5" novalidate (submit)="onSubmit($event)">
        <app-field label="Nombre de la meta" inputId="goal-title" [field]="goalForm.title">
          <input
            pInputText
            id="goal-title"
            class="w-full"
            placeholder="Por ejemplo: llegar a 70 kg en verano"
            [formField]="goalForm.title"
            [attr.aria-describedby]="describe('goal-title', goalForm.title)"
          />
        </app-field>
        <app-field label="Peso objetivo" inputId="goal-target" [field]="goalForm.targetWeightKg">
          <p-inputnumber
            inputId="goal-target"
            suffix=" kg"
            [minFractionDigits]="0"
            [maxFractionDigits]="1"
            [fluid]="true"
            [formField]="goalForm.targetWeightKg"
            [ariaDescribedBy]="describe('goal-target', goalForm.targetWeightKg) ?? undefined"
          />
        </app-field>
        <app-field
          label="Por qué te la propones"
          inputId="goal-description"
          [field]="goalForm.description"
          [optional]="true"
        >
          <textarea
            pTextarea
            id="goal-description"
            rows="3"
            class="w-full"
            [formField]="goalForm.description"
            [attr.aria-describedby]="describe('goal-description', goalForm.description)"
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
        <button pButton type="submit" form="goal-form" [loading]="goalForm().submitting()">
          <span pButtonLabel>{{ editing() ? 'Guardar' : 'Crear la meta' }}</span>
        </button>
      </ng-template>
    </p-dialog>
  `,
})
export class GoalDialog {
  private readonly api = inject(ProgressApi);

  readonly saved = output<GoalResponse>();

  protected readonly visible = signal(false);
  private readonly goal = signal<GoalResponse | null>(null);
  protected readonly editing = computed(() => this.goal() !== null);
  protected readonly failure = signal<string | null>(null);
  protected readonly describe = fieldDescription;

  protected readonly model = signal<GoalModel>({
    title: '',
    targetWeightKg: null,
    description: '',
  });
  protected readonly goalForm = form(this.model, (path) => {
    required(path.title, { message: 'Ponle un nombre' });
    maxLength(path.title, 120, { message: 'Máximo 120 caracteres' });
    required(path.targetWeightKg, { message: 'Indica tu peso objetivo' });
    min(path.targetWeightKg, 20, { message: 'El peso mínimo es 20 kg' });
    max(path.targetWeightKg, 400, { message: 'El peso máximo es 400 kg' });
    maxLength(path.description, 500, { message: 'Máximo 500 caracteres' });
  });

  open(goal: GoalResponse | null): void {
    this.goal.set(goal);
    this.failure.set(null);
    this.goalForm().reset({
      title: goal?.title ?? '',
      targetWeightKg: goal?.targetWeightKg ?? null,
      description: goal?.description ?? '',
    });
    this.visible.set(true);
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.failure.set(null);
    await submit(this.goalForm, {
      action: async () => {
        const value = this.model();
        const body = {
          title: value.title.trim(),
          targetWeightKg: value.targetWeightKg ?? 0,
          description: value.description.trim() || null,
        };
        const current = this.goal();
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
            return serverFieldErrors(this.goalForm, problem);
          }
          this.failure.set(problem.detail);
          return undefined;
        }
      },
      onInvalid: (tree) => focusFirstInvalid(tree),
    });
  }
}
