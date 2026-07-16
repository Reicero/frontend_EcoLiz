<?php
/**
 * Plugin Name: EcoLiz - Demandes support
 * Description: Mini-ticketing EcoLiz pour les demandes de contact, SAV et support.
 */

if (!defined('ABSPATH')) {
    exit;
}

function ecoliz_register_support_post_type() {
    register_post_type('ecoliz_support', [
        'labels' => [
            'name' => 'Tickets support EcoLiz',
            'singular_name' => 'Ticket support EcoLiz',
            'add_new_item' => 'Ajouter un ticket',
            'edit_item' => 'Modifier le ticket',
            'view_item' => 'Voir le ticket',
        ],
        'public' => false,
        'show_ui' => true,
        'show_in_menu' => true,
        'menu_icon' => 'dashicons-sos',
        'supports' => ['title', 'editor'],
        'rewrite' => false,
        'query_var' => false,
    ]);
}
add_action('init', 'ecoliz_register_support_post_type');

function ecoliz_support_status_labels() {
    return [
        'nouveau' => 'Nouveau',
        'en_cours' => 'En cours',
        'resolu' => 'Résolu',
        'ferme' => 'Fermé',
    ];
}


/**
 * Identifie le client connecté depuis la session WordPress.
 *
 * L'API REST WordPress attend normalement un nonce pour utiliser
 * l'authentification par cookie. Le frontend EcoLiz étant headless,
 * on valide directement le cookie WordPress signé.
 */
function ecoliz_support_current_user_id() {
    $user_id = get_current_user_id();

    if ($user_id) {
        return (int) $user_id;
    }

    if (
        !defined('LOGGED_IN_COOKIE')
        || empty($_COOKIE[LOGGED_IN_COOKIE])
    ) {
        return 0;
    }

    $cookie = wp_unslash($_COOKIE[LOGGED_IN_COOKIE]);
    $user_id = wp_validate_auth_cookie($cookie, 'logged_in');

    if (!$user_id) {
        return 0;
    }

    wp_set_current_user($user_id);

    return (int) $user_id;
}

add_action('rest_api_init', function () {
    register_rest_route('ecoliz/v1', '/support-request', [
        'methods' => 'POST',
        'callback' => 'ecoliz_submit_support_request',
        'permission_callback' => '__return_true',
    ]);

    register_rest_route('ecoliz/v1', '/support-requests', [
        'methods' => 'GET',
        'callback' => 'ecoliz_get_my_support_requests',
        'permission_callback' => '__return_true',
    ]);
});

