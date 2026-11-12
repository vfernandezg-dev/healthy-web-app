import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft, LucideDownload, LucideLock, LucidePlay } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { APP_CONFIG } from '@core/api/api-config';
import { toProblem } from '@core/api/problem';
import { ExternalNavigation } from '@core/routing/external-navigation';
import {
  CONTENT_CATEGORY_LABELS,
  CONTENT_TYPE_LABELS,
  TIER_LABELS,
  type Tier,
} from '@shared/i18n/labels';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { LoadError } from '@shared/ui/load-error';
import { TierBadge } from '@shared/ui/tier-badge';
import { ContentApi } from '../data/content-api';
import { titleFrom } from '@core/routing/title-strategy';

/** Un contenido: portada, texto y su fichero (vídeo o descarga) con enlace firmado. */
@Component({
  selector: 'app-content-detail',
  imports: [
    RouterLink,
    NgOptimizedImage,
    MediaUrlPipe,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    Skeleton,
    LucideArrowLeft,
    LucideLock,
    LucidePlay,
    LucideDownload,
    TierBadge,
    LoadError,
  ],
  templateUrl: './content-detail.html',
})
export class ContentDetail {
  private readonly api = inject(ContentApi);
  private readonly navigation = inject(ExternalNavigation);
  private readonly apiUrl = inject(APP_CONFIG).apiUrl;

  /** Slug del contenido (parámetro de la ruta). */
  readonly slug = input.required<string>();

  protected readonly detail = this.api.detail(this.slug);

  /** La pestaña lleva el nombre de lo que se ve. */
  private readonly tabTitle = titleFrom(() =>
    this.detail.hasValue() ? this.detail.value().item.title : null,
  );
  protected readonly types = CONTENT_TYPE_LABELS;
  protected readonly categories = CONTENT_CATEGORY_LABELS;

  private readonly problem = computed(() =>
    this.detail.error() ? toProblem(this.detail.error()) : null,
  );
  protected readonly requiredTier = computed(() => {
    const problem = this.problem();
    return problem?.code === 'subscription-required'
      ? (problem.properties['requiredTier'] as Tier | undefined)
      : undefined;
  });
  protected readonly requiredTierLabel = computed(() => {
    const tier = this.requiredTier();
    return tier ? TIER_LABELS[tier] : '';
  });
  /** URL firmada del vídeo, cuando se pide verlo. */
  protected readonly videoUrl = signal<string | null>(null);
  protected readonly opening = signal(false);
  protected readonly fileFailure = signal<string | null>(null);

  /** Pide el enlace firmado y muestra el vídeo en la página. */
  protected async playVideo(id: string): Promise<void> {
    this.opening.set(true);
    this.fileFailure.set(null);
    try {
      const link = await this.api.fileLink(id);
      this.videoUrl.set(`${this.apiUrl}${link.path}`);
    } catch (error) {
      this.fileFailure.set(toProblem(error).detail);
    } finally {
      this.opening.set(false);
    }
  }

  /** Abre el fichero en una pestaña nueva (las guías en PDF se descargan). */
  protected async openFile(id: string): Promise<void> {
    const tab = this.navigation.openTab();
    this.opening.set(true);
    this.fileFailure.set(null);
    try {
      const link = await this.api.fileLink(id);
      tab.go(`${this.apiUrl}${link.path}`);
    } catch (error) {
      tab.cancel();
      this.fileFailure.set(toProblem(error).detail);
    } finally {
      this.opening.set(false);
    }
  }
}
