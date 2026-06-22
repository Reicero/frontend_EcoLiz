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

export type CustomerProfilePayload = {
  firstName: string;
  lastName: string;
  company: string;
  siret: string;
  phone: string;
};

export type CustomerAddressesPayload = {
  billing_address_1: string;
  billing_address_2: string;
  billing_postcode: string;
  billing_city: string;
  billing_country: string;
  shipping_address_1: string;
  shipping_address_2: string;
  shipping_postcode: string;
  shipping_city: string;
  shipping_country: string;
};

export type ChangePasswordPayload = {
  currentPassword: string;
  newPassword: string;
};

export type PasswordResetPayload = {
  email: string;
};

function getStoredCustomerId() {
  try {
    const user = JSON.parse(localStorage.getItem("ecoliz_user") || "{}");
    return user?.id || null;
  } catch {
    return null;
  }
}

function addCustomerId(payload: unknown) {
  const customerId = getStoredCustomerId();

  if (!payload || typeof payload !== "object") {
    return customerId ? { customerId } : payload;
  }

  return customerId
    ? {
        ...(payload as Record<string, unknown>),
        customerId,
      }
    : payload;
}

async function authRequest(endpoint: string, body?: unknown) {
  const payload = body ? addCustomerId(body) : undefined;

  const response = await fetch(`${ECOLIZ_API_URL}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || "Erreur API EcoLiz.");
  }

  return data;
}

function saveUserIfPresent(data: any) {
  if (data?.user) {
    localStorage.setItem("ecoliz_user", JSON.stringify(data.user));
  }

  return data;
}

export async function registerCustomer(payload: RegisterPayload) {
  const data = await authRequest("/register", payload);
  return saveUserIfPresent(data);
}

export async function loginCustomer(payload: LoginPayload) {
  const data = await authRequest("/login", payload);
  return saveUserIfPresent(data);
}

export async function getCurrentCustomer() {
  return authRequest("/me");
}

export async function updateCustomerProfile(payload: CustomerProfilePayload) {
  const data = await authRequest("/update-profile", payload);
  return saveUserIfPresent(data);
}

export async function updateCustomerAddresses(payload: CustomerAddressesPayload) {
  const data = await authRequest("/update-addresses", payload);
  return saveUserIfPresent(data);
}

export async function changeCustomerPassword(payload: ChangePasswordPayload) {
  return authRequest("/change-password", payload);
}

export async function requestPasswordReset(payload: PasswordResetPayload) {
  return authRequest("/password-reset", payload);
}

export async function logoutCustomer() {
  try {
    await authRequest("/logout", {});
  } finally {
    localStorage.removeItem("ecoliz_user");
  }
}
