import { Component, computed, input } from '@angular/core';
import {
  type FieldTree,
  FormField,
  type SchemaPathTree,
  maxLength,
  required,
} from '@angular/forms/signals';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { Textarea } from 'primeng/textarea';
import type { ContentRequest, EditableContentResponse } from '@core/api/schema';
import { LabeledField, fieldDescription } from '@shared/forms/labeled-field';
import {
  CONTENT_CATEGORY_LABELS,
  CONTENT_TYPE_LABELS,
  type ContentCategory,
  type ContentType,
  TIER_LABELS,
  type Tier,
  optionsOf,
} from '@shared/i18n/labels';
import { MediaUpload } from '@shared/media/media-upload';

export interface ContentModel {
  title: string;
  summary: string;
  body: string;
  type: ContentType;
  category: ContentCategory | null;
  requiredTier: Tier;
  coverMediaId: string | null;
  fileMediaId: string | null;
}

export function emptyContent(): ContentModel {
  return {
    title: '',
    summary: '',
    body: '',
    type: 'ARTICLE',
    category: null,
    requiredTier: 'BASIC',
    coverMediaId: null,
    fileMediaId: null,
  };
}

export function contentModelOf(content: EditableContentResponse): ContentModel {
  const { item } = content;
  return {
    title: item.title,
    summary: item.summary,
    body: content.body ?? '',
    type: item.type,
    category: item.category,
    requiredTier: item.requiredTier,
    coverMediaId: content.coverMediaId ?? null,
    fileMediaId: content.fileMediaId ?? null,
  };
}

/** Reglas del contenido (las mismas que valida la API). */
export function contentSchema(path: SchemaPathTree<ContentModel>): void {
  required(path.title, { message: 'Ponle un título' });
  maxLength(path.title, 120, { message: 'Máximo 120 caracteres' });
  required(path.summary, { message: 'Escribe un resumen' });
  maxLength(path.summary, 500, { message: 'Máximo 500 caracteres' });
  maxLength(path.body, 20000, { message: 'Máximo 20 000 caracteres' });
  required(path.category, { message: 'Elige la categoría' });
}

export function toContentRequest(model: ContentModel): ContentRequest {
  return {
    title: model.title.trim(),
    summary: model.summary.trim(),
    body: model.body.trim() || null,
    type: model.type,
    category: model.category ?? 'NUTRITION',
    requiredTier: model.requiredTier,
    coverMediaId: model.coverMediaId,
    fileMediaId: model.fileMediaId,
  };
}

const FILE_RULES: Readonly<Record<ContentType, { accept: string; hint: string; label: string }>> = {
  VIDEO: { accept: 'video/mp4', hint: 'Vídeo MP4 de hasta 100 MB.', label: 'Vídeo' },
  GUIDE: { accept: 'application/pdf', hint: 'PDF de hasta 20 MB.', label: 'Guía en PDF' },
  ARTICLE: {
    accept: 'application/pdf,image/jpeg,image/png,image/webp',
    hint: 'PDF (hasta 20 MB) o imagen (hasta 5 MB) para descargar.',
    label: 'Fichero adjunto',
  },
};

/** Campos de un contenido, con su portada y su fichero. Va dentro del <form> de la página. */
@Component({
  selector: 'app-content-fields',
  imports: [FormField, InputText, Textarea, Select, SelectButton, LabeledField, MediaUpload],
  host: { class: '@container block space-y-5' },
  templateUrl: './content-fields.html',
})
export class ContentFields {
  readonly form = input.required<FieldTree<ContentModel>>();
  /** Ruta pública de la portada guardada (vista previa). */
  readonly coverPath = input<string | null>(null);

  protected readonly describe = fieldDescription;
  protected readonly typeOptions = optionsOf(CONTENT_TYPE_LABELS);
  protected readonly categoryOptions = optionsOf(CONTENT_CATEGORY_LABELS);
  protected readonly tierOptions = optionsOf(TIER_LABELS).map((option) => ({
    ...option,
    label: option.value === 'BASIC' ? 'Gratis para todos' : `Solo ${option.label}`,
  }));
  protected readonly fileRules = computed(() => FILE_RULES[this.form().type().value()]);
}
