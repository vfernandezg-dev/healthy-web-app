import { Routes } from '@angular/router';
import { NutricionistaLayoutComponent } from './nutricionista-layout/nutricionista-layout.component';
import { PlanAlimenticioListComponent } from './plan-alimenticio/plan-alimenticio-list/plan-alimenticio-list.component';
import { ComidaListComponent } from './comida/comida-list/comida-list.component';
import { ContenidoListComponent } from './contenido/contenido-list/contenido-list.component';
import { ContenidoFormComponent } from './contenido/contenido-form/contenido-form.component';
import { PlanAlimenticioFormComponent } from './plan-alimenticio/plan-alimenticio-form/plan-alimenticio-form.component';
import { ComidaFormComponent } from './comida/comida-form/comida-form.component';
import { RecompensasListComponent } from './recompensas/recompensas-list/recompensas-list.component';
import { RecompensasFormComponent } from './recompensas/recompensas-form/recompensas-form.component';

export const nutricionistaRoutes: Routes = [
    {
        path: '',
        component: NutricionistaLayoutComponent,
        children: [
            {path: '', pathMatch: 'full', redirectTo: 'plan-alimenticio/list'},

            {path: 'plan-alimenticio/list', component: PlanAlimenticioListComponent},
            {path: 'plan-alimenticio/create', component: PlanAlimenticioFormComponent},
            {path: 'plan-alimenticio/edit/:id', component: PlanAlimenticioFormComponent},
            
            {path: 'plan-alimenticio/comida/:planId/agregar', component: ComidaFormComponent},
            {path: 'plan-alimenticio/comida/:planId/editar/:comidaId', component: ComidaFormComponent},
            
            {path: 'comida/list', component: ComidaListComponent},

            {path: 'contenido', component: ContenidoListComponent},
            {path: 'contenido/create', component: ContenidoFormComponent},
            {path: 'contenido/edit/:id', component: ContenidoFormComponent},

            {path: 'recompensa', component: RecompensasListComponent},
            {path: 'recompensa/create', component: RecompensasFormComponent},
            {path: 'recompensa/edit/:id', component: RecompensasFormComponent},
        ]
    }
];