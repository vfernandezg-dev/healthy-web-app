import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { ContenidoService } from '../../../../core/services/contenido.service';
import { PlanAlimenticioService } from '../../../../core/services/plan-alimenticio.service';
import { ComidaService } from '../../../../core/services/comida.service';
import { ContenidoResponse } from '../../../../shared/models/contenido-response.model';
import { PlanAlimenticioResponse } from '../../../../shared/models/plan-alimenticio-response.model';
import { ComidaResponse } from '../../../../shared/models/comida-response.model';
import { ApiImgPipe } from '../../../../core/pipes/api-img.pipe';
import { FormatPlanObjetivoPipe } from '../../../../core/pipes/format-plan-objetivo.pipe';

@Component({
    selector: 'app-contenido-detalle',
    imports: [MatCardModule, MatTableModule, ApiImgPipe, FormatPlanObjetivoPipe, RouterLink],
    templateUrl: './contenido-detalle.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./contenido-detalle.component.css']
})
export class ContenidoDetalleComponent {
  contenido: ContenidoResponse | undefined;
  planAlimenticio: PlanAlimenticioResponse | undefined;
  /** El servidor ha denegado el acceso: contenido o plan de pago sin suscripción ni recompensa. */
  locked = false;
  comidas: ComidaResponse[] = [];
  displayedColumns: string[] = ['Orden', 'nombreComida', 'categoria', 'calorias'];
  private route = inject(ActivatedRoute);
  private contenidoService = inject(ContenidoService);
  private planAlimenticioService = inject(PlanAlimenticioService);
  private comidaService = inject(ComidaService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const type = this.route.snapshot.paramMap.get('type');
    if (id && type) {
      if (type === 'contenido') {
        this.contenidoService.getContentById(+id).subscribe({
          next: (contenido) => {
            this.contenido = contenido;
          },
          error: (error: HttpErrorResponse) => {
            this.locked = error.status === 403;
            console.error('Error al cargar el contenido', error);
          }
        });
      } else if (type === 'plan') {
        this.planAlimenticioService.getPlanById(+id).subscribe({
          next: (planAlimenticio) => {
            this.planAlimenticio = planAlimenticio;
            this.loadComidas(planAlimenticio.id);
          },
          error: (error: HttpErrorResponse) => {
            this.locked = error.status === 403;
            console.error('Error al cargar el plan alimenticio', error);
          }
        });
      }
    }
  }

  loadComidas(planId: number): void {
    this.comidaService.getAllByPlanId(planId).subscribe({
      next: (comidas) => {
        this.comidas = comidas;
      },
      error: (error) => {
        console.error('Error al cargar las comidas', error);
      }
    });
  }
}