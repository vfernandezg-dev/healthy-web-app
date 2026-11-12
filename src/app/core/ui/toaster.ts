import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import type { Problem } from '../api/problem';

type Severity = 'success' | 'info' | 'warn' | 'error';

/** Avisos breves (p-toast en la raíz de la app). */
@Injectable({ providedIn: 'root' })
export class Toaster {
  private readonly messages = inject(MessageService);

  success(summary: string, detail?: string): void {
    this.show('success', summary, detail, 4000);
  }

  info(summary: string, detail?: string): void {
    this.show('info', summary, detail, 5000);
  }

  error(summary: string, detail?: string): void {
    this.show('error', summary, detail, 7000);
  }

  /** Un error de la API: los fallos del servidor o de red en rojo, el resto como advertencia. */
  problem(problem: Problem): void {
    const severity = problem.status <= 0 || problem.status >= 500 ? 'error' : 'warn';
    this.show(severity, problem.summary, problem.detail, 7000);
  }

  private show(
    severity: Severity,
    summary: string,
    detail: string | undefined,
    life: number,
  ): void {
    this.messages.add(
      detail === undefined ? { severity, summary, life } : { severity, summary, detail, life },
    );
  }
}
