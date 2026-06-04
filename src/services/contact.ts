import { config } from "../config/env";

export type ContactPayload = {
  firstname: string;
  lastname: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
};

const CONTACT_FORM_ID = import.meta.env.VITE_CF7_CONTACT_FORM_ID;

export async function sendContactMessage(payload: ContactPayload) {
  if (!CONTACT_FORM_ID) {
    throw new Error("ID du formulaire de contact manquant.");
  }

  const formData = new FormData();

  formData.append("your-firstname", payload.firstname);
  formData.append("your-lastname", payload.lastname);
  formData.append("your-email", payload.email);
  formData.append("your-company", payload.company ?? "");
  formData.append("your-subject", payload.subject);
  formData.append("your-message", payload.message);

  const wordpressUrl = config.wordpressUrl.replace(/\/+$/, "");

  const res = await fetch(
    `${wordpressUrl}/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json().catch(() => null);

  if (!res.ok || data?.status !== "mail_sent") {
    throw new Error(
      data?.message || "Impossible d'envoyer le message pour le moment."
    );
  }

  return data;
}