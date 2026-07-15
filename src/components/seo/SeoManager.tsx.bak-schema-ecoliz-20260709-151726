import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type SeoConfig = {
  title: string;
  description: string;
};

const SITE_NAME = "EcoLiz";
const SITE_URL = "https://ecoliz.fr";

const seoByPath: Record<string, SeoConfig> = {
  "/": {
    title: "EcoLiz | Matériel informatique reconditionné professionnel",
    description:
      "EcoLiz propose du matériel informatique reconditionné pour les professionnels : ordinateurs, écrans, réseau, serveurs, accessoires et services associés.",
  },
  "/boutique": {
    title: "Boutique EcoLiz | Matériel informatique reconditionné",
    description:
      "Découvrez la boutique EcoLiz : ordinateurs portables, postes de travail, écrans, équipements réseau, serveurs et accessoires reconditionnés.",
  },
  "/services": {
    title: "Services EcoLiz | Accompagnement informatique professionnel",
    description:
      "EcoLiz accompagne les professionnels avec des services de masterisation, diagnostic de parc, support utilisateur, SAV et reconditionnement informatique.",
  },
  "/impact": {
    title: "Impact EcoLiz | Réemploi et informatique responsable",
    description:
      "Découvrez l’approche EcoLiz autour du réemploi, du matériel informatique reconditionné et de la réduction de l’impact environnemental.",
  },
  "/a-propos": {
    title: "À propos d’EcoLiz | Informatique reconditionnée professionnelle",
    description:
      "EcoLiz accompagne les entreprises, associations et collectivités dans l’achat de matériel informatique reconditionné et responsable.",
  },
  "/contact": {
    title: "Contact EcoLiz | Demande, SAV et accompagnement",
    description:
      "Contactez EcoLiz pour une demande commerciale, un accompagnement, une question SAV ou un besoin en matériel informatique reconditionné.",
  },
  "/faq": {
    title: "FAQ EcoLiz | Questions fréquentes",
    description:
      "Retrouvez les réponses aux questions fréquentes sur les produits EcoLiz, les commandes, les services, la garantie et le matériel reconditionné.",
  },
};

function getSeoForPath(pathname: string): SeoConfig {
  if (pathname.startsWith("/produit/")) {
    return {
      title: "Produit EcoLiz | Matériel informatique reconditionné",
      description:
        "Consultez cette fiche produit EcoLiz : caractéristiques, disponibilité, prix et informations sur le matériel informatique reconditionné.",
    };
  }

  if (pathname.startsWith("/articles/")) {
    return {
      title: "Article EcoLiz | Conseils informatique responsable",
      description:
        "Retrouvez les conseils et actualités EcoLiz autour du matériel informatique reconditionné, de l’impact numérique et de l’équipement professionnel.",
    };
  }

  return (
    seoByPath[pathname] ?? {
      title: "EcoLiz | Matériel informatique reconditionné",
      description:
        "EcoLiz propose du matériel informatique reconditionné et des services associés pour les professionnels.",
    }
  );
}

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setPropertyMetaTag(property: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`
  );

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setCanonical(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }

  link.setAttribute("href", url);
}

export function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeoForPath(location.pathname);
    const canonicalUrl = `${SITE_URL}${location.pathname}`;

    document.title = seo.title;

    setMetaTag("description", seo.description);
    setCanonical(canonicalUrl);

    setPropertyMetaTag("og:site_name", SITE_NAME);
    setPropertyMetaTag("og:title", seo.title);
    setPropertyMetaTag("og:description", seo.description);
    setPropertyMetaTag("og:type", "website");
    setPropertyMetaTag("og:url", canonicalUrl);

    setMetaTag("twitter:card", "summary_large_image");
    setMetaTag("twitter:title", seo.title);
    setMetaTag("twitter:description", seo.description);
  }, [location.pathname]);

  return null;
}
