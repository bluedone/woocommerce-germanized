/*global woocommerce_admin_meta_boxes, woocommerce_admin, accounting, woocommerce_admin_meta_boxes_order */
window.germanized = window.germanized || {};

( function( $, germanized ) {

    /**
     * Order Data Panel
     */
    germanized.settings = {

        params: {},

        init: function() {

            var self = this;

            this.params = wc_gzd_admin_settings_params;

            try {
                $( document.body ).on( 'wc-enhanced-select-init wc-gzd-enhanced-select-init', this.onEnhancedSelectInit ).trigger( 'wc-gzd-enhanced-select-init' );
            } catch( err ) {
                // If select2 failed (conflict?) log the error but don't stop other scripts breaking.
                window.console.log( err );
            }

            $( document )
                .on( 'change', 'select#woocommerce_gzd_checkboxes_parcel_delivery_show_special', this.onParcelDeliveryShowSpecial )
                .on( 'change', 'input#woocommerce_gzd_order_pay_now_button', this.onChangePayNow )
                .on( 'change', 'input[name=woocommerce_gzd_dispute_resolution_type]', this.onChangeDisputeResolutionType )
                .on( 'click', 'a.woocommerce-gzd-input-toggle-trigger', this.onInputToogleClick )
                .on( 'change', '.wc-gzd-setting-tabs input.woocommerce-gzd-tab-status-checkbox', this.onChangeTabStatus )
                .on( 'change', '.wc-gzd-admin-settings :input', this.onChangeInput );

            $( document.body )
                .on( 'woocommerce_gzd_setting_field_visible', this.onShowField )
                .on( 'woocommerce_gzd_setting_field_invisible', this.onHideField );

            $( '.wc-gzd-admin-settings :input' ).trigger( 'change' );

            $( 'select#woocommerce_gzd_checkboxes_parcel_delivery_show_special' ).trigger( 'change' );
            $( 'input#woocommerce_gzd_order_pay_now_button' ).trigger( 'change' );
            $( 'input[name=woocommerce_gzd_dispute_resolution_type]:checked' ).trigger( 'change' );

            this.initMailSortable();

            $( document.body ).on( 'init_tooltips', function() {
                self.initTipTips();
            });

            self.initTipTip();
        },

        initTipTip: function() {
            console.log('jaa');
            $( '.wc-gzd-setting-tab-actions a.button' ).tipTip( {
                'fadeIn': 50,
                'fadeOut': 50,
                'delay': 200
            });
        },

        onChangeTabStatus: function() {
            var $checkbox = $( this ),
                self      = germanized.settings,
                tab_id    = $checkbox.data( 'tab' ),
                $toggle   = $checkbox.parents( 'td' ).find( '.woocommerce-gzd-input-toggle' ),
                $link     = $toggle.parents( 'a' ),
                isEnabled = $checkbox.is( ':checked' ) ? 'yes' : 'no';

            console.log(isEnabled);

            var data = {
                action: 'woocommerce_gzd_toggle_tab_enabled',
                security: self.params.tab_toggle_nonce,
                enable: isEnabled,
                tab: tab_id
            };

            $toggle.addClass( 'woocommerce-input-toggle--loading' );

            $.ajax( {
                url:      self.params.ajax_url,
                data:     data,
                dataType : 'json',
                type     : 'POST',
                success:  function( response ) {
                    if ( true === response.data ) {
                        $toggle.removeClass( 'woocommerce-input-toggle--enabled, woocommerce-input-toggle--disabled' );
                        $toggle.addClass( 'woocommerce-input-toggle--enabled' );
                        $toggle.removeClass( 'woocommerce-input-toggle--loading' );
                    } else if ( false === response.data ) {
                        $toggle.removeClass( 'woocommerce-input-toggle--enabled, woocommerce-input-toggle--disabled' );
                        $toggle.addClass( 'woocommerce-input-toggle--disabled' );
                        $toggle.removeClass( 'woocommerce-input-toggle--loading' );
                    } else if ( 'needs_setup' === response.data ) {
                        window.location.href = $link.attr( 'href' );
                    }
                }
            } );

            return false;
        },

        onShowField: function( e, $field, name, value ) {
            var $inputs = $field.parents( 'table' ).find( ':input[data-show_if_' + name + ']' );

            $inputs.each( function() {
                var dataValue   = $( this ).data( 'show_if_' + name ),
                    currentVal  = $( this ).val(),
                    currentName = $( this ).attr( 'name' ).replace( '[]', '' ),
                    $field      = $( this ).parents( 'tr' );


                $field.removeClass( 'wc-gzd-setting-invisible' );
                $field.addClass( 'wc-gzd-setting-visible' );

                $( document.body ).trigger( 'woocommerce_gzd_setting_field_visible', [ $field, currentName, currentVal ] );
            });
        },

        onHideField: function( e, $field, name, value ) {
            var $inputs = $field.parents( 'table' ).find( ':input[data-show_if_' + name + ']' );

            $inputs.each( function() {
                var dataValue   = $( this ).data( 'show_if_' + name ),
                    currentVal  = $( this ).val(),
                    currentName = $( this ).attr( 'name' ).replace( '[]', '' ),
                    $field      = $( this ).parents( 'tr' );


                $field.removeClass( 'wc-gzd-setting-visible' );
                $field.addClass( 'wc-gzd-setting-invisible' );

                $( document.body ).trigger( 'woocommerce_gzd_setting_field_invisible', [ $field, currentName, currentVal ] );
            });
        },

        onChangeInput: function() {
            var $field = $( this ).parents( 'tr' );

            $field.find( ':input:not(.select2-focusser, .select2-input)' ).each( function() {
                var $input   = $( this ),
                    checked  = false,
                    nameOrg = $( this ).attr( 'name' );

                if ( $input.is( ':checked' ) || $input.is( ':selected' ) ) {
                    checked = true;
                }

                if ( typeof nameOrg === typeof undefined || nameOrg === false ) {
                    return;
                }

                var name    = nameOrg.replace( '[]', '' );
                var val     = $input.val();
                var $fields = $( '.wc-gzd-admin-settings' ).find( ':input[data-show_if_' + name +  ']' );

                if ( $input.is( ':checkbox' ) ) {
                    val = $input.is( ':checked' ) ? 'yes' : 'no';
                }

                $fields.each( function() {
                    var dataValue   = $( this ).data( 'show_if_' + name ),
                        currentVal  = $( this ).val(),
                        currentName = $( this ).attr( 'name' ).replace( '[]', '' ),
                        $field      = $( this ).parents( 'tr' );

                    $field.removeClass( 'wc-gzd-setting-visible wc-gzd-setting-invisible' );

                    if ( dataValue.length > 0 ) {

                        // Check value
                        if ( val === dataValue ) {
                            $field.addClass( 'wc-gzd-setting-visible' );

                            $( document.body ).trigger( 'woocommerce_gzd_setting_field_visible', [ $field, currentName, currentVal ] );
                        } else {
                            $field.addClass( 'wc-gzd-setting-invisible' );

                            $( document.body ).trigger( 'woocommerce_gzd_setting_field_invisible', [ $field, currentName, currentVal ] );
                        }
                    } else if ( checked ) {
                        $field.addClass( 'wc-gzd-setting-visible' );

                        $( document.body ).trigger( 'woocommerce_gzd_setting_field_visible', [ $field, currentName, currentVal ] );

                    } else {
                        $field.addClass( 'wc-gzd-setting-invisible' );

                        $( document.body ).trigger( 'woocommerce_gzd_setting_field_invisible', [ $field, currentName, currentVal ] );
                    }
                });

                var $table         = $( this ).parents( '.form-table' );
                var tableIsVisible = false;

                $table.find( 'tr' ).each( function() {
                    var isVisible = ! $( this ).hasClass( 'wc-gzd-setting-invisible' );

                    if ( isVisible ) {
                        tableIsVisible = true;
                        return false;
                    }
                });

                if ( ! tableIsVisible ) {
                    $table.hide();
                } else {
                    $table.show();
                }
            });
        },

        onEnhancedSelectInit: function() {
            // Tag select
            $( ':input.wc-gzd-enhanced-tags' ).filter( ':not(.enhanced)' ).each( function () {
                var select2_args = {
                    minimumResultsForSearch: 10,
                    allowClear: $( this ).data( 'allow_clear' ) ? true : false,
                    placeholder: $( this ).data( 'placeholder' ),
                    tags: true
                };

                $( this ).selectWoo( select2_args ).addClass( 'enhanced' );
            });
        },
      
        onParcelDeliveryShowSpecial: function() {
            var val = $( this ).val();

            if ( 'shipping_methods' === val ) {
                $( 'select#woocommerce_gzd_checkboxes_parcel_delivery_show_shipping_methods' ).parents( 'tr' ).show();
            } else {
                $( 'select#woocommerce_gzd_checkboxes_parcel_delivery_show_shipping_methods' ).parents( 'tr' ).hide();
            }
        },

        onChangePayNow: function() {
            if ( $( this ).is( ':checked' ) ) {
                $( 'select#woocommerce_gzd_order_pay_now_button_disabled_methods' ).parents( 'tr' ).show();
            } else {
                $( 'select#woocommerce_gzd_order_pay_now_button_disabled_methods' ).parents( 'tr' ).hide();
            }
        },

        onChangeDisputeResolutionType: function() {
            var val = $( this ).val();
            var text = $( '#woocommerce_gzd_alternative_complaints_text_' + val );

            $( '[id^=woocommerce_gzd_alternative_complaints_text_]' ).parents( 'tr' ).hide();
            $( '#woocommerce_gzd_alternative_complaints_text_' + val ).parents( 'tr' ).show();
        },

        onInputToogleClick: function() {
            var $toggle   = $( this ).find( 'span.woocommerce-gzd-input-toggle' ),
                $row      = $toggle.parents( 'fieldset' ),
                $checkbox = $row.find( 'input[type=checkbox]' ),
                $enabled  = $toggle.hasClass( 'woocommerce-input-toggle--enabled' );

            $toggle.removeClass( 'woocommerce-input-toggle--enabled' );
            $toggle.removeClass( 'woocommerce-input-toggle--disabled' );

            if ( $enabled ) {
                $checkbox.prop( 'checked', false );
                $toggle.addClass( 'woocommerce-input-toggle--disabled' );
            } else {
                $checkbox.prop( 'checked', true );
                $toggle.addClass( 'woocommerce-input-toggle--enabled' );
            }

            $checkbox.trigger( 'change' );

            return false;
        },

        initMailSortable: function() {
            if ( $( '#woocommerce_gzd_mail_attach_imprint' ).length > 0 ) {
                var table = $( '#woocommerce_gzd_mail_attach_imprint' ).parents( 'table' );
                $( table ).find( 'tbody' ).sortable({
                    items: 'tr',
                    cursor: 'move',
                    axis: 'y',
                    handle: 'td, th',
                    scrollSensitivity: 40,
                    helper:function(e,ui){
                        ui.children().each(function(){
                            jQuery(this).width(jQuery(this).width());
                        });
                        ui.css('left', '0');
                        return ui;
                    },
                    start:function(event,ui) {
                        ui.item.css('background-color','#f6f6f6');
                    },
                    stop:function(event,ui){
                        ui.item.removeAttr('style');
                        var pages = [];
                        $( table ).find( 'tr select' ).each( function() {
                            pages.push( $(this).attr( 'id' ).replace( 'woocommerce_gzd_mail_attach_', '' ) );
                        });
                        $( '#woocommerce_gzd_mail_attach_order' ).val( pages.join() );
                    }
                });
            }
        }
    };

    $( document ).ready( function() {
        germanized.settings.init();
    });

})( jQuery, window.germanized );