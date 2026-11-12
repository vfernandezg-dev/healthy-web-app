import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';

/** Logo de Healthy Bites (marca + nombre). `inverse` para fondos oscuros. */
@Component({
  selector: 'app-brand-logo',
  imports: [NgOptimizedImage],
  host: { class: 'inline-flex items-center gap-2.5' },
  template: `
    <img
      [ngSrc]="inverse() ? 'brand/logo-mark-white-72.png' : 'brand/logo-mark-72.png'"
      alt=""
      width="36"
      height="36"
      [priority]="priority()"
    />
    <span
      class="text-lg font-bold tracking-tight"
      [class.text-white]="inverse()"
      [class.text-ink]="!inverse()"
      >Healthy Bites</span
    >
  `,
})
export class BrandLogo {
  readonly inverse = input(false);
  /** Si el logo está en la primera vista de la página (carga prioritaria, mejora el LCP). */
  readonly priority = input(false);
}
