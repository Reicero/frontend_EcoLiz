<?php
require_once '/var/www/html/wp-load.php';

$csv = __DIR__ . '/promotions.csv';

if (!file_exists($csv)) {
    echo "promotions.csv introuvable\n";
    exit(1);
}

$handle = fopen($csv, 'r');
$headers = fgetcsv($handle, 0, ';');

if (!$headers) {
    echo "CSV vide\n";
    exit(1);
}

$now = new DateTime();

while (($row = fgetcsv($handle, 0, ';')) !== false) {
    $data = array_combine($headers, $row);

    $sku = trim($data['sku'] ?? '');
    $endDateText = trim($data['end_date'] ?? '');

    if ($sku === '' || $endDateText === '') {
        continue;
    }

    $endDate = DateTime::createFromFormat('Y-m-d H:i:s', $endDateText . ' 23:59:59');

    if (!$endDate || $now <= $endDate) {
        continue;
    }

    $productId = wc_get_product_id_by_sku($sku);

    if (!$productId) {
        echo "Produit introuvable : $sku\n";
        continue;
    }

    $product = wc_get_product($productId);

    if (!$product) {
        echo "Produit WooCommerce invalide : $sku\n";
        continue;
    }

    echo "Nettoyage promo expiree : $sku / produit #$productId\n";
    echo "  Avant sale_price : " . $product->get_sale_price() . "\n";

    $product->set_sale_price('');
    $product->set_date_on_sale_from(null);
    $product->set_date_on_sale_to(null);
    $product->set_price($product->get_regular_price());
    $product->update_meta_data('ecoliz_promotion_active', 'expired');
    $product->save();

    if (function_exists('wc_delete_product_transients')) {
        wc_delete_product_transients($productId);
    }

    clean_post_cache($productId);

    echo "  OK promo supprimee\n";
}

fclose($handle);

if (function_exists('wc_delete_shop_order_transients')) {
    wc_delete_shop_order_transients();
}

echo "Nettoyage termine\n";
