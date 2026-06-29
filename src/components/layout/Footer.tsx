import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Mail, Instagram } from 'lucide-react';
export function Footer() {
  return (
    <footer className="bg-brand-950 text-white pt-20 pb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-brand-700/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-accent-700/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-1">
            <div className="inline-flex mb-5">
              <img
                src="/logo.png"
                alt="EcoLiz"
                className="h-16 w-auto object-contain bg-transparent drop-shadow-sm" />
              
            </div>
            <p className="text-brand-100/60 text-sm mb-6 leading-relaxed">
              Le partenaire IT durable des entreprises. Matériel reconditionné
              premium, services de réparation et gestion de parc
              éco-responsable.
            </p>
            <div className="flex gap-4">
              <a
                href="https://fr.linkedin.com/company/ecoliz?trk=public_post_feed-actor-name"
                className="text-brand-200/60 hover:text-accent-400 transition-colors"
                aria-label="LinkedIn">
                
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/ecoliz_eu/"
                className="text-brand-200/60 hover:text-accent-400 transition-colors"
                aria-label="Instagram">
                
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@ecoliz.fr"
                className="text-brand-200/60 hover:text-accent-400 transition-colors"
                aria-label="Email">
                
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Boutique</h4>
            <ul className="space-y-3 text-sm text-brand-100/60">
              <li>
                <Link
                  to="/boutique"
                  className="hover:text-accent-400 transition-colors">
                  
                  Ordinateurs portables
                </Link>
              </li>
              <li>
                <Link
                  to="/boutique"
                  className="hover:text-accent-400 transition-colors">
                  
                  Postes fixes
                </Link>
              </li>
              <li>
                <Link
                  to="/boutique"
                  className="hover:text-accent-400 transition-colors">
                  
                  Écrans & Accessoires
                </Link>
              </li>
              <li>
                <Link
                  to="/boutique"
                  className="hover:text-accent-400 transition-colors">
                  
                  Serveurs & Réseau
                </Link>
              </li>
              <li>
                <Link
                  to="/boutique"
                  className="hover:text-accent-400 transition-colors">
                  
                  Promotions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Services</h4>
            <ul className="space-y-3 text-sm text-brand-100/60">
              <li>
                <Link
                  to="/services"
                  className="hover:text-accent-400 transition-colors">
                  
                  Réparation en atelier
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-accent-400 transition-colors">
                  
                  Maintenance sur site
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-accent-400 transition-colors">
                  
                  Reprise de parc IT
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-accent-400 transition-colors">
                  
                  Recyclage DEEE
                </Link>
              </li>
              <li>
                <Link
                  to="/compte"
                  className="hover:text-accent-400 transition-colors">
                  
                  Espace Client
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4">Entreprise</h4>
            <ul className="space-y-3 text-sm text-brand-100/60">
              <li>
                <Link
                  to="/a-propos"
                  className="hover:text-accent-400 transition-colors">
                  
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  to="/impact"
                  className="hover:text-accent-400 transition-colors">
                  
                  Notre impact écologique
                </Link>
              </li>
              <li>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-accent-400 transition-colors">
                  
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-brand-100/50">
            © {new Date().getFullYear()} EcoLiz SAS. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-brand-100/60">
            <Link
              to="/mentions-legales"
              className="hover:text-accent-400 transition-colors">
              
              Mentions légales
            </Link>
            <Link to="/cgv" className="hover:text-accent-400 transition-colors">
              CGV
            </Link>
            <Link
              to="/rgpd"
              className="hover:text-accent-400 transition-colors">
              
              Politique de confidentialité (RGPD)
            </Link>
            <Link
              to="/cookies"
              className="hover:text-accent-400 transition-colors">
              
              Gestion des cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>);

}