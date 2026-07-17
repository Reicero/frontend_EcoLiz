<?php
/**
 * Plugin Name: EcoLiz - Frais de livraison
 * Description: Calcule les frais de livraison selon la quantité totale des produits payants.
 * Version: 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Compte uniquement les produits payants.
 * Les services HABEUM-SVC restent des demandes sur devis.
 */
function ecoliz_get_paid_products_quantity(WC_Cart $cart): int
{
    $quantity = 0;

    foreach ($cart->get_cart() as $cart_item) {
        $product = $cart_item['data'] ?? null;

        if (!$product instanceof WC_Product) {
            continue;
        }

        $sku = strtoupper((string) $product->get_sku());

        if (strpos($sku, 'HABEUM-SVC-') === 0) {
            continue;
        }

        $quantity += (int) ($cart_item['quantity'] ?? 0);
    }

    return $quantity;
}

add_action('woocommerce_cart_calculate_fees', function (WC_Cart $cart): void {
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    $quantity = ecoliz_get_paid_products_quantity($cart);

    if ($quantity === 1) {
        $delivery_fee = 9.00;
    } elseif ($quantity >= 2 && $quantity <= 10) {
        $delivery_fee = 15.00;
    } else {
        // Aucun montant automatique à partir de 11 articles :
        // la livraison sera calculée sur devis.
        return;
    }

    $cart->add_fee(
        'Frais de livraison',
        $delivery_fee,
        true,
        ''
    );
});
