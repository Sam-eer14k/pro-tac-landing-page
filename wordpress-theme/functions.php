<?php
/**
 * ProTac Security theme functions.
 *
 * @package ProTac
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'PROTAC_VERSION', '3.0.0' );

/**
 * Where quote requests go. Change it under Settings > General > "ProTac quote email".
 * Falls back to the site admin email until it is set.
 */
function protac_lead_email() {
	$email = get_option( 'protac_lead_email' );
	return is_email( $email ) ? $email : get_option( 'admin_email' );
}

/**
 * URL of a file inside the theme.
 */
function protac_asset( $path ) {
	return esc_url( get_theme_file_uri( $path ) );
}

/* ------------------------------------------------------------------
 * Theme setup
 * ------------------------------------------------------------------ */
function protac_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
}
add_action( 'after_setup_theme', 'protac_setup' );

function protac_document_title( $title ) {
	if ( is_front_page() ) {
		$title['title']   = 'ProTac Security';
		$title['tagline'] = 'Licensed Armed and Unarmed Guards, Central Coast CA';
		unset( $title['site'] );
	}
	return $title;
}
add_filter( 'document_title_parts', 'protac_document_title' );

function protac_title_separator() {
	return '|';
}
add_filter( 'document_title_separator', 'protac_title_separator' );

/* ------------------------------------------------------------------
 * Styles and scripts
 * ------------------------------------------------------------------ */
