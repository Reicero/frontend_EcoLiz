import { useLocation, useParams } from 'react-router-dom';

type LegalSection = {
  heading: string;
  body: string[];
};

type LegalPage = {
  title: string;
  sections: LegalSection[];
};

const legalContent: Record<string, LegalPage> = {
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
      {
        heading: 'Éditeur du site',
        body: [
          "Le présent site est édité par EcoLiz SAS, société par actions simplifiée au capital de 300 €, immatriculée au RCS de Montpellier sous le numéro 912 267 580.",
          "Le siège social est situé au 15 avenue d'Unterschleissheim, 34920 Le Crès.",
        ],
      },
      {
        heading: 'Directeur de la publication',
        body: [
          'Le directeur de la publication est Monsieur Arnaud Christophe, en qualité de Président.',
        ],
      },
      {
        heading: 'Hébergement',
        body: [
          'Le site est hébergé par OVHcloud, 2 rue Kellermann, 59100 Roubaix, France.',
        ],
      },
      {
        heading: 'Propriété intellectuelle',
        body: [
          "L'ensemble des contenus présents sur le site, notamment les textes, visuels, éléments graphiques, logos, interfaces et éléments de présentation, sont protégés par le droit de la propriété intellectuelle.",
          "Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du site est interdite, sauf autorisation préalable d'EcoLiz.",
        ],
      },
      {
        heading: 'Responsabilité',
        body: [
          "EcoLiz s'efforce de fournir des informations exactes et régulièrement mises à jour. Toutefois, des erreurs ou omissions peuvent exister.",
          "Les informations présentes sur le site sont fournies à titre indicatif et peuvent être modifiées à tout moment, notamment concernant les produits, disponibilités, prix, garanties et services proposés.",
        ],
      },
    ],
  },

  cgv: {
    title: 'Conditions Générales de Vente',
    sections: [
      {
        heading: 'Article 1 – Objet',
        body: [
          "Les présentes conditions générales de vente encadrent les relations commerciales entre EcoLiz SAS et ses clients professionnels dans le cadre de la vente de matériel informatique reconditionné et de prestations associées.",
          "Elles s'appliquent aux commandes passées depuis le site, sous réserve des conditions particulières indiquées sur un devis, une facture ou un accord commercial spécifique.",
        ],
      },
      {
        heading: 'Article 2 – Clientèle professionnelle',
        body: [
          "EcoLiz s'adresse principalement aux professionnels, entreprises, collectivités, associations et structures ayant des besoins en matériel informatique professionnel.",
          "Le site a pour objectif de faciliter la consultation du catalogue, la demande de devis, la prise de commande et le suivi des échanges commerciaux.",
        ],
      },
      {
        heading: 'Article 3 – Produits et disponibilité',
        body: [
          "Les produits proposés sont principalement du matériel informatique reconditionné ou issu de filières de réemploi.",
          "Les caractéristiques, références, grades, prix et disponibilités sont indiqués sous réserve d'erreurs, de mises à jour de stock ou de validation commerciale par EcoLiz.",
        ],
      },
      {
        heading: 'Article 4 – Prix',
        body: [
          "Les prix affichés sont indiqués hors taxes, sauf mention contraire.",
          "EcoLiz se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui confirmé lors de la validation de la commande, du devis ou de la facture.",
        ],
      },
      {
        heading: 'Article 5 – Commandes',
        body: [
          "Toute commande passée sur le site fait l'objet d'une vérification par EcoLiz.",
          "La commande devient définitive après confirmation par EcoLiz et, le cas échéant, après acceptation du devis, validation des conditions commerciales ou réception du paiement selon le mode convenu.",
        ],
      },
      {
        heading: 'Article 6 – Paiement',
        body: [
          "Les modes de paiement disponibles sont indiqués lors du processus de commande.",
          "Lorsque le paiement en ligne n'est pas activé, la commande peut être traitée par paiement manuel, virement, facture ou autre modalité validée avec EcoLiz.",
        ],
      },
      {
        heading: 'Article 7 – Livraison',
        body: [
          "Les délais de livraison sont communiqués à titre indicatif et peuvent varier selon la disponibilité des produits, le transporteur, le volume commandé et l'adresse de livraison.",
          "Les conditions exactes de livraison sont précisées au moment de la commande ou dans les échanges commerciaux avec EcoLiz.",
        ],
      },
      {
        heading: 'Article 8 – Garantie',
        body: [
          "Les conditions de garantie sont précisées sur la fiche produit, le devis ou la facture.",
          "Elles peuvent varier selon le type de matériel, sa catégorie, son état, son usage et les conditions commerciales validées avec EcoLiz.",
        ],
      },
      {
        heading: 'Article 9 – Service après-vente',
        body: [
          "En cas de problème sur un produit ou une commande, le client peut contacter EcoLiz afin qu'une analyse soit réalisée.",
          "Les modalités de prise en charge, de retour, de réparation, de remplacement ou d'avoir sont définies selon la situation, la garantie applicable et les conditions commerciales validées.",
        ],
      },
      {
        heading: 'Article 10 – Validation',
        body: [
          "Les présentes CGV constituent une base d'information commerciale et devront être validées par l'entreprise avant publication définitive.",
        ],
      },
    ],
  },

  rgpd: {
    title: 'Politique de confidentialité (RGPD)',
    sections: [
      {
        heading: 'Protection des données personnelles',
        body: [
          "EcoLiz accorde une importance particulière à la protection des données personnelles de ses clients, prospects et utilisateurs.",
          "La présente politique de confidentialité explique quelles données peuvent être collectées lors de l'utilisation du site, pourquoi elles sont utilisées, combien de temps elles sont conservées et quels sont les droits des personnes concernées.",
        ],
      },
      {
        heading: 'Responsable du traitement',
        body: [
          "Le responsable du traitement des données personnelles collectées sur le site est EcoLiz SAS, société par actions simplifiée immatriculée au RCS de Montpellier sous le numéro 912 267 580, dont le siège social est situé au 15 avenue d'Unterschleissheim, 34920 Le Crès.",
        ],
      },
      {
        heading: 'Données collectées',
        body: [
          "Dans le cadre de l'utilisation du site, EcoLiz peut collecter les données suivantes : nom, prénom, adresse email, numéro de téléphone, nom de l'entreprise, adresse de facturation, adresse de livraison, informations liées aux commandes, demandes de contact, informations nécessaires à la création et à la gestion d'un compte client professionnel.",
          "EcoLiz ne collecte que les données nécessaires à la gestion de ses services, de la relation commerciale et des demandes transmises par les utilisateurs.",
        ],
      },
      {
        heading: 'Finalités des traitements',
        body: [
          "Les données personnelles sont utilisées pour répondre aux demandes de contact, créer et gérer les comptes clients, traiter les commandes, établir des devis ou factures, assurer le suivi commercial, gérer le service après-vente, améliorer l'expérience utilisateur et respecter les obligations légales, comptables et fiscales applicables.",
        ],
      },
      {
        heading: 'Bases légales',
        body: [
          "Les traitements réalisés par EcoLiz peuvent reposer sur l'exécution d'un contrat ou de mesures précontractuelles, notamment pour les demandes de devis, commandes et comptes clients.",
          "Ils peuvent également reposer sur l'intérêt légitime d'EcoLiz pour le suivi commercial et l'amélioration de ses services, sur le respect d'obligations légales ou sur le consentement lorsque celui-ci est requis, notamment pour certains cookies ou communications spécifiques.",
        ],
      },
      {
        heading: 'Destinataires des données',
        body: [
          "Les données collectées sont destinées aux services internes d'EcoLiz concernés par la gestion commerciale, administrative, technique et logistique.",
          "Elles peuvent également être transmises à des prestataires techniques ou partenaires intervenant uniquement lorsque cela est nécessaire au fonctionnement du site, à l'hébergement, à la livraison, à la facturation ou au traitement des demandes.",
          "EcoLiz ne vend pas les données personnelles de ses utilisateurs.",
        ],
      },
      {
        heading: 'Durée de conservation',
        body: [
          "Les données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées.",
          "Les données liées à une commande, une facture ou une relation commerciale peuvent être conservées pendant la durée imposée par les obligations légales, comptables et fiscales applicables.",
          "Les données liées à une demande de contact sont conservées pendant une durée proportionnée au traitement de la demande et au suivi éventuel de la relation commerciale.",
        ],
      },
      {
        heading: 'Sécurité des données',
        body: [
          "EcoLiz met en œuvre des mesures techniques et organisationnelles destinées à protéger les données personnelles contre l'accès non autorisé, la modification, la perte, la divulgation ou la destruction.",
          "L'accès aux données est limité aux personnes et prestataires ayant besoin d'en connaître dans le cadre de leurs missions.",
        ],
      },
      {
        heading: 'Droits des personnes',
        body: [
          "Conformément à la réglementation applicable en matière de protection des données personnelles, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition, de limitation du traitement et de portabilité de vos données lorsque ces droits sont applicables.",
          "Vous pouvez exercer vos droits en utilisant l'adresse de contact indiquée sur la page Contact du site. Une preuve d'identité pourra être demandée en cas de doute raisonnable sur l'identité du demandeur.",
        ],
      },
      {
        heading: 'Réclamation',
        body: [
          "Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL, autorité française de protection des données personnelles.",
        ],
      },
      {
        heading: 'Mise à jour',
        body: [
          "La présente politique de confidentialité pourra être modifiée afin de tenir compte des évolutions du site, des services proposés ou de la réglementation applicable.",
        ],
      },
    ],
  },

  cookies: {
    title: 'Gestion des cookies',
    sections: [
      {
        heading: "Qu'est-ce qu'un cookie ?",
        body: [
          "Un cookie est un petit fichier texte déposé sur votre terminal lors de votre visite sur un site internet.",
          "Il peut permettre de mémoriser certaines préférences, de maintenir une session active, de gérer un panier ou d'analyser l'utilisation du site.",
        ],
      },
      {
        heading: 'Cookies nécessaires',
        body: [
          "Le site peut utiliser des cookies nécessaires à son bon fonctionnement, notamment pour la navigation, la sécurité, la gestion du panier, la connexion à l'espace client et la mémorisation de certains choix techniques.",
          "Ces cookies sont indispensables au fonctionnement du service demandé et ne nécessitent pas de consentement préalable.",
        ],
      },
      {
        heading: 'Cookies de mesure ou de suivi',
        body: [
          "Des cookies de mesure d'audience ou de suivi peuvent être utilisés uniquement lorsqu'ils sont mis en place et, lorsque la réglementation l'exige, après recueil du consentement de l'utilisateur.",
          "EcoLiz s'engage à informer clairement les utilisateurs lorsque de tels services sont activés.",
        ],
      },
      {
        heading: 'Gestion des préférences',
        body: [
          "L'utilisateur peut accepter, refuser ou modifier ses préférences relatives aux cookies non essentiels depuis le bandeau ou l'outil de gestion des cookies disponible sur le site.",
        ],
      },
    ],
  },
};

export function Legal() {
  const { slug: routeSlug } = useParams<{ slug?: string }>();
  const location = useLocation();

  const pathSlug = location.pathname.replace(/^\/+|\/+$/g, '') || 'mentions-legales';
  const slug = routeSlug || pathSlug;
  const content = legalContent[slug] ?? legalContent['mentions-legales'];

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
          Informations légales
        </p>

        <h1 className="text-4xl sm:text-5xl font-bold text-brand-950 tracking-tight mb-12">
          {content.title}
        </h1>

        <div className="bg-white rounded-2xl border border-brand-100 p-8 lg:p-10 space-y-8">
          {content.sections.map((section) => (
            <div key={section.heading}>
              <h2 className="text-xl font-bold text-brand-950 mb-3">
                {section.heading}
              </h2>

              <div className="space-y-3 text-brand-900/80 leading-relaxed">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
