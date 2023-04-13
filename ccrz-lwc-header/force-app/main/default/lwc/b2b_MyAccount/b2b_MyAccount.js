/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api, wire } from 'lwc';
import { initContext, mergePageLabelData, buildPageUrl, gotoPage } from 'c/b2b_CommonServices';
import getMyAccountMenu from '@salesforce/apex/ccrz.b2b_lwc_MyAccountController.getMyAccountMenu';
import getStorefront from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getStorefrontName';
import getUserInfo from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getUserInfo';

export default class b2b_MyAccount extends LightningElement {

    @api pageLabelValues = {};
    @api configValues = {};
    @api isGuest;
    loginLinkUrl = "#";

    @wire(getStorefront) storefront;
    @wire(getUserInfo, { inputData: initContext({}) }) userInfo;
    @wire(getMyAccountMenu, { inputData: initContext({}) }) myAccountMenuWiredData;

    connectedCallback() {
        if (this.isGuest) {
            this.setLoginLinkUrl();
        }
    }

    closeMenu() {
        const menuEl = this.template.querySelector('.dropdown');
        if (menuEl.classList.contains("open")) {
            menuEl.classList.remove("open");
        }
    }

    toggleMenu(event) {
        const menuEl = this.template.querySelector('.dropdown');
        if (menuEl.classList.contains("open")) {
            this.closeMenu();
        } else {
            menuEl.classList.add("open");
        }
    };

    handleBlur(event) {
        if (!event.relatedTarget || !event.relatedTarget.classList || !event.relatedTarget.classList.contains("my-account-menu-item")) {
            this.closeMenu();
        }
    };

    handleLoginLink(event) {
        event.preventDefault();
        event.stopPropagation();
        gotoPage({ page: 'CCSiteLogin' });
    };

    setLoginLinkUrl() {
        buildPageUrl({ page: 'CCSiteLogin' }).then(result => {
            this.loginLinkUrl = result;
        }).catch(error => {
            console.warn(error);
        });
    }

    get logoutLinkUrl() {
        let logoutLinkUrlReturnData;
        if (this.storefront && this.storefront.data) {
            logoutLinkUrlReturnData = '/' + this.storefront.data + '/secur/logout.jsp';
        }
        return logoutLinkUrlReturnData;
    }

    get menuItems() {
        const data = this.myAccountMenuWiredData.data;
        let menuItemData = [];
        if (data && data.success && data.myAccountMenu) {
            let arrayOfObjects = data.myAccountMenu;
            // Use the menu items for the first LWC My Account menu record - based on sequence order
            let object = arrayOfObjects[0];
            // Store the array of menu items/children associated to the menu
            for (let property in object) {
                if (property === 'children' && object.hasOwnProperty(property)) {
                    menuItemData = object[property];
                }
            }
        } else if (data && !data.success) {
            console.warn("[b2blwc]: Could not retrieve menu items for my account dropdown. Success was false.");
        }
        return menuItemData;
    };

    get userFormattedName() {
        let formattedName = "";

        if (this.pageLabelValues && this.pageLabelValues.Name_Format) {

            const userData = this.userInfo.data;
            if (userData && userData.success && userData.currentUser) {

				let currUser = userData.currentUser;
                formattedName = mergePageLabelData(this.pageLabelValues.Name_Format, [currUser.firstName, currUser.lastName]);

            } else if (userData && !userData.success) {
                console.error("[b2blwc]: Could not retrieve user info. Success was false.");
            }
        }
        return formattedName;
    }
}