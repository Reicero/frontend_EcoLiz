import type { FAQItem } from '../types/page';

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'q1',
    category: 'Reconditionnement',
    question: "Qu'est-ce qu'un produit reconditionné par EcoLiz ?",
    answer:
      "Chaque équipement passe par 50 points de contrôle techniques et esthétiques. Nous remplaçons les pièces usées, nettoyons l'appareil en profondeur et réinstallons un système d'exploitation à jour.",
  },
  {
    id: 'q2',
    category: 'Reconditionnement',
    question: 'Quelle est la différence entre les grades A+, A et B ?',
    answer:
      'Le Grade A+ correspond à un état proche du neuf. Le Grade A présente des micro-traces invisibles à 30 cm. Le Grade B peut présenter des marques d\'usage légères sans impact sur la performance.',
  },
  {
    id: 'q3',
    category: 'Garantie',
    question: 'Quelle garantie est offerte sur vos produits ?',
    answer:
      "Tous nos produits bénéficient d'une garantie standard de 24 mois pièces et main d'œuvre. Les serveurs sont garantis 12 mois. La garantie inclut le remplacement à J+1 en cas de panne majeure.",
  },
  {
    id: 'q4',
    category: 'Livraison',
    question: 'Quels sont les délais de livraison ?',
    answer:
      'Livraison standard en 48h ouvrées partout en France métropolitaine. Livraison express disponible en 24h sur demande. Pour l\'Europe, comptez 3 à 5 jours ouvrés.',
  },
  {
    id: 'q5',
    category: 'SAV',
    question: 'Comment fonctionne le SAV EcoLiz ?',
    answer:
      'Notre SAV est basé en France. Vous pouvez déclarer un incident depuis votre espace client. Un technicien vous contacte sous 4h ouvrées. La prise en charge inclut la collecte, la réparation et le retour.',
  },
  {
    id: 'q6',
    category: 'Entreprise',
    question: 'Proposez-vous des contrats de gestion de parc IT ?',
    answer:
      "Oui. Nous accompagnons les entreprises de 10 à 5000 collaborateurs avec des contrats sur-mesure : achat, maintenance, SAV, reprise et recyclage de l'ancien parc.",
  },
];

export const mockFAQ: FAQItem[] = FAQ_ITEMS;

export const ecoStats = [
  { id: 1, value: '450+', label: 'Tonnes de CO₂ évitées' },
  { id: 2, value: '12k', label: 'Appareils reconditionnés' },
  { id: 3, value: '85%', label: 'Déchets électroniques évités' },
  { id: 4, value: '98%', label: 'Matières réutilisées' },
];

export const testimonials = [
  {
    id: '1',
    quote:
      "Le passage au reconditionné avec EcoLiz nous a permis de réduire notre budget IT de 40% tout en gardant un niveau d'exigence très élevé pour nos développeurs.",
    author: 'Sophie Martin',
    role: 'CTO, TechFlow SAS',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    id: '2',
    quote:
      "Un SAV irréprochable. Lorsqu'un poste tombe en panne, l'échange à J+1 nous garantit une continuité de service parfaite. C'est du vrai B2B.",
    author: 'Thomas Dubois',
    role: 'Directeur des Achats, Groupe Horizon',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150',
  },
  {
    id: '3',
    quote:
      'La plateforme de gestion de parc est un énorme plus. Nous suivons nos garanties et nos factures en un clic. Une vraie démarche RSE simplifiée.',
    author: 'Julie Leroy',
    role: 'Office Manager, GreenScale',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
  },
];
