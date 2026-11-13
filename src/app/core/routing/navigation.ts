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
    },
    {
      label: 'Hábitos',
      link: '/client/habits',
      icon: LucideCalendarCheck,
    },
    {
      label: 'Recompensas',
      link: '/client/rewards',
      icon: LucideTrophy,
    },
    {
      label: 'Planes',
      link: '/client/meal-plans',
      icon: LucideUtensils,
    },
    {
      label: 'Contenido',
      link: '/client/content',
      icon: LucideBookOpen,
    },
    {
      label: 'Comunidad',
      link: '/client/community',
      icon: LucideUsers,
    },
    {
      label: 'Suscripción',
      link: '/client/subscription',
      icon: LucideCreditCard,
    },
    { label: 'Perfil', link: '/client/profile', icon: LucideUser },
  ],
  NUTRITIONIST: [
    { label: 'Inicio', link: '/nutritionist', icon: LucideHouse, exact: true },
    {
      label: 'Planes',
      link: '/nutritionist/meal-plans',
      icon: LucideUtensils,
    },
    {
      label: 'Contenido',
      link: '/nutritionist/content',
      icon: LucideBookOpen,
    },
    {
      label: 'Recompensas',
      link: '/nutritionist/rewards',
      icon: LucideTrophy,
    },
    {
      label: 'Clientes',
      link: '/nutritionist/clients',
      icon: LucideUsers,
    },
    {
      label: 'Comunidad',
      link: '/nutritionist/community',
      icon: LucideFlag,
    },
    { label: 'Perfil', link: '/nutritionist/profile', icon: LucideUser },
  ],
  ADMIN: [
    { label: 'Resumen', link: '/admin', icon: LucideHouse, exact: true },
    {
      label: 'Usuarios',
      link: '/admin/users',
      icon: LucideUsers,
    },
    {
      label: 'Invitaciones',
      link: '/admin/invitations',
      icon: LucideMailPlus,
    },
    {
      label: 'Moderación',
      link: '/admin/moderation',
      icon: LucideFlag,
    },
    {
      label: 'Facturación',
      link: '/admin/billing',
      icon: LucideCreditCard,
    },
  ],
};
