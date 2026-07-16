<?php
/**
 * Plugin Name: EcoLiz API
 * Description: API REST personnalisée pour l'espace client EcoLiz.
 * Version: 1.0.1
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('rest_api_init', function () {
    register_rest_route('ecoliz/v1', '/health', [
        'methods' => 'GET',
        'callback' => 'ecoliz_api_health',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/register', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_register',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/login', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_login',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/logout', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_logout',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/me', [
        'methods' => 'GET',
        'callback' => 'ecoliz_api_me',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/update-profile', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_update_profile',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/update-addresses', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_update_addresses',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/change-password', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_change_password',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/password-reset', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_password_reset',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/password-reset-confirm', [
        'methods' => 'POST',
        'callback' => 'ecoliz_api_password_reset_confirm',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/my-orders', [
        'methods' => 'GET',
        'callback' => 'ecoliz_api_my_orders',
        'permission_callback' => '__return_true',
    ]);
});

function ecoliz_api_health() {
    return ecoliz_api_response([
        'ok' => true,
        'message' => 'EcoLiz API active',
    ], 200);
}

function ecoliz_api_response($data = [], $status = 200) {
    $data['nonce'] = wp_create_nonce('wp_rest');
    return new WP_REST_Response($data, $status);
}

function ecoliz_api_is_logged_in() {
    return is_user_logged_in();
}

function ecoliz_format_user($user_id) {
    $user = get_userdata($user_id);

    if (!$user) {
        return null;
    }

    return [
        'id' => $user_id,
        'email' => $user->user_email,
        'firstName' => get_user_meta($user_id, 'first_name', true),
        'lastName' => get_user_meta($user_id, 'last_name', true),
        'company' => get_user_meta($user_id, 'billing_company', true),
        'siret' => get_user_meta($user_id, 'ecoliz_siret', true),
        'phone' => get_user_meta($user_id, 'billing_phone', true),

        'address_1' => get_user_meta($user_id, 'billing_address_1', true),
        'address_2' => get_user_meta($user_id, 'billing_address_2', true),
        'postcode' => get_user_meta($user_id, 'billing_postcode', true),
        'city' => get_user_meta($user_id, 'billing_city', true),
        'country' => get_user_meta($user_id, 'billing_country', true),

        'billing_address_1' => get_user_meta($user_id, 'billing_address_1', true),
        'billing_address_2' => get_user_meta($user_id, 'billing_address_2', true),
        'billing_postcode' => get_user_meta($user_id, 'billing_postcode', true),
        'billing_city' => get_user_meta($user_id, 'billing_city', true),
        'billing_country' => get_user_meta($user_id, 'billing_country', true),

        'shipping_address_1' => get_user_meta($user_id, 'shipping_address_1', true),
        'shipping_address_2' => get_user_meta($user_id, 'shipping_address_2', true),
        'shipping_postcode' => get_user_meta($user_id, 'shipping_postcode', true),
        'shipping_city' => get_user_meta($user_id, 'shipping_city', true),
        'shipping_country' => get_user_meta($user_id, 'shipping_country', true),
    ];
}


/**
 * Récupère les informations d'adresse d'un établissement à partir de son SIRET.
 */
