/**
 * Checkout service for order placement
 */

import { config } from "../config/env";
import { parseResponse } from "../utils/http";

const CART_TOKEN_KEY = "Cart-Token";
const NONCE_KEY = "Nonce";

const CART_TOKEN_STORAGE_KEY = "ecoliz_cart_token";
const NONCE_STORAGE_KEY = "ecoliz_cart_nonce";

export interface CheckoutAddress {
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
}

export interface PlaceOrderPayload {
  billing_address: CheckoutAddress;
  shipping_address: CheckoutAddress;
  customer_note?: string;
  create_account: boolean;
  payment_method: string;
  payment_data: unknown[];
}

function getStoredCartToken() {
  return window.localStorage.getItem(CART_TOKEN_STORAGE_KEY) ?? "";
}

function getStoredNonce() {
  return window.localStorage.getItem(NONCE_STORAGE_KEY) ?? "";
}

function storeResponseTokens(response: Response) {
  const cartToken = response.headers.get(CART_TOKEN_KEY);
  const nonce =
    response.headers.get(NONCE_KEY) ??
    response.headers.get("X-WC-Store-API-Nonce");

  if (cartToken) {
    window.localStorage.setItem(CART_TOKEN_STORAGE_KEY, cartToken);
  }

  if (nonce) {
    window.localStorage.setItem(NONCE_STORAGE_KEY, nonce);
  }
}

function buildCheckoutHeaders() {
  const cartToken = getStoredCartToken();
  const nonce = getStoredNonce();

  return {
    "Content-Type": "application/json",
    ...(cartToken ? { [CART_TOKEN_KEY]: cartToken } : {}),
    ...(nonce ? { [NONCE_KEY]: nonce } : {}),
  };
}

/**
 * Place order and process payment
 */
export async function placeOrder(payload: PlaceOrderPayload) {
  const response = await fetch(`${config.wooApiUrl}/checkout`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: buildCheckoutHeaders(),
    body: JSON.stringify(payload),
  });

  storeResponseTokens(response);

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Impossible de valider la commande.");
  }

  return data;
}