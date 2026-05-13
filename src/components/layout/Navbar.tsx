import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const navLinks = [
{
  label: 'Accueil',
  to: '/'
},
{
  label: 'Impact',
  to: '/impact'
},
{
  label: 'Boutique',
  to: '/boutique'
},
{
  label: 'Services',
  to: '/services'
},
{
  label: 'FAQ',
  to: '/faq'
},
{
  label: 'Contact',
  to: '/contact'
}];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-brand-50/90 backdrop-blur-md border-b border-brand-100 py-3' : 'bg-transparent py-5'}`}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer">
            <img
              src="/logo.png"
              alt="EcoLiz"
              className="h-12 w-auto object-contain" />
            
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-brand-900/80 hover:text-brand-700'}`
              }>
              
                {link.label}
              </NavLink>
            )}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-5">
            <button
              className="text-brand-900/70 hover:text-brand-900 transition-colors"
              aria-label="Rechercher">
              
              <Search className="w-5 h-5" />
            </button>
            <Link
              to="/compte"
              className="text-brand-900/70 hover:text-brand-900 transition-colors"
              aria-label="Mon compte">
              
              <User className="w-5 h-5" />
            </Link>
            <Link
              to="/panier"
              className="text-brand-900/70 hover:text-brand-900 transition-colors relative"
              aria-label="Panier"
>
              <ShoppingCart className="w-5 h-5" />

              <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                3
            </span>
            </Link>
            <div className="w-px h-6 bg-brand-200 mx-1" />
            <Link
              to="/contact"
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              
              Demander un devis
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-brand-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu">
            
            {mobileMenuOpen ?
            <X className="w-6 h-6" /> :

            <Menu className="w-6 h-6" />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <motion.div
          initial={{
            opacity: 0,
            y: -10
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            y: -10
          }}
          className="absolute top-full left-0 right-0 bg-white border-b border-brand-100 shadow-lg py-4 px-4 md:hidden flex flex-col gap-4">
          
            {navLinks.map((link) =>
          <NavLink
            key={link.to}
            to={link.to}
            className="text-base font-medium text-brand-900 py-2 border-b border-brand-50"
            onClick={() => setMobileMenuOpen(false)}>
            
                {link.label}
              </NavLink>
          )}
            <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="bg-brand-700 text-white px-4 py-3 rounded-lg text-sm font-medium mt-2 text-center">
            
              Demander un devis
            </Link>
          </motion.div>
        }
      </AnimatePresence>
    </header>);

}