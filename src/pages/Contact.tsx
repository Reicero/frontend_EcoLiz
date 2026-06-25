import React, { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { sendContactMessage } from "../services/contact";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    company: "",
    subject: "Demande de devis",
    message: "",
  });

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSubmitted(false);

      await sendContactMessage(formData);

      setSubmitted(true);

      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        company: "",
        subject: "Demande de devis",
        message: "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer le message pour le moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pt-32 pb-24 bg-brand-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-brand-700 font-semibold tracking-wide uppercase text-sm mb-3">
            Nous contacter
          </p>

          <h1 className="text-5xl font-bold text-brand-950 tracking-tight mb-4">
            Parlons de votre{" "}
            <span className="font-display italic text-accent-500">projet</span>.
          </h1>

          <p className="text-lg text-brand-900/70">
            Une question, un devis ou un audit de parc ? Notre équipe vous
            répond sous 4h ouvrées.
          </p>
        </header>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-12">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-brand-100 p-6 flex items-start gap-4">
              <div className="bg-brand-100 p-3 rounded-xl text-brand-700">
                <Mail className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-brand-950 mb-1">Email</h3>
                <a
                  href="mailto:contact@ecoliz.fr"
                  className="text-brand-900/70 hover:text-brand-700"
                >
                  contact@ecoliz.fr
                </a>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-100 p-6 flex items-start gap-4">
              <div className="bg-brand-100 p-3 rounded-xl text-brand-700">
                <Phone className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-brand-950 mb-1">Téléphone</h3>
                <a
                  href="tel:+33178969080"
                  className="text-brand-900/70 hover:text-brand-700"
                >
                  01 78 96 90 80
                </a>

                <p className="text-xs text-brand-900/50 mt-1">
                  Lun-Ven · 9h-18h
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-100 p-6 flex items-start gap-4">
              <div className="bg-brand-100 p-3 rounded-xl text-brand-700">
                <MapPin className="w-5 h-5" />
              </div>

              <div>
                <h3 className="font-bold text-brand-950 mb-1">Atelier</h3>
                <p className="text-brand-900/70 text-sm">
                  15 Avenue d&apos;Unterschleissheim
                  <br />
                  34920 Le Crès, France
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-brand-100 p-8 lg:p-10">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-brand-100 rounded-full flex items-center justify-center mb-6">
                  <Send className="w-6 h-6 text-brand-700" />
                </div>

                <h2 className="text-2xl font-bold text-brand-950 mb-3">
                  Message envoyé !
                </h2>

                <p className="text-brand-900/70 mb-6">
                  Votre message a bien été transmis. Notre équipe vous répondra
                  sous 4h ouvrées.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                  className="text-brand-700 hover:text-brand-800 underline"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
            <p className="mb-4 text-sm text-slate-500">* Champs obligatoires</p>
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-brand-900 mb-2">
                      Prénom *</label>

                    <input
                      type="text"
                      required
                      value={formData.firstname}
                      onChange={(e) => updateField("firstname", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-900 mb-2">
                      Nom *</label>

                    <input
                      type="text"
                      required
                      value={formData.lastname}
                      onChange={(e) => updateField("lastname", e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">
                    Email professionnel *</label>

                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">
                    Téléphone *</label>

                  <input required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">
                    Entreprise *</label>

                  <input required
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">
                    Sujet *</label>

                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => updateField("subject", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition bg-white"
                  >
                  <option value="">Sélectionner un sujet</option>
                  <option value="Demande de devis EcoLiz">Demande de devis EcoLiz</option>
                  <option value="Question sur un produit de la boutique">Question sur un produit de la boutique</option>
                  <option value="Demande Try & Buy">Demande Try & Buy</option>
                  <option value="Recherche de matériel spécifique">Recherche de matériel spécifique</option>
                  <option value="Projet d’équipement informatique">Projet d’équipement informatique</option>
                  <option value="SAV / suivi de commande">SAV / suivi de commande</option>
                  <option value="Compte client / espace client">Compte client / espace client</option>

                </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-900 mb-2">
                    Message *</label>

                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-brand-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-7 py-4 rounded-xl text-base font-medium transition-all shadow-lg shadow-brand-900/20"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}