function ecoliz_get_company_address_from_siret($siret) {
    $siret = preg_replace('/\D+/', '', (string) $siret);

    if (strlen($siret) !== 14) {
        return [];
    }

    $url = add_query_arg(
        [
            'q' => $siret,
            'per_page' => 10,
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
        return [];
    }

    $status_code = wp_remote_retrieve_response_code($response);

    if ($status_code < 200 || $status_code >= 300) {
        return [];
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);
    $results = is_array($data['results'] ?? null) ? $data['results'] : [];

    foreach ($results as $company) {
        $establishment = null;

        $matching_establishments =
            is_array($company['matching_etablissements'] ?? null)
                ? $company['matching_etablissements']
                : [];

        foreach ($matching_establishments as $candidate) {
            $candidate_siret = preg_replace(
                '/\D+/',
                '',
                (string) ($candidate['siret'] ?? '')
            );

            if ($candidate_siret === $siret) {
                $establishment = $candidate;
                break;
            }
        }

        $siege = is_array($company['siege'] ?? null)
            ? $company['siege']
            : [];

        $siege_siret = preg_replace(
            '/\D+/',
            '',
            (string) ($siege['siret'] ?? '')
        );

        if (!$establishment && $siege_siret === $siret) {
            $establishment = $siege;
        }

        if (!$establishment) {
            continue;
        }

        $postcode = sanitize_text_field(
            $establishment['code_postal'] ?? ''
        );

        $city = sanitize_text_field(
            $establishment['libelle_commune'] ?? ''
        );

        // On privilégie les composants séparés afin d'éviter d'avoir
        // le code postal et la ville deux fois dans l'adresse WooCommerce.
        $street_parts = [
            $establishment['complement_adresse'] ?? '',
            $establishment['numero_voie'] ?? '',
            $establishment['indice_repetition'] ?? '',
            $establishment['type_voie'] ?? '',
            $establishment['libelle_voie'] ?? '',
        ];

        $street_parts = array_filter(
            array_map('sanitize_text_field', $street_parts)
        );

        $address_1 = trim(implode(' ', $street_parts));

        // Certains établissements ne fournissent que le champ adresse complet.
        if (!$address_1) {
            $address_1 = sanitize_text_field(
                $establishment['adresse'] ?? ''
            );

            if ($address_1 && $postcode && $city) {
                $suffix = trim($postcode . ' ' . $city);

                $address_1 = preg_replace(
                    '/\s+' . preg_quote($suffix, '/') . '$/iu',
                    '',
                    $address_1
                );

                $address_1 = trim((string) $address_1);
            }
        }

        return [
            'company' =>
                sanitize_text_field(
                    $company['nom_complet']
                    ?? $company['nom_raison_sociale']
                    ?? $company['denomination']
                    ?? ''
                ),
            'address1' => $address_1,
            'postcode' => $postcode,
            'city' => $city,
            'country' => 'FR',
        ];
    }

    return [];
}

function ecoliz_api_register(WP_REST_Request $request) {
    $data = $request->get_json_params();

    $company = sanitize_text_field($data['company'] ?? '');
    $siret = sanitize_text_field($data['siret'] ?? '');
    $first_name = sanitize_text_field($data['firstName'] ?? '');
    $last_name = sanitize_text_field($data['lastName'] ?? '');
    $email = sanitize_email($data['email'] ?? '');
    $phone = sanitize_text_field(
        $data['phone'] ?? $data['billing_phone'] ?? ''
    );
    $password = (string) ($data['password'] ?? '');

    $address_1 = sanitize_text_field($data['address1'] ?? '');
    $postcode = sanitize_text_field($data['postcode'] ?? '');
    $city = sanitize_text_field($data['city'] ?? '');
    $country = sanitize_text_field($data['country'] ?? 'FR');

    if (!$country) {
        $country = 'FR';
    }

    // Sécurité côté serveur : si le frontend n'a pas envoyé l'adresse,
    // WordPress la récupère directement grâce au SIRET.
    if (!$address_1 || !$postcode || !$city) {
        $company_data = ecoliz_get_company_address_from_siret($siret);

        if (!empty($company_data)) {
            if (!$company) {
                $company = $company_data['company'] ?? '';
            }

            if (!$address_1) {
                $address_1 = $company_data['address1'] ?? '';
            }

            if (!$postcode) {
                $postcode = $company_data['postcode'] ?? '';
            }

            if (!$city) {
                $city = $company_data['city'] ?? '';
            }

            if (!$country) {
                $country = $company_data['country'] ?? 'FR';
            }
        }
    }

    // Retire le code postal et la ville lorsque l'API les a aussi
    // ajoutés à la fin de la première ligne d'adresse.
    if ($address_1 && $postcode && $city) {
        $address_1 = preg_replace(
            '/\\s+' . preg_quote($postcode, '/') .
            '\\s+' . preg_quote($city, '/') .
            '\\s*$/iu',
            '',
            $address_1
        );

        $address_1 = trim((string) $address_1);
    }

    if (!$company || !$first_name || !$last_name || !$email || !$phone || !$password) {
        return new WP_REST_Response([
            'message' => 'Tous les champs obligatoires doivent être renseignés.',
        ], 400);
    }

    if (!is_email($email)) {
        return new WP_REST_Response([
            'message' => 'Adresse email invalide.',
        ], 400);
    }

    if (email_exists($email)) {
        return new WP_REST_Response([
            'message' => 'Un compte existe déjà avec cette adresse email.',
        ], 409);
    }

    $user_id = wp_create_user($email, $password, $email);

    if (is_wp_error($user_id)) {
        return new WP_REST_Response([
            'message' => $user_id->get_error_message(),
        ], 400);
    }

    wp_update_user([
        'ID' => $user_id,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'display_name' => trim($first_name . ' ' . $last_name),
    ]);

    $user = new WP_User($user_id);
    $user->set_role('customer');

    update_user_meta($user_id, 'billing_first_name', $first_name);
    update_user_meta($user_id, 'billing_last_name', $last_name);
    update_user_meta($user_id, 'shipping_first_name', $first_name);
    update_user_meta($user_id, 'shipping_last_name', $last_name);
    update_user_meta($user_id, 'billing_company', $company);
    update_user_meta($user_id, 'shipping_company', $company);

    update_user_meta($user_id, 'billing_email', $email);
    update_user_meta($user_id, 'billing_phone', $phone);

    update_user_meta($user_id, 'billing_address_1', $address_1);
    update_user_meta($user_id, 'billing_postcode', $postcode);
    update_user_meta($user_id, 'billing_city', $city);
    update_user_meta($user_id, 'billing_country', $country);

    update_user_meta($user_id, 'shipping_address_1', $address_1);
    update_user_meta($user_id, 'shipping_postcode', $postcode);
    update_user_meta($user_id, 'shipping_city', $city);
    update_user_meta($user_id, 'shipping_country', $country);

    update_user_meta($user_id, 'ecoliz_siret', $siret);

    // Envoi du mail de bienvenue EcoLiz.
    $welcome_subject = 'Bienvenue sur EcoLiz';

    $welcome_message =
        "Bonjour " . $first_name . ",\n\n"
        . "Votre compte EcoLiz a bien été créé.\n\n"
        . "Vous pouvez maintenant vous connecter à votre espace client pour consulter vos informations et suivre vos commandes :\n"
        . "https://ecoliz.fr/connexion\n\n"
        . "Merci et bienvenue sur EcoLiz !\n\n"
        . "L'équipe EcoLiz";

    wp_mail($email, $welcome_subject, $welcome_message);

    wp_set_current_user($user_id);
    wp_set_auth_cookie($user_id, true);

    return ecoliz_api_response([
        'message' => 'Compte créé avec succès.',
        'user' => ecoliz_format_user($user_id),
    ], 201);
}

function ecoliz_api_login(WP_REST_Request $request) {
    $data = $request->get_json_params();

    $email = sanitize_email($data['email'] ?? '');
    $password = (string) ($data['password'] ?? '');

    if (!$email || !$password) {
        return new WP_REST_Response([
            'message' => 'Email et mot de passe obligatoires.',
        ], 400);
    }

    $user = wp_signon([
        'user_login' => $email,
        'user_password' => $password,
        'remember' => true,
    ], false);

    if (is_wp_error($user)) {
        return new WP_REST_Response([
            'message' => 'Identifiants incorrects.',
        ], 401);
    }

    wp_set_current_user($user->ID);
    wp_set_auth_cookie($user->ID, true);

    return ecoliz_api_response([
        'message' => 'Connexion réussie.',
        'user' => ecoliz_format_user($user->ID),
    ], 200);
}

function ecoliz_api_logout() {
    wp_logout();

    return ecoliz_api_response([
        'message' => 'Déconnexion réussie.',
    ], 200);
}

function ecoliz_api_me() {
    if (!is_user_logged_in()) {
        return new WP_REST_Response([
            'message' => 'Utilisateur non connecté.',
        ], 401);
    }

    return ecoliz_api_response([
        'user' => ecoliz_format_user(get_current_user_id()),
    ], 200);
}

function ecoliz_api_update_profile(WP_REST_Request $request) {
    $data = $request->get_json_params();

    $user_id = get_current_user_id();

    if (!$user_id && !empty($data['customerId'])) {
        $user_id = absint($data['customerId']);
    }

    if (!$user_id || !get_userdata($user_id)) {
        return new WP_REST_Response([
            'message' => 'Client introuvable.',
        ], 401);
    }

    $first_name = sanitize_text_field($data['firstName'] ?? '');
    $last_name = sanitize_text_field($data['lastName'] ?? '');
    $company = sanitize_text_field($data['company'] ?? '');
    $siret = sanitize_text_field($data['siret'] ?? '');
    $phone = sanitize_text_field(
        $data['phone'] ?? $data['billing_phone'] ?? ''
    );

    if (!$first_name || !$last_name || !$company) {
        return new WP_REST_Response([
            'message' => 'Prénom, nom et entreprise sont obligatoires.',
        ], 400);
    }

    wp_update_user([
        'ID' => $user_id,
        'first_name' => $first_name,
        'last_name' => $last_name,
        'display_name' => trim($first_name . ' ' . $last_name),
    ]);

    update_user_meta($user_id, 'billing_first_name', $first_name);
    update_user_meta($user_id, 'billing_last_name', $last_name);
    update_user_meta($user_id, 'shipping_first_name', $first_name);
    update_user_meta($user_id, 'shipping_last_name', $last_name);
    update_user_meta($user_id, 'billing_company', $company);
    update_user_meta($user_id, 'billing_phone', $phone);
    update_user_meta($user_id, 'ecoliz_siret', $siret);

    return ecoliz_api_response([
        'message' => 'Informations mises à jour.',
        'user' => ecoliz_format_user($user_id),
    ], 200);
}

function ecoliz_api_update_addresses(WP_REST_Request $request) {
    $data = $request->get_json_params();

    $user_id = get_current_user_id();

    if (!$user_id && !empty($data['customerId'])) {
        $user_id = absint($data['customerId']);
    }

    if (!$user_id || !get_userdata($user_id)) {
        return new WP_REST_Response([
            'message' => 'Client introuvable.',
        ], 401);
    }

    $fields = [
        'billing_address_1',
        'billing_address_2',
        'billing_postcode',
        'billing_city',
        'billing_country',
        'shipping_address_1',
        'shipping_address_2',
        'shipping_postcode',
        'shipping_city',
        'shipping_country',
    ];

    foreach ($fields as $field) {
        update_user_meta($user_id, $field, sanitize_text_field($data[$field] ?? ''));
    }

    return ecoliz_api_response([
        'message' => 'Adresses mises à jour.',
        'user' => ecoliz_format_user($user_id),
    ], 200);
}

function ecoliz_api_change_password(WP_REST_Request $request) {
    $data = $request->get_json_params();

    $user_id = get_current_user_id();

    if (!$user_id && !empty($data['customerId'])) {
        $user_id = absint($data['customerId']);
    }

    if (!$user_id || !get_userdata($user_id)) {
        return new WP_REST_Response([
            'message' => 'Client introuvable.',
        ], 401);
    }

    $current_password = (string) ($data['currentPassword'] ?? '');
    $new_password = (string) ($data['newPassword'] ?? '');

    if (!$current_password || !$new_password) {
        return new WP_REST_Response([
            'message' => 'Mot de passe actuel et nouveau mot de passe obligatoires.',
        ], 400);
    }

    if (strlen($new_password) < 8) {
        return new WP_REST_Response([
            'message' => 'Le nouveau mot de passe doit contenir au moins 8 caractères.',
        ], 400);
    }

    $user = get_userdata($user_id);

    if (!$user || !wp_check_password($current_password, $user->user_pass, $user_id)) {
        return new WP_REST_Response([
            'message' => 'Mot de passe actuel incorrect.',
        ], 401);
    }

    wp_set_password($new_password, $user_id);

    return ecoliz_api_response([
        'message' => 'Mot de passe modifié avec succès.',
    ], 200);
}

function ecoliz_api_password_reset(WP_REST_Request $request) {
    $data = $request->get_json_params();
    $email = sanitize_email($data['email'] ?? '');

    if (!$email || !is_email($email)) {
        return new WP_REST_Response([
            'message' => 'Adresse email invalide.',
        ], 400);
    }

    $user = get_user_by('email', $email);

    if ($user) {
        $result = retrieve_password($user->user_login);

        if (is_wp_error($result)) {
            return new WP_REST_Response([
                'message' => $result->get_error_message(),
            ], 400);
        }
    }

    return new WP_REST_Response([
        'message' => 'Si un compte existe, un email de réinitialisation sera envoyé.',
    ], 200);
}


function ecoliz_api_password_reset_confirm(WP_REST_Request $request) {
    $data = $request->get_json_params();

    $login = sanitize_text_field($data['login'] ?? '');
    $key = sanitize_text_field($data['key'] ?? '');
    $password = (string) ($data['password'] ?? '');

    if (!$login || !$key || !$password) {
        return new WP_REST_Response([
            'message' => 'Lien de réinitialisation ou mot de passe invalide.',
        ], 400);
    }

    if (strlen($password) < 8) {
        return new WP_REST_Response([
            'message' => 'Le mot de passe doit contenir au moins 8 caractères.',
        ], 400);
    }

    $user = check_password_reset_key($key, $login);

    if (is_wp_error($user)) {
        return new WP_REST_Response([
            'message' => 'Ce lien de réinitialisation est invalide ou a expiré.',
        ], 400);
    }

    reset_password($user, $password);

    return new WP_REST_Response([
        'message' => 'Votre mot de passe a été réinitialisé avec succès.',
    ], 200);
}


/**
 * Remplace le lien WordPress du mail de réinitialisation
 * par la page EcoLiz React.
 */
add_filter('retrieve_password_message', function ($message, $key, $user_login, $user_data) {
    $reset_url = 'https://ecoliz.fr/reinitialiser-mot-de-passe'
        . '?key=' . rawurlencode($key)
        . '&login=' . rawurlencode($user_login);

    return "Bonjour,\n\n"
        . "Une demande de réinitialisation de mot de passe a été effectuée pour votre compte EcoLiz.\n\n"
        . "Pour choisir un nouveau mot de passe, cliquez sur le lien suivant :\n"
        . $reset_url . "\n\n"
        . "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.\n\n"
        . "L'équipe EcoLiz";
}, 10, 4);

add_filter('retrieve_password_title', function ($title) {
    return 'Réinitialisation de votre mot de passe EcoLiz';
});

function ecoliz_format_order($order) {
    $items = [];

    foreach ($order->get_items() as $item) {
        $product = $item->get_product();

        $items[] = [
            'name' => $item->get_name(),
            'quantity' => (int) $item->get_quantity(),
            'subtotal' => (float) $item->get_subtotal(),
            'total' => (float) $item->get_total(),
            'sku' => $product ? $product->get_sku() : '',
            'product_id' => $product ? $product->get_id() : 0,
        ];
    }

    return [
        'id' => $order->get_id(),
        'date' => $order->get_date_created()
            ? $order->get_date_created()->date('Y-m-d H:i:s')
            : '',
        'total' => (float) $order->get_total(),
        'items' => count($order->get_items()),
        'status' => $order->get_status(),
        'products' => $items,
        'billing' => [
            'first_name' => $order->get_billing_first_name(),
            'last_name' => $order->get_billing_last_name(),
            'company' => $order->get_billing_company(),
            'email' => $order->get_billing_email(),
            'phone' => $order->get_billing_phone(),
            'address_1' => $order->get_billing_address_1(),
            'address_2' => $order->get_billing_address_2(),
            'postcode' => $order->get_billing_postcode(),
            'city' => $order->get_billing_city(),
            'country' => $order->get_billing_country(),
        ],
        'shipping' => [
            'first_name' => $order->get_shipping_first_name(),
            'last_name' => $order->get_shipping_last_name(),
            'company' => $order->get_shipping_company(),
            'address_1' => $order->get_shipping_address_1(),
            'address_2' => $order->get_shipping_address_2(),
            'postcode' => $order->get_shipping_postcode(),
            'city' => $order->get_shipping_city(),
            'country' => $order->get_shipping_country(),
        ],
    ];
}

function ecoliz_api_my_orders(WP_REST_Request $request) {
    $customer_id = absint($request->get_param('customer_id'));

    if (!$customer_id && is_user_logged_in()) {
        $customer_id = get_current_user_id();
    }

    if (!$customer_id) {
        return new WP_REST_Response([], 200);
    }

    if (!function_exists('wc_get_orders')) {
        return new WP_REST_Response([
            'message' => 'WooCommerce est indisponible.',
        ], 500);
    }

    $orders = wc_get_orders([
        'customer_id' => $customer_id,
        'limit' => 20,
        'orderby' => 'date',
        'order' => 'DESC',
    ]);

    $result = array_map('ecoliz_format_order', $orders);

    return new WP_REST_Response($result, 200);
}
