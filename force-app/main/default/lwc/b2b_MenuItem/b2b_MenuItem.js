/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { LightningElement, api } from 'lwc';
import { buildProductDetailsPageUrl, buildProductListPageUrl, buildUrl, gotoProductListPage, gotoProductDetailsPage, gotoURL } from 'c/b2b_CommonServices';

export default class B2b_MenuItem extends LightningElement {

    @api configValues = {};
    @api menuItem;
    linkUrl;
    focusMenu = false;

    constructor() {
		super();
		this.template.addEventListener('closemenusevent', this.handleCloseMenusEvent.bind(this));
	}

	handleCloseMenusEvent(event) {
		this.closeSubMenus();
	}

    connectedCallback() {
        this.determineLinkUrl();
    }

    determineLinkUrl() {
        if(this.menuItem && this.menuItem.mType) {
            switch (this.menuItem.mType) {
                case "Category":
                    const useProductListPageV2 = this.configValues.useProductListPageV2 ? this.configValues.useProductListPageV2 : 'true';
                    buildProductListPageUrl({
                        categoryId: this.menuItem.linkURL,
                        friendlyUrl: this.menuItem.friendlyUrl,
                        useProductListPageV2: useProductListPageV2
                    }).then(result => {
                        this.linkUrl = result;
                    }).catch(error => {
                        console.warn(error);
                    });
                    break;

                case "Product":
                    buildProductDetailsPageUrl({
                        sku: this.menuItem.linkURL,
                        friendlyUrl: this.menuItem.friendlyUrl
                    }).then(result => {
                        this.linkUrl = result;
                    }).catch(error => {
                        console.warn(error);
                    });
                    break;

                case "URL":
                    this.linkUrl = buildUrl({
                        url: this.menuItem.linkURL
                    }).then(result => {
                        this.linkUrl = result;
                    }).catch(error => {
                        console.warn(error);
                    });
            }
        }
    };

    @api
    closeMenu() {
        if(!this.focusMenu) {
            // close any open sub menus
            this.closeSubMenus();

            // close this menu
            const menuEl = this.template.querySelector('.dropdown-submenu');

            if (menuEl && menuEl.classList.contains("open")) {
                menuEl.classList.remove("open");
            }
        }

        this.focusMenu = false;
    };    

    closeSubMenus() {
        const subMenuEls = this.template.querySelectorAll('c-b2b_-menu-item');

        subMenuEls.forEach(subMenuEl => {
            subMenuEl.closeMenu();
        });
    }

    get linkClassList() {
        let classList = "";

        switch (this.menuItem.mType) {
            case "Category":
                classList = "cc_category gp_cat";
                break;
            case "Product":
                classList = "cc_product gp_prod";
        }
        return classList;
    }

    toggleMenu(event) {
        event.stopPropagation();
        event.preventDefault();

        const menuEl = this.template.querySelector('.dropdown-submenu');

        if (menuEl.classList.contains("open")) {
            this.closeMenu();
        } else {
            menuEl.classList.add("open");
            // close any other open menus
            this.focusMenu = true;
            const closeMenusEvent = new CustomEvent('closemenusevent', {detail: 'hello', bubbles: true});
            this.dispatchEvent(closeMenusEvent);
        }
    };

    handleBlur(event) {
        console.log("handleBlur");
    };

    handleFocusOut(event) {
        console.log("handleFocusOut");
    };

    handleMenuItemClick(event) {
        event.preventDefault();
        event.stopPropagation();

        switch (this.menuItem.mType) {
            case "URL":
                gotoURL({
                    url: this.menuItem.linkURL,
                    newWindow: this.menuItem.openInNewWindow
                });
                break;
            case "Category":
                gotoProductListPage({
                    categoryId: this.menuItem.linkURL,
                    friendlyUrl: this.menuItem.friendlyUrl,
                    useProductListPageV2: this.configValues.useProductListPageV2,
                    newWindow: this.menuItem.openInNewWindow
                });
                break;
            case "Product":
                gotoProductDetailsPage({
                    sku: this.menuItem.linkURL,
                    friendlyUrl: this.menuItem.friendlyUrl,
                    newWindow: this.menuItem.openInNewWindow
                });
        }
    };
}