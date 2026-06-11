/**
 * Centralized environment configuration.
 * All external URLs are defined here to avoid hardcoding.
 */

import { normalizeUrl } from '../utils/string';

function getEnvValue(value: string | undefined, fallback: string): string {
  return normalizeUrl(value || fallback);
}

const WORDPRESS_URL = getEnvValue(
  import.meta.env.VITE_WORDPRESS_URL,
  '/index.php'
);

const WOO_API_URL = getEnvValue(
  import.meta.env.VITE_WOO_API_URL,
  '/wp-api/wc/store'
);

const ECOLIZ_API_URL = getEnvValue(
  import.meta.env.VITE_ECOLIZ_API_URL,
  '/wp-api/ecoliz/v1'
);

export const config = {
  get wordpressUrl(): string {
    return WORDPRESS_URL;
  },

  get wooApiUrl(): string {
    return WOO_API_URL;
  },

  get ecolizApiUrl(): string {
    return ECOLIZ_API_URL;
  },

  get myAccountUrl(): string {
    return `${WORDPRESS_URL}/mon-compte`;
  },

  get myOrdersUrl(): string {
    return `${WORDPRESS_URL}/mon-compte/orders`;
  },

  get cartUrl(): string {
    return `${WORDPRESS_URL}/panier`;
  },

  get checkoutUrl(): string {
    return `${WORDPRESS_URL}/validation-de-la-commande`;
  },

  get lostPasswordUrl(): string {
    return `${WORDPRESS_URL}/mon-compte/lost-password`;
  },

  get logoutUrl(): string {
    return `${WORDPRESS_URL}/mon-compte/customer-logout`;
  },

  /**
   * Build add-to-cart redirect URL.
   * After adding product, user is redirected to WooCommerce cart.
   */
  getAddToCartUrl(productId: number, quantity: number = 1): string {
    return `${WORDPRESS_URL}/?add-to-cart=${productId}&quantity=${quantity}`;
  },
} as const;
