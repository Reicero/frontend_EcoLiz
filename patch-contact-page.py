from pathlib import Path
from datetime import datetime
import re

contact_path = Path("src/pages/Contact.tsx")

if not contact_path.exists():
    raise SystemExit("❌ Impossible de trouver src/pages/Contact.tsx")

old_contact = contact_path.read_text(encoding="utf-8")

backup = contact_path.with_suffix(".tsx.bak-contact-required-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
backup.write_text(old_contact, encoding="utf-8")

# On essaie de récupérer l'adresse mail déjà présente dans la page actuelle
email_match = re.search(r"mailto:([^?\"'\s]+)", old_contact)
if email_match:
    target_email = email_match.group(1)
else:
    generic_email = re.search(r"[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}", old_contact)
    target_email = generic_email.group(0) if generic_email else "contact@ecoliz.fr"

new_contact = r'''
import { FormEvent, useState } from "react";

const CONTACT_EMAIL = "__TARGET_EMAIL__";
const CONTACT_PHONE = "01 78 96 90 80";
const CONTACT_PHONE_LINK = "tel:+33178969080";

const SUBJECTS = [
  "Demande de devis EcoLiz",
  "Question sur un produit de la boutique",
  "Demande Try & Buy",
  "Recherche de matériel spécifique",
  "Projet d’équipement informatique",
  "SAV / suivi de commande",
  "Compte client / accès espace client",
];

type ContactForm = {
  fullName: string;
  company: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  consent: boolean;
};

export default function Contact() {
  const [form, setForm] = useState<ContactForm>({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    consent: false,
  });

  const [status, setStatus] = useState("");

  function updateField<K extends keyof ContactForm>(field: K, value: ContactForm[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const body = [
      `Nom et prénom : ${form.fullName}`,
      `Entreprise : ${form.company}`,
      `Email : ${form.email}`,
      `Téléphone : ${form.phone}`,
      `Sujet : ${form.subject}`,
      "",
      "Message :",
      form.message,
      "",
      "Formulaire envoyé depuis la page contact EcoLiz.",
    ].join("\n");

    const mailtoUrl =
      `mailto:${CONTACT_EMAIL}` +
      `?subject=${encodeURIComponent(form.subject)}` +
      `&body=${encodeURIComponent(body)}`;

    setStatus("Votre logiciel de messagerie va s’ouvrir pour envoyer la demande.");
    window.location.href = mailtoUrl;
  }

  return (
    <main className="bg-slate-50">
      <section className="relative overflow-hidden bg-sky-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,0.22),transparent_26%),linear-gradient(135deg,#082f49_0%,#0f172a_54%,#0e7490_100%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <p className="mb-4 inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
            Contact EcoLiz
          </p>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
                Parlons de votre projet informatique.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-sky-100/78">
                Une question sur la boutique, un besoin de devis, une demande Try & Buy
                ou un matériel spécifique à rechercher ? Envoyez-nous votre demande.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-sky-100/80">
                Téléphone
              </p>

              <a
                href={CONTACT_PHONE_LINK}
                className="mt-1 inline-flex text-2xl font-black text-cyan-200 transition hover:text-white"
              >
                {CONTACT_PHONE}
              </a>

              <p className="mt-3 text-sm leading-6 text-sky-100/70">
                Vous pouvez aussi utiliser le formulaire ci-dessous pour préciser votre besoin.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-14">
        <aside className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-sky-950">
            Sujets fréquents
          </h2>

          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-cyan-50 p-4">
              <p className="font-black text-sky-950">Boutique EcoLiz</p>
              <p className="mt-1">Question sur un produit, une référence, une catégorie ou une disponibilité.</p>
            </div>

            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="font-black text-sky-950">Try & Buy</p>
              <p className="mt-1">Demande de test gratuit sur HP EliteBook 840 ou modèle proche.</p>
            </div>

            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="font-black text-sky-950">Besoin spécifique</p>
              <p className="mt-1">Recherche de matériel adapté même au-delà du catalogue affiché.</p>
            </div>
          </div>
        </aside>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-cyan-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-black text-sky-950">
              Envoyer une demande
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Tous les champs sont obligatoires afin de pouvoir vous répondre correctement.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Nom et prénom *</span>
              <input
                required
                type="text"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="Votre nom complet"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Entreprise *</span>
              <input
                required
                type="text"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="Nom de votre entreprise"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Email *</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="nom@entreprise.fr"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Téléphone *</span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                placeholder="01 78 96 90 80"
              />
            </label>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-slate-700">Sujet de la demande *</span>
            <select
              required
              value={form.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              <option value="">Sélectionner un sujet</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-bold text-slate-700">Message *</span>
            <textarea
              required
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
              className="mt-2 min-h-[160px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              placeholder="Décrivez votre besoin, le type de matériel recherché, les quantités, les délais ou toute information utile."
            />
          </label>

          <label className="mt-5 flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <input
              required
              type="checkbox"
              checked={form.consent}
              onChange={(event) => updateField("consent", event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
            />

            <span>
              J’accepte que les informations saisies soient utilisées pour répondre à ma demande. *
            </span>
          </label>

          {status && (
            <p className="mt-4 rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
              {status}
            </p>
          )}

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-cyan-600 px-6 py-3.5 text-sm font-black text-white shadow-[0_14px_34px_rgba(8,145,178,0.24)] transition hover:-translate-y-0.5 hover:bg-cyan-700 sm:w-auto"
          >
            Envoyer ma demande →
          </button>
        </form>
      </section>
    </main>
  );
}
'''.replace("__TARGET_EMAIL__", target_email)

contact_path.write_text(new_contact, encoding="utf-8")

# Remplace le numéro dans les fichiers source existants
new_phone = "01 78 96 90 80"
new_tel = "tel:+33178969080"

for path in Path("src").rglob("*"):
    if path.is_file() and path.suffix in {".tsx", ".ts", ".jsx", ".js"} and ".bak-" not in path.name:
        text = path.read_text(encoding="utf-8")
        original = text

        text = re.sub(r"tel:\+?[\d\s().-]+", new_tel, text)
        text = re.sub(r"\b0[1-9](?:[\s.\-]?\d{2}){4}\b", new_phone, text)

        if text != original:
            backup_path = path.with_suffix(path.suffix + ".bak-phone-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
            backup_path.write_text(original, encoding="utf-8")
            path.write_text(text, encoding="utf-8")
            print(f"✅ Numéro mis à jour dans {path}")

print("✅ Page Contact remplacée")
print(f"✅ Email d’envoi utilisé : {target_email}")
print(f"✅ Sauvegarde Contact : {backup}")