function ecoliz_submit_support_request(WP_REST_Request $request) {
    $params = $request->get_json_params();

    $firstname = sanitize_text_field($params['firstname'] ?? '');
    $lastname = sanitize_text_field($params['lastname'] ?? '');
    $email = sanitize_email($params['email'] ?? '');
    $phone = sanitize_text_field($params['phone'] ?? '');
    $company = sanitize_text_field($params['company'] ?? '');
    $subject = sanitize_text_field($params['subject'] ?? '');
    $order_number = sanitize_text_field($params['order_number'] ?? '');
    $message = sanitize_textarea_field($params['message'] ?? '');
    $website = sanitize_text_field($params['website'] ?? '');
    $customer_id = ecoliz_support_current_user_id();

    if (!empty($website)) {
        return rest_ensure_response([
            'success' => true,
            'message' => 'Votre demande a bien été transmise.',
        ]);
    }

    if (!$firstname || !$lastname || !$email || !$phone || !$company || !$subject || !$message) {
        return new WP_Error(
            'missing_fields',
            'Merci de compléter tous les champs obligatoires.',
            ['status' => 400]
        );
    }

    if (!is_email($email)) {
        return new WP_Error(
            'invalid_email',
            'Merci d’indiquer une adresse e-mail valide.',
            ['status' => 400]
        );
    }

    $full_name = trim($firstname . ' ' . $lastname);

    $post_id = wp_insert_post([
        'post_type' => 'ecoliz_support',
        'post_status' => 'publish',
        'post_title' => $subject . ' - ' . $company,
        'post_content' => $message,
    ], true);

    if (is_wp_error($post_id)) {
        return new WP_Error(
            'support_request_failed',
            'Impossible d’enregistrer la demande.',
            ['status' => 500]
        );
    }

    $ticket_number = 'ECO-SUP-' . $post_id;
    $support_status = 'nouveau';

    update_post_meta($post_id, '_ecoliz_support_ticket_number', $ticket_number);
    update_post_meta($post_id, '_ecoliz_support_status', $support_status);
    update_post_meta($post_id, '_ecoliz_support_firstname', $firstname);
    update_post_meta($post_id, '_ecoliz_support_lastname', $lastname);
    update_post_meta($post_id, '_ecoliz_support_full_name', $full_name);
    update_post_meta($post_id, '_ecoliz_support_email', $email);
    update_post_meta($post_id, '_ecoliz_support_phone', $phone);
    update_post_meta($post_id, '_ecoliz_support_company', $company);
    update_post_meta($post_id, '_ecoliz_support_subject', $subject);
    update_post_meta($post_id, '_ecoliz_support_order_number', $order_number);
    update_post_meta($post_id, '_ecoliz_support_created_at', current_time('mysql'));

    if ($customer_id) {
        update_post_meta(
            $post_id,
            '_ecoliz_support_customer_id',
            $customer_id
        );
    }

    wp_update_post([
        'ID' => $post_id,
        'post_title' => $ticket_number . ' - ' . $subject . ' - ' . $company,
    ]);

    $recipient = get_option('woocommerce_email_from_address');
    if (!$recipient) {
        $recipient = get_option('admin_email');
    }

    $admin_headers = [
        'Cc: bertrand@habeum.com, adrien.albert@ecoliz.fr',
        'Reply-To: ' . $full_name . ' <' . $email . '>',
    ];

    wp_mail(
        $recipient,
        'Nouveau ticket EcoLiz - ' . $ticket_number,
        "Un nouveau ticket support a été créé depuis le site EcoLiz.\n\n" .
        "Référence ticket : " . $ticket_number . "\n" .
        "Statut : Nouveau\n" .
        "Sujet : " . $subject . "\n" .
        "Entreprise : " . $company . "\n" .
        "Nom : " . $full_name . "\n" .
        "Email : " . $email . "\n" .
        "Téléphone : " . $phone . "\n" .
        "Numéro de commande : " . ($order_number ?: 'Non renseigné') . "\n\n" .
        "Message :\n" . $message,
        $admin_headers
    );

    wp_mail(
        $email,
        'Votre demande EcoLiz a bien été reçue - ' . $ticket_number,
        "Bonjour " . $firstname . ",\n\n" .
        "Votre demande a bien été reçue par EcoLiz.\n\n" .
        "Référence de votre ticket : " . $ticket_number . "\n" .
        "Statut : Nouveau\n" .
        "Sujet : " . $subject . "\n\n" .
        "Notre équipe reviendra vers vous dès que possible.\n\n" .
        "Merci,\n" .
        "L’équipe EcoLiz"
    );

    return rest_ensure_response([
        'success' => true,
        'ticket_number' => $ticket_number,
        'status' => $support_status,
        'message' => 'Votre demande a bien été transmise à EcoLiz. Référence ticket : ' . $ticket_number,
    ]);
}


/**
 * Retourne uniquement les tickets du client WordPress connecté.
 * Les anciens tickets sont également retrouvés grâce à son adresse e-mail.
 */
function ecoliz_get_my_support_requests(WP_REST_Request $request) {
    $user_id = ecoliz_support_current_user_id();

    if (!$user_id) {
        return new WP_Error(
            'support_authentication_required',
            'Vous devez être connecté pour consulter vos demandes.',
            ['status' => 401]
        );
    }

    $user = get_userdata($user_id);

    if (!$user) {
        return new WP_Error(
            'support_customer_not_found',
            'Compte client introuvable.',
            ['status' => 404]
        );
    }

    $query = new WP_Query([
        'post_type' => 'ecoliz_support',
        'post_status' => 'publish',
        'posts_per_page' => 50,
        'orderby' => 'date',
        'order' => 'DESC',
        'no_found_rows' => true,
        'meta_query' => [
            'relation' => 'OR',
            [
                'key' => '_ecoliz_support_customer_id',
                'value' => (string) $user_id,
                'compare' => '=',
            ],
            [
                'key' => '_ecoliz_support_email',
                'value' => $user->user_email,
                'compare' => '=',
            ],
        ],
    ]);

    $labels = ecoliz_support_status_labels();
    $tickets = [];

    foreach ($query->posts as $ticket) {
        $status = get_post_meta(
            $ticket->ID,
            '_ecoliz_support_status',
            true
        ) ?: 'nouveau';

        $created_at = get_post_meta(
            $ticket->ID,
            '_ecoliz_support_created_at',
            true
        );

        if (!$created_at) {
            $created_at = $ticket->post_date;
        }

        $tickets[] = [
            'id' => $ticket->ID,
            'ticket_number' => get_post_meta(
                $ticket->ID,
                '_ecoliz_support_ticket_number',
                true
            ),
            'status' => $status,
            'status_label' => $labels[$status] ?? $status,
            'subject' => get_post_meta(
                $ticket->ID,
                '_ecoliz_support_subject',
                true
            ),
            'order_number' => get_post_meta(
                $ticket->ID,
                '_ecoliz_support_order_number',
                true
            ),
            'message' => $ticket->post_content,
            'created_at' => mysql2date('c', $created_at),
            'updated_at' => mysql2date('c', $ticket->post_modified),
        ];
    }

    wp_reset_postdata();

    return rest_ensure_response([
        'tickets' => $tickets,
    ]);
}

