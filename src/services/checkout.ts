/**
 * Checkout service for order placement
 */

import { ApiClient } from './api/http';
import { config } from '../config/env';
import { parseResponse } from '../utils/http';

const CART_TOKEN_KEY = 'Cart-Token';

const checkoutClient = new ApiClient({
  baseUrl: config.wooApiUrl,
  tokenKey: CART_TOKEN_KEY,
});

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

/**
 * Place order and process payment
 */
export async function placeOrder(payload: PlaceOrderPayload) {
  const response = await fetch(`${config.wooApiUrl}/checkout`, {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(data.message || 'Impossible de valider la commande.');
  }

  return data;
}
