import React from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductPage } from './pages/Product'
import { Account } from './pages/Account'
import { Contact } from './pages/Contact'
import { FAQ } from './pages/FAQ'
import { About } from './pages/About'
import { ArticlePage } from './pages/Article'
import { Legal } from './pages/Legal'
import { Services } from './pages/Services'
import { Impact } from './pages/Impact'
import { Cart } from './pages/Cart'
import Checkout from './pages/Checkout'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Testimonial } from './pages/Testimonial'
import { CookieBanner } from './components/layout/Cookies'
import { BitdefenderPopup } from "./components/layout/BitdefenderPopup";

const AUTH_ROUTES = ['/connexion', '/inscription']

function AppLayout() {
  const { pathname } = useLocation()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)
  return (
    <div className="min-h-screen bg-white text-brand-950 font-sans selection:bg-brand-100 selection:text-brand-900">
      {!isAuthRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/boutique" element={<Shop />} />
          <Route path="/produit/:slug" element={<ProductPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/compte" element={<Account />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/temoignage-client" element={<Testimonial />} />
          <Route path="/articles/:slug" element={<ArticlePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/panier" element={<Cart />} />
          <Route path="/mentions-legales" element={<Legal />} />
          <Route path="/cgv" element={<Legal />} />
          <Route path="/rgpd" element={<Legal />} />
          <Route path="/cookies" element={<Legal />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
        </Routes>
      </main>
      {!isAuthRoute && (
        <>
          <Footer />
          <BitdefenderPopup />
        </>
      )}
      <CookieBanner />
    </div>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}
