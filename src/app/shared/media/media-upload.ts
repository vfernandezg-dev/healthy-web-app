import { NgOptimizedImage } from '@angular/common';
import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideFile, LucideImage, LucideTrash2, LucideUpload } from '@lucide/angular';
import { ButtonDirective, ButtonIcon, ButtonLabel } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { toProblem } from '../../core/api/problem';
import type { UploadResponse } from '../../core/api/schema';
import { MediaUrlPipe } from '../pipes/media-url.pipe';
import { MediaApi, type MediaPurpose } from './media-api';

/**
 * Subida de un fichero con su vista previa (imágenes), barra de progreso y botones para cambiarlo o quitarlo. Usa
 * un <input type="file"> nativo detrás de un botón visible: accesible con teclado y lector de pantalla.
 */
@Component({
  selector: 'app-media-upload',
  imports: [
    NgOptimizedImage,
    MediaUrlPipe,
    ProgressBar,
    ButtonDirective,
    ButtonIcon,
    ButtonLabel,
    LucideUpload,
    LucideTrash2,
    LucideImage,
    LucideFile,
  ],
  host: { class: 'block' },
  template: `
    <p [id]="inputId() + '-label'" class="mb-1.5 text-sm font-semibold text-ink">
      {{ label() }} <span class="font-normal text-muted">(opcional)</span>
    </p>
    <div
      class="flex flex-wrap items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-white p-4"
    >
      @if (isImage() && previewPath()) {
        <img
          [ngSrc]="(previewPath() | mediaUrl) ?? ''"
          alt=""
          width="80"
          height="80"
          class="size-20 shrink-0 rounded-xl object-cover"
        />
      } @else {
        <span
          class="grid size-20 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"
        >
          @if (isImage()) {
            <svg lucideImage class="size-7"></svg>
          } @else {
            <svg lucideFile class="size-7"></svg>
          }
        </span>
      }
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium" [id]="inputId() + '-status'">{{ status() }}</p>
        <p class="text-sm text-muted">{{ hint() }}</p>
        @if (progress() !== null) {
          <p-progressbar
            [value]="progress() ?? 0"
            [showValue]="false"
            class="mt-2 block"
            [attr.aria-label]="'Subiendo ' + label()"
          />
        }
        @if (failure(); as message) {
          <p class="mt-1 text-sm text-red-700" role="alert">{{ message }}</p>
        }
      </div>
      <div class="flex gap-2">
        <input
          #picker
          type="file"
          class="sr-only"
          tabindex="-1"
          [id]="inputId()"
          [attr.aria-labelledby]="inputId() + '-label'"
          [accept]="accept()"
          (change)="choose(picker)"
        />
        <button
          pButton
          type="button"
          size="small"
          severity="secondary"
          variant="outlined"
          [disabled]="progress() !== null"
          [attr.aria-describedby]="inputId() + '-label ' + inputId() + '-status'"
          (click)="picker.click()"
        >
          <svg lucideUpload pButtonIcon></svg>
          <span pButtonLabel>{{ hasFile() ? 'Cambiar' : 'Subir' }}</span>
        </button>
        @if (hasFile()) {
          <button
            pButton
            type="button"
            size="small"
            severity="danger"
            variant="text"
            [iconOnly]="true"
            [attr.aria-label]="'Quitar ' + label().toLowerCase()"
            (click)="remove()"
          >
            <svg lucideTrash2 pButtonIcon></svg>
          </button>
        }
      </div>
    </div>
  `,
})
export class MediaUpload {
  private readonly media = inject(MediaApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly purpose = input.required<MediaPurpose>();
  /** Tipos que ofrece el selector (la API comprueba el tipo real por los bytes). */
  readonly accept = input('image/jpeg,image/png,image/webp,image/gif');
  readonly hint = input('JPG, PNG, WebP o GIF de hasta 5 MB.');
  /** Hay un fichero guardado (aunque no se pueda previsualizar). */
  readonly hasCurrent = input(false);
  /** Ruta pública del fichero guardado, para la vista previa de imágenes. */
  readonly currentPath = input<string | null>(null);

  /** Fichero subido; `null` si se ha quitado. */
  readonly changed = output<UploadResponse | null>();

  protected readonly progress = signal<number | null>(null);
  protected readonly failure = signal<string | null>(null);
  private readonly uploaded = signal<UploadResponse | null | undefined>(undefined);

  protected readonly isImage = computed(() => this.purpose() !== 'CONTENT_FILE');
  protected readonly hasFile = computed(() => {
    const uploaded = this.uploaded();
    return uploaded === undefined ? this.hasCurrent() : uploaded !== null;
  });
  protected readonly previewPath = computed(() => {
    const uploaded = this.uploaded();
    return uploaded === undefined ? this.currentPath() : (uploaded?.path ?? null);
  });
  protected readonly status = computed(() => {
    const uploaded = this.uploaded();
    if (this.progress() !== null) {
      return 'Subiendo…';
    }
    if (uploaded) {
      return `Fichero subido (${Math.max(1, Math.round(uploaded.sizeBytes / 1024))} KB)`;
    }
    return this.hasFile() ? 'Fichero guardado' : 'Ningún fichero';
  });

  protected choose(picker: HTMLInputElement): void {
    const file = picker.files?.[0];
    picker.value = '';
    if (!file) {
      return;
    }
    this.failure.set(null);
    this.progress.set(0);
    this.media
      .upload(file, this.purpose())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.state === 'uploading') {
            this.progress.set(event.percent);
          } else {
            this.progress.set(null);
            this.uploaded.set(event.file);
            this.changed.emit(event.file);
          }
        },
        error: (error: unknown) => {
          this.progress.set(null);
          this.failure.set(toProblem(error).detail);
        },
      });
  }

  protected remove(): void {
    this.uploaded.set(null);
    this.failure.set(null);
    this.changed.emit(null);
  }
}
