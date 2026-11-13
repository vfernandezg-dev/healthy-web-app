import type Aura from '@primeuix/themes/aura';
import * as auraBase from '@primeuix/themes/aura/base';
import button from '@primeuix/themes/aura/button';
import confirmdialog from '@primeuix/themes/aura/confirmdialog';
import datatable from '@primeuix/themes/aura/datatable';
import dialog from '@primeuix/themes/aura/dialog';
import drawer from '@primeuix/themes/aura/drawer';
import iconfield from '@primeuix/themes/aura/iconfield';
import inputnumber from '@primeuix/themes/aura/inputnumber';
import inputtext from '@primeuix/themes/aura/inputtext';
import message from '@primeuix/themes/aura/message';
import paginator from '@primeuix/themes/aura/paginator';
import progressspinner from '@primeuix/themes/aura/progressspinner';
import select from '@primeuix/themes/aura/select';
import selectbutton from '@primeuix/themes/aura/selectbutton';
import skeleton from '@primeuix/themes/aura/skeleton';
import slider from '@primeuix/themes/aura/slider';
import tabs from '@primeuix/themes/aura/tabs';
import tag from '@primeuix/themes/aura/tag';
import textarea from '@primeuix/themes/aura/textarea';
import toast from '@primeuix/themes/aura/toast';
import togglebutton from '@primeuix/themes/aura/togglebutton';

type AuraPreset = typeof Aura;

// Los tipos de aura/base solo declaran tipos, aunque el módulo exporta primitive y semantic.
const base = auraBase as unknown as Pick<AuraPreset, 'primitive' | 'semantic'>;

/**
 * Aura con los tokens de los componentes que usa la app. El preset completo trae los de 95 componentes y suma
 * unos 75 kB más al bundle inicial (se cargan al arrancar, antes de pintar nada).
 *
 * Al usar un componente nuevo de PrimeNG, añade aquí sus tokens (y los de los componentes que pinta dentro): sin
 * ellos sale sin estilos. `pnpm theme:check` (dentro de `pnpm verify`) lo comprueba.
 */
export const AuraLean: AuraPreset = {
  ...base,
  components: {
    button,
    confirmdialog,
    datatable,
    dialog,
    drawer,
    iconfield,
    inputnumber,
    inputtext,
    message,
    paginator,
    progressspinner,
    select,
    selectbutton,
    skeleton,
    slider,
    tabs,
    tag,
    textarea,
    toast,
    togglebutton,
  },
};
