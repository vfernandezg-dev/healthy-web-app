import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toast, ConfirmDialog],
  template: `
    <router-outlet />
    <!-- Fuera del bundle inicial: se cargan en cuanto el navegador queda libre, antes de cualquier aviso. -->
    @defer (on idle) {
      <p-toast position="top-right" [breakpoints]="{ '640px': { width: 'calc(100vw - 2rem)' } }" />
      <p-confirmdialog styleClass="w-[min(28rem,calc(100vw-2rem))]" />
    }
  `,
})
export class App {}
