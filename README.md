# EcoLiz — Plateforme B2B Premium pour l'IT Reconditionné

> Donner une **seconde vie** au matériel informatique professionnel.

EcoLiz est une plateforme e-commerce B2B française dédiée à la vente de matériel informatique reconditionné premium, aux services de réparation et aux solutions IT circulaires.

L’interface frontend a été conçue avec un parti pris **éditorial, premium et minimaliste**.

## Aperçu

- **Stack frontend** : React + TypeScript + Tailwind CSS + Framer Motion
- **Routing** : React Router DOM
- **UI icons** : Lucide React
- **Backend e-commerce** : WordPress + WooCommerce
- **Architecture** : Headless
- **Synchronisation fournisseur prévue** : FlexIT via SFTP

## Architecture

Frontend React
↓
WooCommerce REST API
↓
WordPress / WooCommerce
↓
FlexIT SFTP

## Structure du projet

ecoliz/
├── App.tsx
├── main.tsx
├── index.css
├── components/
├── pages/
├── services/
├── data/
├── types/
└── utils/

## Routes disponibles

| Route | Description |
|---|---|
| `/` | Accueil |
| `/boutique` | Catalogue produits |
| `/produit/:slug` | Fiche produit |
| `/panier` | Panier |
| `/checkout` | Checkout |
| `/compte` | Espace client |
| `/connexion` | Connexion |
| `/inscription` | Inscription |
| `/contact` | Contact |
| `/faq` | FAQ |
| `/mentions-legales` | Mentions légales |
| `/cgv` | CGV |
| `/rgpd` | Politique de confidentialité |
| `/cookies` | Politique cookies |

## Fonctionnalités principales

### Frontend

- Accueil éditorial
- Boutique
- Fiches produits
- Panier
- Checkout UX
- Espace client
- Connexion / inscription
- Contact
- FAQ
- Pages légales
- Bannière cookies

### WooCommerce

- Récupération des produits via API
- Panier WooCommerce conservé côté backend
- Checkout WooCommerce conservé côté backend
- Compte client WooCommerce conservé côté backend

## Intégration WooCommerce

Le frontend récupère les produits via l’API WooCommerce :

/wp-json/wc/store/products

Les produits WooCommerce sont ensuite affichés dans React.

## Intégration FlexIT

L’intégration FlexIT n’est pas encore branchée.

Elle dépend de :
- accès SFTP
- CustomerNumber
- exemple réel du Productfeed CSV
- exemples XML si disponibles

Flux prévus :
- Productfeed CSV
- CreateSalesOrder XML
- Invoicefeed XML

## État actuel

### Terminé
- Frontend V1
- Routing principal
- UI responsive
- Boutique connectée à WooCommerce
- Bannière cookies
- Pages principales

### En attente

- Accès FlexIT
- Import catalogue FlexIT
- Contact API WordPress
- Déploiement VM Debian

## Lancement local

Installation :
`npm install`

Développement :
`npm run dev`

Build production :
`npm run build`

Le build est généré dans :
`dist/`

## Notes

- Le frontend est développé en React.
- WordPress/WooCommerce sert de backend.
- FlexIT sera intégré plus tard via SFTP.
- Le projet est prévu pour un déploiement sur VM Debian.