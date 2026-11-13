import { NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { LucideDownload, LucidePlay } from '@lucide/angular';
import { ButtonDirective } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { toProblem } from '@core/api/problem';
import { ExternalNavigation } from '@core/routing/external-navigation';
import { CONTENT_CATEGORY_LABELS, CONTENT_TYPE_LABELS } from '@shared/i18n/labels';
import { MediaUrlPipe } from '@shared/pipes/media-url.pipe';
import { LoadError } from '@shared/ui/load-error';
import { TierBadge } from '@shared/ui/tier-badge';
import { ContentApi } from '../data/content-api';
import { titleFrom } from '@core/routing/title-strategy';
import { Paywall, requiredTierOf } from '@shared/ui/paywall';
import { BackLink } from '@shared/ui/back-link';
import { Badge } from '@shared/ui/badge';

/** Un contenido: portada, texto y su fichero (vídeo o descarga) con enlace firmado. */
@Component({
  selector: 'app-content-detail',
  imports: [
    Badge,
    BackLink,
    Paywall,
    NgOptimizedImage,
    MediaUrlPipe,
    ButtonDirective,
    Skeleton,
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

  /** Slug del contenido (parámetro de la ruta). */
  readonly slug = input.required<string>();

  protected readonly detail = this.api.detail(this.slug);

  /** La pestaña lleva el nombre de lo que se ve. */
  private readonly tabTitle = titleFrom(() =>
    this.detail.hasValue() ? this.detail.value().item.title : null,
  );
  protected readonly types = CONTENT_TYPE_LABELS;
  protected readonly categories = CONTENT_CATEGORY_LABELS;

  /** Nivel que pide cuando la API responde 403 subscription-required (bloqueado para el cliente). */
  protected readonly requiredTier = computed(() => requiredTierOf(this.detail.error()));
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
      const url = this.navigation.apiUrlOf(link.path);
      if (url) {
        this.videoUrl.set(url);
      } else {
        this.fileFailure.set('El enlace del vídeo no es válido.');
      }
    } catch (error) {
      this.fileFailure.set(toProblem(error).detail);
    } finally {
      this.opening.set(false);
    }
  }

  /** Abre el fichero en una pestaña nueva (las guías en PDF se descargan). */
  protected async openFile(id: string): Promise<void> {
    const tab = this.navigation.openApiTab();
    this.opening.set(true);
    this.fileFailure.set(null);
    try {
      const link = await this.api.fileLink(id);
      if (!tab.go(link.path)) {
        this.fileFailure.set('El enlace del fichero no es válido.');
      }
    } catch (error) {
      tab.cancel();
      this.fileFailure.set(toProblem(error).detail);
    } finally {
      this.opening.set(false);
    }
  }
}
