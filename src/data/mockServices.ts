import type { ServiceItem } from '../types/page';

const SERVICES_DATA: ServiceItem[] = [
  {
    id: '1',
    slug: 'masterisation-postes',
    title: 'Masterisation de postes',
    description:
      'Préparation, configuration et déploiement de vos postes selon vos besoins, afin de faciliter leur mise en service.',
    icon: 'Wrench',
  },
  {
    id: '2',
    slug: 'maintenance-preventive',
    title: 'Maintenance préventive',
    description:
      'Contrôle et suivi de vos équipements pour anticiper les pannes, prolonger leur durée de vie et mieux planifier leur renouvellement.',
    icon: 'Activity',
  },
  {
    id: '3',
    slug: 'diagnostic-de-parc',
    title: 'Diagnostic de parc matériel',
    description:
      "Analyse de votre parc informatique pour identifier les équipements à conserver, remplacer ou compléter avec du matériel reconditionné adapté.",
    icon: 'Search',
  },
  {
    id: '4',
    slug: 'sav-support',
    title: 'SAV',
    description: 'Prise en charge des demandes après achat : garantie, retour, remplacement ou suivi de commande.',
    icon: 'HeadphonesIcon',
  },
  {
    id: '5',
    slug: 'reconditionnement',
    title: 'Support utilisateur',
    description:
      "Accompagnement à la prise en main, aux premières configurations et aux questions d’utilisation de votre matériel.",
    icon: 'Package',
  },
  {
    id: '6',
    slug: 'recyclage-informatique',
    title: 'Reconditionnement & recyclage informatique',
    description:
      'Valorisation du matériel informatique par le réemploi, le contrôle, la préparation et le traitement responsable des équipements en fin de vie.',
    icon: 'Recycle',
  },
];

export const mockServices: ServiceItem[] = SERVICES_DATA;
