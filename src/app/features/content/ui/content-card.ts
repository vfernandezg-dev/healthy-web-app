import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideBookOpen, LucideDynamicIcon, LucideFileText, LucidePlay } from '@lucide/angular';
import type { ContentSummaryResponse } from '@core/api/schema';
import { CONTENT_CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@shared/i18n/labels';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { TierBadge } from '@shared/ui/tier-badge';

const TYPE_ICONS = { ARTICLE: LucideBookOpen, VIDEO: LucidePlay, GUIDE: LucideFileText } as const;

/** Tarjeta de un contenido con su portada (o un fondo con el icono del tipo). */
@Component({
  selector: 'app-content-card',
  imports: [RouterLink, NgOptimizedImage, LucideDynamicIcon, MediaUrlPipe, TierBadge],
  host: { class: 'block h-full' },
  template: `
    <a
      [routerLink]="link()"
      class="card group flex h-full flex-col overflow-hidden transition-[border-color,translate] duration-200 hover:border-line-strong motion-safe:hover:-translate-y-0.5"
    >
      <div class="relative aspect-video bg-brand-50">
        @if (item().coverPath) {
          <img
            [ngSrc]="(item().coverPath | mediaUrl) ?? ''"
            alt=""
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw"
            class="object-cover"
          />
        } @else {
          <span class="absolute inset-0 grid place-items-center text-brand-600">
            <svg [lucideIcon]="icon()" class="size-10"></svg>
          </span>
        }
      </div>
      <div class="flex flex-1 flex-col p-5">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">
            {{ types[item().type] }} · {{ categories[item().category] }}
          </span>
          <app-tier-badge [tier]="item().requiredTier" [locked]="item().locked" />
          <ng-content />
        </div>
        <h3 class="mt-3 text-lg font-bold text-balance group-hover:text-brand-800">
          {{ item().title }}
        </h3>
        @if (item().author; as author) {
          <p class="text-sm text-muted">De {{ author.name }}</p>
        }
        <p class="mt-2 line-clamp-3 text-muted">{{ item().summary }}</p>
      </div>
    </a>
  `,
})
export class ContentCard {
  readonly item = input.required<ContentSummaryResponse>();
  readonly link = input.required<string>();

  protected readonly types = CONTENT_TYPE_LABELS;
  protected readonly categories = CONTENT_CATEGORY_LABELS;
  protected readonly icon = computed(() => TYPE_ICONS[this.item().type]);
}
