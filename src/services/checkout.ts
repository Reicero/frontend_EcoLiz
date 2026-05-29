import { config } from "../config/env";

const WOO_API_URL = config.wooApiUrl.replace(/\/+$/, "");
const CART_TOKEN_KEY = "ecoliz_cart_token";

export type CheckoutAddress = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email?: string;
  phone?: string;
};

export type PlaceOrderPayload = {
  billing_address: CheckoutAddress;
  shipping_address: CheckoutAddress;
  customer_note?: string;
  create_account: boolean;
  payment_method: string;
  payment_data: unknown[];
};

export async function placeOrder(payload: PlaceOrderPayload) {
  const cartToken = localStorage.getItem(CART_TOKEN_KEY);

  const response = await fetch(`${WOO_API_URL}/checkout`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(cartToken ? { "Cart-Token": cartToken } : {}),
    },
    body: JSON.stringify(payload),
  });

  const newCartToken = response.headers.get("Cart-Token");

  if (newCartToken) {
    localStorage.setItem(CART_TOKEN_KEY, newCartToken);
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.message || "Impossible de valider la commande.");
  }

  return data;
}