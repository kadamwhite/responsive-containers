<?php
/**
 * Responsive Containers
 *
 * Easily style responsive containers using ResizeObserver.
 *
 * @wordpress-plugin
 * Plugin Name: Responsive Containers
 * Plugin URI:  https://github.com/kadamwhite/responsive-containers
 * Description: Easily style responsive containers using ResizeObserver.
 * Version:     1.1.0
 * Author:      K Adam White
 * Author URI:  http://kadamwhite.com
 * License:     GPL-2.0+
 * License URI: https//github.com/kadamwhite/responsive-containers/tree/master/license.txt
 */

/**
 * Enqueue frontend assets (runs on the frontend and in the block editor).
 *
 * @return void
 */
function responsive_containers_scripts() {
	$js_uri = plugin_dir_url( __FILE__ ) . 'build/responsive-containers.min.js';
	if ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) {
		$js_uri = str_replace( '.min.js', '.js', $js_uri );
	}
	wp_enqueue_script( 'responsive-containers', $js_uri, [], null, true );
}
add_action( 'enqueue_block_assets', 'responsive_containers_scripts' );

/**
 * Serialize and escape a JSON array of class names and the widths above which to apply them.
 *
 * @param array $breakpoints Array of class name => minimum width pairs.
 * @return string Serialized JSON string of breakpoint data for use as a data attribute value.
 */
function responsive_container_breakpoints( array $breakpoints ) : string {
	return esc_attr( wp_json_encode( $breakpoints ) );
}