add_filter('manage_ecoliz_support_posts_columns', function ($columns) {
    $new_columns = [];

    $new_columns['cb'] = $columns['cb'];
    $new_columns['title'] = 'Ticket';
    $new_columns['ticket_number'] = 'Référence';
    $new_columns['support_status'] = 'Statut';
    $new_columns['company'] = 'Entreprise';
    $new_columns['customer_email'] = 'Email';
    $new_columns['date'] = $columns['date'];

    return $new_columns;
});

add_action('manage_ecoliz_support_posts_custom_column', function ($column, $post_id) {
    if ($column === 'ticket_number') {
        echo esc_html(get_post_meta($post_id, '_ecoliz_support_ticket_number', true));
    }

    if ($column === 'support_status') {
        $status = get_post_meta($post_id, '_ecoliz_support_status', true) ?: 'nouveau';
        $labels = ecoliz_support_status_labels();
        echo esc_html($labels[$status] ?? $status);
    }

    if ($column === 'company') {
        echo esc_html(get_post_meta($post_id, '_ecoliz_support_company', true));
    }

    if ($column === 'customer_email') {
        $email = get_post_meta($post_id, '_ecoliz_support_email', true);
        if ($email) {
            echo '<a href="mailto:' . esc_attr($email) . '">' . esc_html($email) . '</a>';
        }
    }
}, 10, 2);

add_action('add_meta_boxes', function () {
    add_meta_box(
        'ecoliz_support_details',
        'Détails du ticket EcoLiz',
        'ecoliz_render_support_details_metabox',
        'ecoliz_support',
        'normal',
        'high'
    );
});

function ecoliz_render_support_details_metabox($post) {
    $labels = ecoliz_support_status_labels();
    $current_status = get_post_meta($post->ID, '_ecoliz_support_status', true) ?: 'nouveau';

    wp_nonce_field('ecoliz_save_support_ticket', 'ecoliz_support_nonce');

    $fields = [
        'Référence ticket' => get_post_meta($post->ID, '_ecoliz_support_ticket_number', true),
        'Nom' => get_post_meta($post->ID, '_ecoliz_support_full_name', true),
        'Entreprise' => get_post_meta($post->ID, '_ecoliz_support_company', true),
        'Email' => get_post_meta($post->ID, '_ecoliz_support_email', true),
        'Téléphone' => get_post_meta($post->ID, '_ecoliz_support_phone', true),
        'Sujet' => get_post_meta($post->ID, '_ecoliz_support_subject', true),
        'Numéro de commande' => get_post_meta($post->ID, '_ecoliz_support_order_number', true) ?: 'Non renseigné',
        'Date de création' => get_post_meta($post->ID, '_ecoliz_support_created_at', true),
    ];

    echo '<div style="display:grid;gap:10px;">';

    foreach ($fields as $label => $value) {
        echo '<p style="margin:0;"><strong>' . esc_html($label) . ' :</strong> ' . esc_html($value) . '</p>';
    }

    echo '<p style="margin:8px 0 0;"><strong>Statut :</strong></p>';
    echo '<select name="ecoliz_support_status" style="min-width:220px;">';

    foreach ($labels as $value => $label) {
        echo '<option value="' . esc_attr($value) . '" ' . selected($current_status, $value, false) . '>' . esc_html($label) . '</option>';
    }

    echo '</select>';
    echo '</div>';
}

add_action('save_post_ecoliz_support', function ($post_id) {
    if (!isset($_POST['ecoliz_support_nonce']) || !wp_verify_nonce($_POST['ecoliz_support_nonce'], 'ecoliz_save_support_ticket')) {
        return;
    }

    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }

    if (!current_user_can('edit_post', $post_id)) {
        return;
    }

    $allowed_statuses = array_keys(ecoliz_support_status_labels());
    $new_status = sanitize_text_field($_POST['ecoliz_support_status'] ?? '');

    if (in_array($new_status, $allowed_statuses, true)) {
        update_post_meta($post_id, '_ecoliz_support_status', $new_status);
    }
});
