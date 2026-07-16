<?php
/**
 * Plugin Name: EcoLiz - API recherche entreprise
 * Description: Proxy WordPress pour rechercher une entreprise par nom, SIREN ou SIRET.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('ecoliz/v1', '/company-search', [
        'methods' => 'GET',
        'callback' => 'ecoliz_company_search',
        'permission_callback' => '__return_true',
    ]);
});

function ecoliz_company_search(WP_REST_Request $request) {
    $query = sanitize_text_field($request->get_param('q'));
    $per_page = intval($request->get_param('per_page'));

    if ($per_page < 1) {
        $per_page = 5;
    }

    if ($per_page > 10) {
        $per_page = 10;
    }

    if (strlen($query) < 3) {
        return rest_ensure_response([
            'results' => [],
        ]);
    }

    $url = add_query_arg(
        [
            'q' => $query,
            'per_page' => $per_page,
        ],
        'https://recherche-entreprises.api.gouv.fr/search'
    );

    $response = wp_remote_get($url, [
        'timeout' => 12,
        'headers' => [
            'Accept' => 'application/json',
        ],
    ]);

    if (is_wp_error($response)) {
        return new WP_Error(
            'company_search_unavailable',
            'Recherche entreprise indisponible.',
            ['status' => 502]
        );
    }

    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    if ($status_code < 200 || $status_code >= 300 || !is_array($data)) {
        return new WP_Error(
            'company_search_invalid_response',
            'Réponse invalide de la recherche entreprise.',
            ['status' => 502]
        );
    }

    return rest_ensure_response($data);
}
