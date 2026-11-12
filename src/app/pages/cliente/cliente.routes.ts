import { Routes } from '@angular/router';

import { GrupoComponent } from './grupo/grupo.component';

import { UserProfileComponent } from '../../shared/components/user-profile/user-profile.component';
import { ClienteLayoutComponent } from './cliente-layout/cliente-layout.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { ContenidoComponent } from './contenido/contenido.component';
import { UpdateProfileComponent } from '../../shared/components/update-profile/update-profile.component';
import { MetaListComponent } from './meta/meta-list/meta-list.component';
import { MetaFormComponent } from './meta/meta-form/meta-form.component';
import { MetaSeguimientoFormComponent } from './meta/meta-seguimiento-form/meta-seguimiento-form.component';
import { GraficoPesoComponent } from './meta/grafico-peso/grafico-peso.component';
import { HabitosFormComponent } from './seguimiento/habitos-form/habitos-form.component';
import { HabitosListComponent } from './seguimiento/habitos-list/habitos-list.component';
import { GrupoFormComponent } from './grupo/grupo-form/grupo-form.component';
import { PublicacionListComponent } from './publicacion/publicacion-list/publicacion-list.component';
import { PublicacionFormComponent } from './publicacion/publicacion-form/publicacion-form.component';
import { ContenidoDetalleComponent } from './contenido/contenido-detalle/contenido-detalle.component';
import { SuscripcionListComponent } from './suscripcion/suscripcion-list/suscripcion-list.component';
import { RachaFormComponent } from './seguimiento/racha-form/racha-form.component';

export const clienteRoutes: Routes = [
    {
        path: '',
        component: ClienteLayoutComponent,
        children: [
            {path: '', pathMatch: 'full', redirectTo: 'perfil'},
            {path: 'perfil', component: UserProfileComponent},
            {path: 'perfil/update', component: UpdateProfileComponent},

            {path: 'meta', component: MetaListComponent},
            {path: 'meta/create', component: MetaFormComponent},
            {path: 'meta/update/:metaId', component: MetaFormComponent},

            {path: 'meta/:metaId/seguimiento/create', component: MetaSeguimientoFormComponent},
            {path: 'meta/:metaId/seguimiento/update/:id', component: MetaSeguimientoFormComponent},

            {path: 'meta/grafico', component: GraficoPesoComponent},

            {path: 'seguimiento', component: SeguimientoComponent},
            {path: 'seguimiento/habitos', component: HabitosListComponent},
            {path: 'seguimiento/habitos/create', component: HabitosFormComponent},
            {path: 'seguimiento/habitos/update/:habitoId', component: HabitosFormComponent},

            {path: 'contenido', component: ContenidoComponent},
            {path: 'contenido/:type/:id', component: ContenidoDetalleComponent},
            
            {path: 'grupo', component: GrupoComponent},
            {path: 'grupo/create', component: GrupoFormComponent},
            {path: 'grupo/update/:grupoId', component: GrupoFormComponent},

            {path: 'grupo/:IdGrupo', component: PublicacionListComponent },
            {path: 'grupo/:IdGrupo/publicacion/update/:publicacionId', component: PublicacionFormComponent },
            {path: 'grupo/:IdGrupo/publicacion/create', component: PublicacionFormComponent },

            {path: 'suscripciones', component: SuscripcionListComponent},
            {path: 'suscripciones/create', component: SuscripcionListComponent},

            {path: 'seguimiento/racha-form', component: RachaFormComponent}
        ]
    }
];