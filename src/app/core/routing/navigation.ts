import {
  type LucideIcon,
  LucideBookOpen,
  LucideCalendarCheck,
  LucideChartLine,
  LucideCreditCard,
  LucideFlag,
  LucideHouse,
  LucideMailPlus,
  LucideTrophy,
  LucideUser,
  LucideUsers,
  LucideUtensils,
} from '@lucide/angular';
import type { Role } from '../auth/roles';

export interface NavItem {
  readonly label: string;
  readonly link: string;
  readonly icon: LucideIcon;
  /** Descripción corta para las tarjetas de acceso rápido de la página de inicio. */
  readonly description?: string;
  /** Activo solo con la ruta exacta (la página de inicio de cada rol). */
  readonly exact?: boolean;
}

/** Menú de cada rol. El orden es el del menú lateral. */
export const NAVIGATION: Readonly<Record<Role, readonly NavItem[]>> = {
  CLIENT: [
    { label: 'Inicio', link: '/client', icon: LucideHouse, exact: true },
    {
      label: 'Progreso',
      link: '/client/progress',
      icon: LucideChartLine,
      description: 'Tu meta de peso, tus pesajes y el gráfico de tu evolución.',
    },
    {
      label: 'Hábitos',
      link: '/client/habits',
      icon: LucideCalendarCheck,
      description: 'Registra cada día hidratación, alimentación, ejercicio y sueño.',
    },
    {
      label: 'Recompensas',
      link: '/client/rewards',
      icon: LucideTrophy,
      description: 'Mantén tus rachas y desbloquea premios de los nutricionistas.',
    },
    {
      label: 'Planes',
      link: '/client/meal-plans',
      icon: LucideUtensils,
      description: 'Planes alimenticios con sus comidas, día a día.',
    },
    {
      label: 'Contenido',
      link: '/client/content',
      icon: LucideBookOpen,
      description: 'Artículos, vídeos y guías para aprender a comer mejor.',
    },
    {
      label: 'Comunidad',
      link: '/client/community',
      icon: LucideUsers,
      description: 'Grupos para compartir avances, dudas y recetas.',
    },
    {
      label: 'Suscripción',
      link: '/client/subscription',
      icon: LucideCreditCard,
      description: 'Tu plan actual y el acceso a Premium y VIP.',
    },
    { label: 'Perfil', link: '/client/profile', icon: LucideUser },
  ],
  NUTRITIONIST: [
    { label: 'Inicio', link: '/nutritionist', icon: LucideHouse, exact: true },
    {
      label: 'Planes',
      link: '/nutritionist/meal-plans',
      icon: LucideUtensils,
      description: 'Crea planes alimenticios, organiza sus comidas y publícalos.',
    },
    {
      label: 'Contenido',
      link: '/nutritionist/content',
      icon: LucideBookOpen,
      description: 'Publica artículos, vídeos y guías para tus clientes.',
    },
    {
      label: 'Recompensas',
      link: '/nutritionist/rewards',
      icon: LucideTrophy,
      description: 'Premia las rachas de hábitos con tus planes o contenidos.',
    },
    {
      label: 'Clientes',
      link: '/nutritionist/clients',
      icon: LucideUsers,
      description: 'Las personas que siguen tus planes y su progreso.',
    },
    {
      label: 'Comunidad',
      link: '/nutritionist/community',
      icon: LucideFlag,
      description: 'Participa en los grupos y acompaña a la comunidad.',
    },
    { label: 'Perfil', link: '/nutritionist/profile', icon: LucideUser },
  ],
  ADMIN: [
    { label: 'Resumen', link: '/admin', icon: LucideHouse, exact: true },
    {
      label: 'Usuarios',
      link: '/admin/users',
      icon: LucideUsers,
      description: 'Busca cuentas y actívalas o desactívalas.',
    },
    {
      label: 'Invitaciones',
      link: '/admin/invitations',
      icon: LucideMailPlus,
      description: 'Da de alta a nutricionistas por invitación.',
    },
    {
      label: 'Moderación',
      link: '/admin/moderation',
      icon: LucideFlag,
      description: 'Revisa las denuncias de la comunidad.',
    },
    {
      label: 'Facturación',
      link: '/admin/billing',
      icon: LucideCreditCard,
      description: 'Suscripciones, pagos e ingresos.',
    },
  ],
};
