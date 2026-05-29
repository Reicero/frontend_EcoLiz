import { config } from "../config/env";

const WOO_API_URL = config.wooApiUrl.replace(/\/+$/, "");
const CART_TOKEN_KEY = "ecoliz_cart_token";

function getStoredCartToken() {
  return localStorage.getItem(CART_TOKEN_KEY);
}

function saveCartToken(token: string | null) {
  if (token) {
    localStorage.setItem(CART_TOKEN_KEY, token);
  }
}

async function requestCart(endpoint = "/cart", options: RequestInit = {}) {
  const cartToken = getStoredCartToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(cartToken ? { "Cart-Token": cartToken } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${WOO_API_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  const newCartToken = response.headers.get("Cart-Token");
  saveCartToken(newCartToken);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur panier WooCommerce ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function getCart() {
  return requestCart("/cart");
}

export async function addToCart(productId: number, quantity = 1) {
  await getCart();

  return requestCart(`/cart/add-item?id=${productId}&quantity=${quantity}`, {
    method: "POST",
  });
}

export async function updateCartItem(key: string, quantity: number) {
  return requestCart(`/cart/update-item?key=${key}&quantity=${quantity}`, {
    method: "POST",
  });
}

export async function removeCartItem(key: string) {
  return requestCart(`/cart/remove-item?key=${key}`, {
    method: "POST",
  });
}