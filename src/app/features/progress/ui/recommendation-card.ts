import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import type { Problem } from '@core/api/problem';
import type { RecommendationResponse } from '@core/api/schema';

/** El rango de peso saludable para la altura del cliente y qué supone su objetivo. */
@Component({
  selector: 'app-recommendation-card',
  imports: [DecimalPipe, RouterLink, Skeleton],
  host: { class: 'card block p-6', role: 'region', 'aria-labelledby': 'recommendation-title' },
  template: `
    <h2 id="recommendation-title" class="text-lg font-bold">Peso saludable</h2>
    @if (problem(); as problem) {
      <p class="mt-2 text-muted">{{ problem.detail }}</p>
      @if (problem.code === 'profile-incomplete') {
        <a
          routerLink="/client/profile"
          class="mt-3 inline-block font-semibold text-brand-700 hover:underline"
          >Completar mi perfil</a
        >
      }
    } @else if (advice(); as advice) {
      <p class="mt-2 text-muted">
        Para tu altura ({{ advice.heightCm | number: '1.0-1' }} cm), un peso saludable está entre
        <strong class="text-ink"
          >{{ advice.healthyMinKg | number: '1.0-1' }} y
          {{ advice.healthyMaxKg | number: '1.0-1' }} kg</strong
        >.
      </p>
      <p
        class="mt-3 rounded-control px-3.5 py-3 text-sm font-medium"
        [class]="
          advice.targetInHealthyRange
            ? 'bg-brand-50 text-brand-900'
            : 'bg-saffron-50 text-saffron-900'
        "
      >
        {{ advice.message }}
      </p>
      @if (advice.estimatedWeeks) {
        <p class="mt-3 text-sm text-muted">
          A unos {{ advice.weeklyChangeKg | number: '1.0-1' }} kg por semana, llegarías en unas
          {{ advice.estimatedWeeks }} semanas.
        </p>
      }
    } @else {
      <p-skeleton height="6rem" styleClass="mt-3" />
    }
  `,
})
export class RecommendationCard {
  /** La recomendación, cuando ha llegado. */
  readonly advice = input<RecommendationResponse>();
  /** Por qué no la hay (por ejemplo, `profile-incomplete`: falta la altura). */
  readonly problem = input<Problem | null>(null);
}
