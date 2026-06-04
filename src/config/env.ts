/**
 * Centralized environment configuration.
 * All external URLs are defined here to avoid hardcoding.
 */

function getEnvValue(value: string | undefined, fallback: string) {
  return value && value.trim() ? value.trim().replace(/\/+$/, "") : fallback;
}

export const config = {
  // WordPress main URL
  wordpressUrl: getEnvValue(
    import.meta.env.VITE_WORDPRESS_URL,
    "/index.php"
  ),

  // WooCommerce Store API endpoint
  wooApiUrl: getEnvValue(
    import.meta.env.VITE_WOO_API_URL,
    "/wp-api/wc/store"
  ),

  // EcoLiz Custom API endpoint
  ecolizApiUrl: getEnvValue(
    import.meta.env.VITE_ECOLIZ_API_URL,
    "/wp-api/ecoliz/v1"
  ),

  get myAccountUrl() {
    return `${this.wordpressUrl}/mon-compte`;
  },

  get myOrdersUrl() {
    return `${this.wordpressUrl}/mon-compte/orders`;
  },

  get cartUrl() {
    return `${this.wordpressUrl}/panier`;
  },

  get checkoutUrl() {
    return `${this.wordpressUrl}/validation-de-la-commande`;
  },

  get lostPasswordUrl() {
    return `${this.wordpressUrl}/mon-compte/lost-password`;
  },

  get logoutUrl() {
    return `${this.wordpressUrl}/mon-compte/customer-logout`;
  },

  /**
   * Build add-to-cart redirect URL.
   * After adding product, user is redirected to WooCommerce cart.
   */
  getAddToCartUrl(productId: number, quantity: number = 1) {
    return `${this.wordpressUrl}/?add-to-cart=${productId}&quantity=${quantity}`;
  },
};