function protac_enqueue() {
	wp_enqueue_style(
		'protac-fonts',
		'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'protac-style', get_stylesheet_uri(), array( 'protac-fonts' ), PROTAC_VERSION );
	wp_enqueue_script( 'protac-main', get_theme_file_uri( 'assets/js/main.js' ), array(), PROTAC_VERSION, array( 'in_footer' => true, 'strategy' => 'defer' ) );
}
add_action( 'wp_enqueue_scripts', 'protac_enqueue' );

function protac_resource_hints( $urls, $relation ) {
	if ( 'preconnect' === $relation ) {
		$urls[] = 'https://fonts.googleapis.com';
		$urls[] = array(
			'href'        => 'https://fonts.gstatic.com',
			'crossorigin' => 'anonymous',
		);
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'protac_resource_hints', 10, 2 );

/* ------------------------------------------------------------------
 * Head: favicons, meta, structured data
 * ------------------------------------------------------------------ */
function protac_head_meta() {
	// Theme favicons are used until a Site Icon is set in the Customizer.
	if ( ! has_site_icon() ) {
		?>
		<link rel="icon" href="<?php echo protac_asset( 'assets/images/favicon.ico' ); ?>" sizes="any">
		<link rel="icon" type="image/png" sizes="32x32" href="<?php echo protac_asset( 'assets/images/favicon-32x32.png' ); ?>">
		<link rel="icon" type="image/png" sizes="16x16" href="<?php echo protac_asset( 'assets/images/favicon-16x16.png' ); ?>">
		<link rel="apple-touch-icon" sizes="180x180" href="<?php echo protac_asset( 'assets/images/apple-touch-icon.png' ); ?>">
		<?php
	}
	?>
	<meta name="theme-color" content="#14192D">
	<?php
	if ( ! is_front_page() ) {
		return;
	}
	?>
	<link rel="preload" as="image" type="image/webp" href="<?php echo protac_asset( 'assets/images/hero-poster.webp' ); ?>">
	<meta name="description" content="ProTac Security provides licensed armed and unarmed guards, mobile patrol, event security and fire watch across Santa Maria, Lompoc, San Luis Obispo, Nipomo and Orcutt. PPO #18072. Call (805) 938-9100.">
	<meta property="og:site_name" content="ProTac Security">
	<meta property="og:title" content="ProTac Security | Licensed security for the Central Coast">
	<meta property="og:description" content="Armed and unarmed guards, mobile patrol, event security and fire watch. Open 24 hours. PPO #18072.">
	<meta property="og:type" content="website">
	<meta property="og:image" content="<?php echo protac_asset( 'assets/images/og-image.jpg' ); ?>">
	<meta name="twitter:card" content="summary_large_image">
	<script type="application/ld+json">
	<?php
	echo wp_json_encode(
		array(
			'@context'      => 'https://schema.org',
			'@type'         => 'LocalBusiness',
			'name'          => 'ProTac Security',
			'alternateName' => 'Protac Inc.',
			'description'   => 'Licensed California Private Patrol Operator (PPO #18072) providing armed and unarmed security guard services on the Central Coast.',
			'telephone'     => '+1-805-938-9100',
			'url'           => home_url( '/' ),
			'address'       => array(
				'@type'           => 'PostalAddress',
				'streetAddress'   => '127 W Clark Ave Ste 215',
				'addressLocality' => 'Santa Maria',
				'addressRegion'   => 'CA',
				'postalCode'      => '93455',
				'addressCountry'  => 'US',
			),
			'openingHours'  => 'Mo-Su 00:00-23:59',
			'areaServed'    => array( 'Santa Maria', 'Lompoc', 'San Luis Obispo', 'Nipomo', 'Orcutt' ),
			'sameAs'        => array(
				'https://x.com/ProtacSecurity',
				'https://www.facebook.com/ProTacSecurity/',
				'https://www.linkedin.com/company/protac-security-services/',
				'https://www.instagram.com/protac_security/',
			),
		),
		JSON_UNESCAPED_SLASHES
	);
	?>
	</script>
	<?php
}
add_action( 'wp_head', 'protac_head_meta', 2 );

/* ------------------------------------------------------------------
 * Settings: quote email field under Settings > General
 * ------------------------------------------------------------------ */
function protac_register_settings() {
	register_setting(
		'general',
		'protac_lead_email',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_email',
			'default'           => '',
		)
	);
	add_settings_field(
		'protac_lead_email',
		'ProTac quote email',
		function () {
			printf(
				'<input type="email" name="protac_lead_email" id="protac_lead_email" class="regular-text" value="%s"><p class="description">Quote requests from the front page go to this address. Leave blank to use the site admin email.</p>',
				esc_attr( get_option( 'protac_lead_email' ) )
			);
		},
		'general'
	);
}
add_action( 'admin_init', 'protac_register_settings' );

/* ------------------------------------------------------------------
 * Form handler (admin-post.php)
 * ------------------------------------------------------------------ */
function protac_redirect_back( $status ) {
	// The front-page script posts with ajax=1 and shows the result in place.
	if ( ! empty( $_POST['ajax'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Missing -- only selects the response format.
		wp_send_json( array( 'status' => $status ) );
	}
	$url = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	$url = remove_query_arg( 'protac', $url );
	$url = preg_replace( '/#.*$/', '', $url );
	wp_safe_redirect( add_query_arg( 'protac', $status, $url ) . '#contact' );
	exit;
}

function protac_handle_contact() {
	if ( ! isset( $_POST['protac_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['protac_nonce'] ) ), 'protac_contact' ) ) {
		protac_redirect_back( 'error' );
	}
	// Honeypot: real visitors never see this field.
	if ( ! empty( $_POST['website'] ) ) {
		protac_redirect_back( 'sent' );
	}

	$field = function ( $key ) {
		return isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Missing -- nonce checked above.
	};
	$name    = $field( 'name' );
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$phone   = $field( 'phone' );
	$service = $field( 'service' );
	$town    = $field( 'town' );
	$dates   = $field( 'dates' );
	$hours   = $field( 'hours' );
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';

	$digits = preg_replace( '/\D/', '', $phone );
	if ( strlen( $name ) < 2 || strlen( $digits ) < 10 || strlen( $town ) < 2 || ! $service || ( $email && ! is_email( $email ) ) ) {
		protac_redirect_back( 'invalid' );
	}

	$body = implode(
		"\n",
		array(
			'Name: ' . $name,
			'Phone: ' . $phone,
			'Email: ' . ( $email ? $email : 'Not given' ),
			'Needs: ' . $service,
			'Site: ' . $town,
			'Dates: ' . ( $dates ? $dates : 'Not given' ),
			'Hours: ' . ( $hours ? $hours : 'Not given' ),
			'',
			$message,
		)
	);

	$headers = array();
	if ( $email ) {
		$headers[] = 'Reply-To: ' . $name . ' <' . $email . '>';
	}

	$sent = wp_mail(
		protac_lead_email(),
		sprintf( 'Security quote request: %s, %s', $service, $name ),
		$body,
		$headers
	);

	protac_redirect_back( $sent ? 'sent' : 'error' );
}
add_action( 'admin_post_nopriv_protac_contact', 'protac_handle_contact' );
add_action( 'admin_post_protac_contact', 'protac_handle_contact' );

/**
 * Status message for the form after the redirect.
 *
 * @return array{0:string,1:string} [css class, message]
 */
function protac_form_status() {
	$status = isset( $_GET['protac'] ) ? sanitize_key( wp_unslash( $_GET['protac'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display only.
	switch ( $status ) {
		case 'sent':
			return array( 'is-ok', 'Thanks. Your request is with us and we will follow up with a quote.' );
		case 'invalid':
			return array( '', 'Some details were missing. Enter your name, a phone number with area code and the site's town, then send again.' );
		case 'error':
			return array( '', 'That did not go through. Please call us at (805) 938-9100.' );
	}
	return array( '', '' );
}
