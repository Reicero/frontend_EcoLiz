/**
 * Shopping cart service for WooCommerce Store API
 */

import { ApiClient } from './api/http';
import { config } from '../config/env';

const CART_TOKEN_KEY = 'Cart-Token';
const STORAGE_KEY = 'ecoliz_cart_token';
export const CART_UPDATED_EVENT = 'ecoliz_cart_updated';

const cartClient = new ApiClient({
  baseUrl: config.wooApiUrl,
  tokenKey: CART_TOKEN_KEY,
});

/**
 * Dispatch cart updated event
 */
function notifyCartUpdated(itemsCount: number): void {
  window.dispatchEvent(
    new CustomEvent(CART_UPDATED_EVENT, {
      detail: { items_count: itemsCount },
    })
  );
}

/**
 * Get current cart
 */
export async function getCart() {
  return cartClient.get('/cart');
}

/**
 * Add item to cart
 */
export async function addToCart(productId: number, quantity: number = 1) {
  const cart = await cartClient.post(
    cartClient.buildUrl('/cart/add-item', { id: productId, quantity })
  );
  notifyCartUpdated(cart?.items_count ?? 0);
  return cart;
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(key: string, quantity: number) {
  const cart = await cartClient.post(
    cartClient.buildUrl('/cart/update-item', { key, quantity })
  );
  notifyCartUpdated(cart?.items_count ?? 0);
  return cart;
}

/**
 * Remove item from cart
 */
export async function removeCartItem(key: string) {
  const cart = await cartClient.post(
    cartClient.buildUrl('/cart/remove-item', { key })
  );
  notifyCartUpdated(cart?.items_count ?? 0);
  return cart;
}
