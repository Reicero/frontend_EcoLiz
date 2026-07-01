import type { ServiceItem } from '../types/page';

const SERVICES_DATA: ServiceItem[] = [
  {
    id: '1',
    slug: 'masterisation-postes',
    title: 'Masterisation de postes',
    description:
      'Intervention rapide sur site ou en atelier pour tous vos équipements défectueux.',
    icon: 'Wrench',
  },
  {
    id: '2',
    slug: 'maintenance-preventive',
    title: 'Maintenance préventive',
    description:
      'Contrats de maintenance pour anticiper les pannes et prolonger la durée de vie.',
    icon: 'Activity',
  },
  {
    id: '3',
    slug: 'diagnostic-de-parc',
    title: 'Diagnostic de parc',
    description:
      "Audit complet de votre infrastructure matérielle et recommandations d'optimisation.",
    icon: 'Search',
  },
  {
    id: '4',
    slug: 'sav-support',
    title: 'SAV & Support',
    description: 'Assistance technique dédiée avec SLA garantis pour les professionnels.',
    icon: 'HeadphonesIcon',
  },
  {
    id: '5',
    slug: 'reconditionnement',
    title: 'Reconditionnement',
    description:
      "Remise à neuf de votre flotte existante pour un second cycle d'utilisation.",
    icon: 'Package',
  },
  {
    id: '6',
    slug: 'recyclage-informatique',
    title: 'Recyclage informatique',
    description:
      'Collecte et traitement certifié DEEE de vos équipements en fin de vie avec certificat.',
    icon: 'Recycle',
  },
];

export const mockServices: ServiceItem[] = SERVICES_DATA;
