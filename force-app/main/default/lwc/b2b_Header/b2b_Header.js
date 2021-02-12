/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { track, LightningElement } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import { getPageLabelValues, getConfigValues } from 'c/b2b_CommonServices';
import isGuest from '@salesforce/user/isGuest';
import ccrzJavascriptResource from '@salesforce/resourceUrl/ccrz__CCRZ_JS';
import themeResource from '@salesforce/resourceUrl/ccrz__CC_Theme_Capricorn';


export default class b2b_Header extends LightningElement {
    @track storefrontBaseUrl;
    @track configValues = {};
    @track pageLabelValues = {};

    displayEAHeader = false;
    isGuestUser = isGuest;

    constructor() {
        super();
        this.initConfigurationProperties();
        this.initPageLabelProperties();
    }

    connectedCallback() {
        if (ccrzJavascriptResource) {
            loadStyle(this, ccrzJavascriptResource + '/v004/boot3/css/ccrz-libs.min.css')
                .then(() => { return loadStyle(this, themeResource + '/css3/styles.css') })
                .catch(error => console.error('[b2blwc.connectedCallback]: Error loading css ' + error));
        }
    }

    initPageLabelProperties() {
        getPageLabelValues().then(result => {
            // b2b_MyAccount Component
            this.pageLabelValues.myAccountText = result['Component_SiteHeader_MyAccount'];
            this.pageLabelValues.loginText = result['Component_SiteHeader_Login'];
            this.pageLabelValues.logoutText = result['Component_SiteHeader_Logout'];
            // b2b_MenuBar Component
            this.pageLabelValues.menuHomeIconText = result['Menu_Home'];
            this.pageLabelValues.menuToggleNavigationText = result['Menu_ToggleNavigation'];
            // b2b_Search Component
            this.pageLabelValues.ProductSearch = result['ProductSearch'];
            this.pageLabelValues.productSearchTooltip = result['ProductSearch_Tooltip'];
            // b2b_CartHeader Component
            this.pageLabelValues.MyCart = result['Component_SiteHeader_MyCart'];
            this.pageLabelValues.Item = result['Component_MiniCart_Item'];
            this.pageLabelValues.Items = result['Component_MiniCart_Items'];
            // b2b_EffectiveAccountHeader b2b_EffectiveAccountModal
            this.pageLabelValues.SelectedAccount = result['SELECTED_ACCOUNT'];
            this.pageLabelValues.SelectAccount = result['SELECT_ACCOUNT'];
            this.pageLabelValues.EffectiveAccountTitle = result['EFFECTIVE_ACCOUNT_TITLE'];
            this.pageLabelValues.AccountNumber = result['ACCOUNT_NUMBER'];
            this.pageLabelValues.AddressFormat = result['ADDRESS_FORMAT'];
            this.pageLabelValues.Name = result['Name'];
            this.pageLabelValues.Name_Format = result['Name_Format'] ? result['Name_Format'] : "{0} {1}";
            this.pageLabelValues.Address = result['Address'];
            // b2b_LanguageSelector
            this.pageLabelValues.languageSelectorLabel = result['LocaleSwitcher_Label'];
            this.pageLabelValues.localeValues = {};
            Object.entries(result).forEach(item => { if (item[0].includes('LOC_')) { this.pageLabelValues.localeValues[item[0]] = item[1] } });
            this.pageLabelValues.languageSelectorCancel = result['LocaleSwitcher_Cancel'];
            this.pageLabelValues.languageSelectorChange = result['LocaleSwitcher_Change'];
            this.pageLabelValues.languageSelectorModalTitle = result['LocaleSwitcher_Modal_Title'];
            this.pageLabelValues.languageSelectorModalLabel = result['LocaleSwitcher_Modal_Label'];
        });
    }

    initConfigurationProperties() {
        getConfigValues().then(result => {
            this.configValues.displaySearch = result['h.displsearch'] && result['h.displsearch'].toLowerCase() === 'true' ? true : false;
            this.configValues.useProductListPageV2 = result['pl.usenew'];
            this.configValues.readCartCookie = result['c.pgrdcke'] && result['c.pgrdcke'].toLowerCase() === 'true' ? true : false;
            this.configValues.displayLanguageSelector = result['ls.enabled'] && result['ls.enabled'].toLowerCase() === 'true' ? true : false;
            this.configValues.eaDisplayMode = result['eff.dispmode'];
            this.configValues.eaEnabled = result['eff.enabled'] && result['eff.enabled'].toLowerCase() === 'true' ? true : false;
            // set EA Display
            this.displayEAHeader = this.configValues.eaEnabled && this.configValues.eaDisplayMode === 'header';
        });
    }
}