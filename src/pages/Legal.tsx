import React from 'react';
import { useParams } from 'react-router-dom';
const legalContent: Record<
  string,
  {
    title: string;
    sections: {
      heading: string;
      body: string;
    }[];
  }> =
{
  'mentions-legales': {
    title: 'Mentions légales',
    sections: [
    {
      heading: 'Éditeur du site',
      body: 'EcoLiz SAS, société par actions simplifiée au capital de 50 000 €, immatriculée au RCS de Paris sous le numéro 853 421 098, dont le siège social est situé au 12 rue de la Circularité, 75011 Paris.'
    },
    {
      heading: 'Directeur de la publication',
      body: 'Le directeur de la publication est Madame Sophie Martin, en qualité de Présidente.'
    },
    {
      heading: 'Hébergement',
      body: 'Le site est hébergé par OVHcloud, 2 rue Kellermann, 59100 Roubaix, France.'
    }]

  },
  cgv: {
    title: 'Conditions Générales de Vente',
    sections: [
    {
      heading: 'Article 1 – Objet',
      body: 'Les présentes conditions générales de vente régissent les relations contractuelles entre EcoLiz SAS et ses clients professionnels dans le cadre de la vente de matériel informatique reconditionné et de prestations de services associées.'
    },
    {
      heading: 'Article 2 – Commandes',
      body: "Toute commande passée sur le site implique l'acceptation sans réserve des présentes CGV. Les commandes sont définitives après confirmation par EcoLiz."
    },
    {
      heading: 'Article 3 – Garantie',
      body: "L'ensemble du matériel reconditionné est garanti 24 mois pièces et main d'œuvre. Les serveurs sont garantis 12 mois."
    }]

  },
  rgpd: {
    title: 'Politique de confidentialité (RGPD)',
    sections: [
    {
      heading: 'Données collectées',
      body: 'EcoLiz collecte uniquement les données nécessaires à la gestion de votre commande, de votre compte client et de la relation commerciale.'
    },
    {
      heading: 'Vos droits',
      body: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement et de portabilité de vos données. Pour exercer ces droits, contactez dpo@ecoliz.fr."
    },
    {
      heading: 'Conservation',
      body: 'Vos données sont conservées pendant la durée nécessaire à la finalité du traitement, et au maximum 5 ans après la fin de la relation commerciale.'
    }]

  },
  cookies: {
    title: 'Gestion des cookies',
    sections: [
    {
      heading: "Qu'est-ce qu'un cookie ?",
      body: "Un cookie est un petit fichier texte déposé sur votre terminal lors de votre visite. Il permet de mémoriser vos préférences et d'analyser l'usage du site."
    },
    {
      heading: 'Cookies utilisés',
      body: "EcoLiz utilise uniquement des cookies essentiels au fonctionnement du site et, avec votre consentement, des cookies de mesure d'audience anonymisés."
    },
    {
      heading: 'Gérer vos préférences',
      body: 'Vous pouvez à tout moment modifier vos préférences cookies depuis le bandeau présent en bas de page.'
    }]

  }
};
export function Legal() {
  const { slug = 'mentions-legales' } = useParams<{
    slug: string;
  }>();
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
          {content.sections.map((section) =>
          <div key={section.heading}>
              <h2 className="text-xl font-bold text-brand-950 mb-3">
                {section.heading}
              </h2>
              <p className="text-brand-900/80 leading-relaxed">
                {section.body}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>);

}