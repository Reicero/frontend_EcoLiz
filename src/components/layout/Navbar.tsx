import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { User, ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CART_UPDATED_EVENT, getCart } from "../../services/cart";

const navLinks = [
  {
    label: "Accueil",
    to: "/",
  },
  {
    label: "À propos",
    to: "/a-propos",
  },
  {
    label: "Impact",
    to: "/impact",
  },
  {
    label: "Boutique",
    to: "/boutique",
  },
  {
    label: "Services",
    to: "/services",
  },
  {
    label: "FAQ",
    to: "/faq",
  },
  {
    label: "Contact",
    to: "/contact",
  },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const location = useLocation();

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("ecoliz_user")));
  }, [location.pathname]);

  useEffect(() => {
    async function loadCartCount() {
      try {
        const cart = await getCart();
        setCartCount(cart?.items_count ?? 0);
      } catch (error) {
        console.error("Erreur chargement compteur panier :", error);
        setCartCount(0);
      }
    }

    function handleCartUpdated(event: Event) {
      const detail = (event as CustomEvent<{ items_count?: number }>).detail;

      if (typeof detail?.items_count === "number") {
        setCartCount(detail.items_count);
        return;
      }

      loadCartCount();
    }

    loadCartCount();

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-brand-50/90 backdrop-blur-md border-b border-brand-100 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center cursor-pointer">
            <img
              src="/logo.png"
              alt="EcoLiz"
              className="h-16 w-auto object-contain bg-transparent drop-shadow-sm"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-700"
                      : "text-brand-900/80 hover:text-brand-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-5">
            <Link
              to={isLoggedIn ? "/compte" : "/connexion"}
              className="text-brand-900/70 hover:text-brand-900 transition-colors"
              aria-label={isLoggedIn ? "Mon compte" : "Se connecter"}
            >
              <User className="w-5 h-5" />
            </Link>

            <Link
              to="/panier"
              className="text-brand-900/70 hover:text-brand-900 transition-colors relative"
              aria-label={`Panier (${cartCount})`}
            >
              <ShoppingCart className="w-5 h-5" />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center leading-none">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-brand-200 mx-1" />

            <Link
              to="/contact"
              className="bg-brand-700 hover:bg-brand-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Demander un devis
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-brand-900"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -10,
            }}
            className="absolute top-full left-0 right-0 bg-white border-b border-brand-100 shadow-lg py-4 px-4 md:hidden flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-base font-medium text-brand-900 py-2 border-b border-brand-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            <Link
              to={isLoggedIn ? "/compte" : "/connexion"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-brand-900 py-2 border-b border-brand-50"
            >
              {isLoggedIn ? "Mon compte" : "Connexion"}
            </Link>

            <Link
              to="/panier"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-brand-900 py-2 border-b border-brand-50 flex items-center justify-between"
            >
              <span>Panier</span>

              {cartCount > 0 && (
                <span className="min-w-6 h-6 px-2 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="bg-brand-700 text-white px-4 py-3 rounded-lg text-sm font-medium mt-2 text-center"
            >
              Demander un devis
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}