/**
 * Centralized environment configuration.
 * All external URLs are defined here to avoid hardcoding.
 */

export const config = {
  // WordPress main URL (used for redirects to WooCommerce)
  wordpressUrl: import.meta.env.VITE_WORDPRESS_URL || "http://90.51.128.107:12443/index.php",

  // WooCommerce Store API endpoint (public catalog)
  wooApiUrl: import.meta.env.VITE_WOO_API_URL || "/wp-api/wc/store",

  // EcoLiz Custom API (for orders, equipment, etc.)
  ecolizApiUrl: import.meta.env.VITE_ECOLIZ_API_URL || "/wp-api/ecoliz/v1",

  // Derived URLs for convenience
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
