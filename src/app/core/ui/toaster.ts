import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import type { Problem } from '../api/problem';

/** Avisos breves (p-toast en la raíz de la app). */
@Injectable({ providedIn: 'root' })
export class Toaster {
  private readonly messages = inject(MessageService);

  success(summary: string, detail?: string): void {
    this.messages.add({ severity: 'success', summary, detail, life: 4000 });
  }

  info(summary: string, detail?: string): void {
    this.messages.add({ severity: 'info', summary, detail, life: 5000 });
  }

  error(summary: string, detail?: string): void {
    this.messages.add({ severity: 'error', summary, detail, life: 7000 });
  }

  /** Un error de la API: los fallos del servidor o de red en rojo, el resto como advertencia. */
  problem(problem: Problem): void {
    const severity = problem.status <= 0 || problem.status >= 500 ? 'error' : 'warn';
    this.messages.add({ severity, summary: problem.summary, detail: problem.detail, life: 7000 });
  }
}
