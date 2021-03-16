<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

use Vendidero\Germanized\Shipments\Admin\ProviderSettings;

/**
 * Adds Germanized Shipments settings.
 *
 * @class        WC_GZD_Settings_Tab_Shipments
 * @version        3.0.0
 * @author        Vendidero
 */
class WC_GZD_Settings_Tab_Shipping_Provider extends WC_GZD_Settings_Tab {

	public function get_description() {
		return ProviderSettings::get_description();
	}

	/**
	 * Output sections.
	 */
	public function output_sections() {
		global $current_section;

		$sections = $this->get_sections();

		if ( empty( $sections ) || 1 === sizeof( $sections ) ) {
			return;
		}

		echo '<ul class="subsubsub">';

		$array_keys = array_keys( $sections );

		foreach ( $sections as $id => $label ) {
			echo '<li><a href="' . $this->get_section_link( $id ) . '" class="' . ( $current_section == $id ? 'current' : '' ) . '">' . $label . '</a> ' . ( end( $array_keys ) == $id ? '' : '|' ) . ' </li>';
		}

		echo '</ul><br class="clear" />';
	}

	protected function get_section_link( $section ) {
		if ( $provider = ProviderSettings::get_current_provider() ) {
			$provider_slug = sanitize_title( $provider->get_name() );
		}

		return add_query_arg( array( 'section' => sanitize_title( $section ), 'tab' => $this->id, 'provider' => $provider_slug ), admin_url( 'admin.php?page=wc-settings' ) );
	}

	protected function get_breadcrumb() {
		$breadcrumb = array(
			array(
				'class' => 'main',
				'href'  => admin_url( 'admin.php?page=wc-settings&tab=germanized' ),
				'title' => __( 'Germanized', 'woocommerce-germanized' )
			)
		);

		$breadcrumb = array_merge( $breadcrumb, ProviderSettings::get_breadcrumb() );

		return $breadcrumb;
	}

	public function hide_from_main_panel() {
		return true;
	}

	public function get_label() {
		return __( 'Shipping Provider', 'woocommerce-germanized' );
	}

	public function get_name() {
		return 'shipping_provider';
	}

	public function get_help_link() {
		return ProviderSettings::get_help_link();
	}

	public function get_sections() {
		return ProviderSettings::get_sections();
	}

	public function save() {
		ProviderSettings::save();
	}

	public function output() {
		parent::output();
	}

	public function get_tab_settings( $current_section = '' ) {
		return ProviderSettings::get_settings( $current_section );
	}
}