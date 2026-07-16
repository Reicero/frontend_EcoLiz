export interface ContactPayload {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  orderNumber?: string;
  message: string;
  website?: string;
}

export interface ContactResponse {
  success: boolean;
  ticket_number?: string;
  status?: string;
  message?: string;
}

export async function sendContactMessage(
  payload: ContactPayload
): Promise<ContactResponse> {
  const response = await fetch("/wp-api/ecoliz/v1/support-request", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstname: payload.firstname,
      lastname: payload.lastname,
      email: payload.email,
      phone: payload.phone ?? "",
      company: payload.company ?? "",
      subject: payload.subject,
      order_number: payload.orderNumber ?? "",
      message: payload.message,
      website: payload.website ?? "",
    }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "Impossible d'envoyer le message pour le moment."
    );
  }

  return data;
}


export interface SupportTicket {
  id: number;
  ticket_number: string;
  status: string;
  status_label: string;
  subject: string;
  order_number?: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export async function fetchMySupportRequests(): Promise<SupportTicket[]> {
  const response = await fetch("/wp-api/ecoliz/v1/support-requests", {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      data?.message || "Impossible de charger vos demandes."
    );
  }

  return Array.isArray(data?.tickets) ? data.tickets : [];
}
