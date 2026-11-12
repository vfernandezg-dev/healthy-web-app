import { Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle
} from "ng-apexcharts";
import { SeguimientoResponse } from '../../../../shared/models/seguimiento-response.model';
import { SeguimientoService } from '../../../../core/services/seguimiento.service';
import { MetaResponseModel } from '../../../../shared/models/meta-response.model';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
};

@Component({
    selector: 'app-grafico-peso',
    imports: [
        RouterOutlet,
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        NgApexchartsModule
    ],
    templateUrl: './grafico-peso.component.html',
    styleUrl: './grafico-peso.component.css'
})


export class GraficoPesoComponent implements OnInit {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  meta: MetaResponseModel[] = [];
  seguimiento: SeguimientoResponse[] = [];
  
  private seguimientoService = inject(SeguimientoService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.loadSeguimiento();
  }

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Peso Diario",
          data: []
        }
      ],
      chart: {
        height: 350,
        type: "area"
      },
      title: {
        text: "Visualizacion de progreso"
      },
      xaxis: {
        categories: []
      },
    };
  }

  loadSeguimiento(): void {

    const metaId = Number(this.route.snapshot.paramMap.get('metaId'));

    // Load
    this.seguimientoService.getAllSeguimientosByMetaId(9).subscribe({
      next: (seguimientos) => {
        this.seguimiento = seguimientos;
        this.chartOptions.series = [
          {
            name: "Peso Diario",
            data: this.seguimiento.map((seguimiento) => seguimiento.pesoDelDia)
          }
        ];
        this.chartOptions.xaxis = {
          categories: this.seguimiento.map((seguimiento) => seguimiento.fecha)
        }
        console.log(this.seguimiento);
      }
    })
  }

}
