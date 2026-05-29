const ECOLIZ_API_URL = "/wp-api/ecoliz/v1";

export type RegisterPayload = {
  company: string;
  siret: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

async function authRequest(endpoint: string, body?: unknown) {
  const response = await fetch(`${ECOLIZ_API_URL}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Erreur API EcoLiz.");
  }

  return data;
}

export async function registerCustomer(payload: RegisterPayload) {
  return authRequest("/register", payload);
}

export async function loginCustomer(payload: LoginPayload) {
  return authRequest("/login", payload);
}

export async function getCurrentCustomer() {
  return authRequest("/me");
}