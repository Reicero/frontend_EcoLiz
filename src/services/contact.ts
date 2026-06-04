import { config } from "../config/env";

export type ContactPayload = {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
};

const CONTACT_FORM_ID = import.meta.env.VITE_CF7_CONTACT_FORM_ID || "6567";

export async function sendContactMessage(payload: ContactPayload) {
  if (!CONTACT_FORM_ID) {
    throw new Error("ID du formulaire de contact manquant.");
  }

  const wordpressUrl = config.wordpressUrl.replace(/\/+$/, "");

  const formData = new FormData();

  formData.append("your-firstname", payload.firstname);
  formData.append("your-lastname", payload.lastname);
  formData.append("your-email", payload.email);
  formData.append("your-phone", payload.phone ?? "");
  formData.append("your-company", payload.company ?? "");
  formData.append("your-subject", payload.subject);
  formData.append("your-message", payload.message);

  const contactUrl = `${wordpressUrl}/wp-json/contact-form-7/v1/contact-forms/${CONTACT_FORM_ID}/feedback`;

  console.log("URL Contact Form 7 :", contactUrl);

  const res = await fetch(contactUrl, {
    method: "POST",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  console.log("Réponse Contact Form 7 :", {
    statusHttp: res.status,
    ok: res.ok,
    data,
  });

  if (!res.ok || data?.status !== "mail_sent") {
    throw new Error(
      data?.message ||
        data?.status ||
        "Impossible d'envoyer le message pour le moment."
    );
  }

  return data;
}