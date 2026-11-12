
import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MetaService } from '../../../../core/services/meta.service';
import { MetaResponseModel } from '../../../../shared/models/meta-response.model';
import { UserProfile } from '../../../../shared/models/user-profile.model';
import { UserProfileService } from '../../../../core/services/user-profile.service';
import { SeguimientoResponse } from '../../../../shared/models/seguimiento-response.model';
import { SeguimientoService } from '../../../../core/services/seguimiento.service';
import { FormatTimePipe } from '../../../../core/pipes/format-time.pipe';
import { GraficoPesoComponent } from '../grafico-peso/grafico-peso.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PageableResponse } from '../../../../shared/models/pageable-response.model';
import { ApexChartComponent } from '../../../../shared/components/apex-chart/apex-chart.component';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
    selector: 'app-meta-list',
    imports: [
    MatTableModule,
    MatFormFieldModule,
    FormatTimePipe,
    MatPaginatorModule,
    ApexChartComponent
],
    templateUrl: './meta-list.component.html',
    styleUrls: ['./meta-list.component.css']
})
export class MetaListComponent implements OnInit {

  cliente!: UserProfile;
  meta: MetaResponseModel[] = [];
  filteredMeta: MetaResponseModel[] = [];
  seguimiento: SeguimientoResponse[] = [];
  filteredSeguimiento: SeguimientoResponse[] = [];
  puedeCrearMeta: boolean = true;
  totalElements = 0;
  pageSize = 5;
  pageIndex = 0;

  public chartOptions: Partial<ChartOptions>;

  private userProfileService = inject(UserProfileService);
  private metaService = inject(MetaService);
  private seguimientoService = inject(SeguimientoService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Peso Diario',
          data: []
        }
      ],
      chart: {
        height: 350,
        type: 'area'
      },
      title: {
        text: 'Visualización de Progreso'
      },
      xaxis: {
        categories: []
      }
    };
  }

  displayedColumns: string[] = ['id', 'observaciones', 'pesoDelDia', 'fecha', 'acciones'];

  ngOnInit(): void {
    this.loadMeta();
  }

  loadMeta(): void {
    const clienteId = this.authService.getClienteId();

    if (!clienteId) {
      this.showSnackBar('Usuario no autenticado');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.userProfileService.getUserProfile(clienteId).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
      }
    });

    this.metaService.getMetasByClienteId(clienteId).subscribe({
      next: (metas) => {
        console.log('Metas:', metas); // Depuración
        this.meta = metas;
        this.filteredMeta = metas;
        this.puedeCrearMeta = this.filteredMeta.length === 0;

        if (this.filteredMeta.length > 0) {
          this.loadSeguimiento(this.filteredMeta[0].id, clienteId); // Cambiar al primer elemento
        }
      },
      error: () => {
        this.showSnackBar('Error al cargar las metas');
      }
    });
  }

  loadSeguimiento(metaId: number, clienteId: number, pageIndex: number = 0, pageSize: number = 5): void {
    this.seguimientoService.paginateSeguimientosByClienteId(metaId, clienteId, pageIndex, pageSize).subscribe({
      next: (response: PageableResponse<SeguimientoResponse>) => {
        console.log('Seguimientos:', response.content); // Depuración
        this.seguimiento = response.content;
        this.filteredSeguimiento = response.content;
        this.totalElements = response.totalElements;
        this.pageSize = response.size;
        this.pageIndex = response.number;

        this.chartOptions.series = [
          {
            name: 'Peso Diario',
            data: this.seguimiento.map((seguimiento) => seguimiento.pesoDelDia)
          }
        ];
        this.chartOptions.xaxis = {
          categories: this.seguimiento.map((seguimiento) => seguimiento.fecha)
        };
      },
      error: () => {
        this.showSnackBar('Error al cargar los seguimientos');
      }
    });
  }

  crearMeta(): void {
    this.router.navigate(['/cliente/meta/create']);
  }

  actualizarMeta(metaId: number): void {
    this.router.navigate([`/cliente/meta/update/${metaId}`]);
  }

  crearSeguimiento(metaId: number): void {
    this.router.navigate([`/cliente/meta/${metaId}/seguimiento/create`]);
  }

  editarSeguimiento(metaId: number, seguimientoId: number): void {
    this.router.navigate([`/cliente/meta/${metaId}/seguimiento/update/${seguimientoId}`]);
  }

  eliminarSeguimiento(seguimientoId: number, metaId: number): void {
    this.seguimientoService.eliminarSeguimiento(metaId, seguimientoId).subscribe({
      next: () => {
        this.loadSeguimiento(metaId, this.cliente.id);
        this.showSnackBar('Seguimiento eliminado con éxito');
      },
      error: () => {
        this.showSnackBar('Error al eliminar el seguimiento');
      }
    });
  }

  eliminarMeta(metaId: number, clienteId: number): void {
    this.metaService.eliminarMeta(metaId, clienteId).subscribe({
      next: () => {
        this.loadMeta();
        this.showSnackBar('Meta eliminada con éxito');
        this.puedeCrearMeta = this.filteredMeta.length === 0;
      },
      error: () => {
        this.showSnackBar('Error al eliminar la meta');
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    const metaId = this.filteredMeta[0]?.id;
    if (metaId) {
      this.loadSeguimiento(metaId, this.cliente.id, this.pageIndex, this.pageSize);
    }
  }

  private showSnackBar(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }
}
