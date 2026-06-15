/**
 * Shopping cart service for WooCommerce Store API.
 */

import { config } from "../config/env";

const CART_TOKEN_KEY = "Cart-Token";
const NONCE_KEY = "Nonce";
const STORAGE_KEY = "ecoliz_cart_token";
const NONCE_STORAGE_KEY = "ecoliz_cart_nonce";

export const CART_UPDATED_EVENT = "ecoliz_cart_updated";

const WOO_API_URL = config.wooApiUrl.replace(/\/+$/, "");

function getStoredCartToken() {
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
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
    window.localStorage.setItem(STORAGE_KEY, cartToken);
  }

  if (nonce) {
    window.localStorage.setItem(NONCE_STORAGE_KEY, nonce);
  }
}

function buildHeaders() {
  const cartToken = getStoredCartToken();
  const nonce = getStoredNonce();

  return {
    "Content-Type": "application/json",
    ...(cartToken ? { [CART_TOKEN_KEY]: cartToken } : {}),
    ...(nonce ? { [NONCE_KEY]: nonce } : {}),
  };
}

function notifyCartUpdated(itemsCount: number): void {
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { items_count: itemsCount },
    })
  );
}

async function requestCart(path: string, init: RequestInit = {}) {
  const response = await fetch(`${WOO_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...buildHeaders(),
      ...init.headers,
    },
  });

  storeResponseTokens(response);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Erreur panier WooCommerce ${response.status} : ${details}`
    );
  }

  return response.json();
}

export async function getCart() {
  return requestCart("/cart");
}

export async function addToCart(productId: number, quantity = 1) {
  if (!getStoredCartToken() && !getStoredNonce()) {
    await getCart();
  }

  const cart = await requestCart("/cart/add-item", {
    method: "POST",
    body: JSON.stringify({
      id: productId,
      quantity,
    }),
  });

  notifyCartUpdated(cart?.items_count ?? 0);
  return cart;
}

export async function updateCartItem(key: string, quantity: number) {
  const cart = await requestCart("/cart/update-item", {
    method: "POST",
    body: JSON.stringify({
      key,
      quantity,
    }),
  });

  notifyCartUpdated(cart?.items_count ?? 0);
  return cart;
}

export async function removeCartItem(key: string) {
  const cart = await requestCart("/cart/remove-item", {
    method: "POST",
    body: JSON.stringify({
      key,
    }),
  });

  notifyCartUpdated(cart?.items_count ?? 0);
  return cart;
}
