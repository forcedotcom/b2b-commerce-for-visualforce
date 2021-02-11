/**
 * Created by salesforce.com, inc.
 * Copyright 2020 salesforce.com, inc. All rights reserved.
 * Redistribution and use in source or binary forms, with or without
 * modification is PROHIBITED.
 */
import { LightningElement, api, wire } from 'lwc';
import { initContext, mergePageLabelData, buildProductDetailsPageUrl, buildProductListPageUrl, buildUrl, gotoProductListPage, gotoProductDetailsPage, gotoURL } from 'c/b2b_CommonServices';
import getUserInfo from '@salesforce/apex/ccrz.b2b_lwc_CommonServices.getUserInfo';

export default class B2b_Menu extends LightningElement {

    @api configValues = {};
    @api pageLabelValues = {};
    @api storefront;
    @api menu;
    @api isMyAccountMenu = false;
    linkUrl;
    subMenuHasFocus = false;

    @wire(getUserInfo, { inputData: initContext({}) }) userInfo;

    constructor() {
        super();
        this.template.addEventListener('closemenusevent', this.handleCloseMenusEvent.bind(this));
    }

    connectedCallback() {
        this.setMenuDefaults();
        this.determineLinkUrl();
    }

    setMenuDefaults() {
        if (!this.menu) {
            this.menu = {};
        }
    }

    get logoutLinkUrl() {
        let logoutLinkUrlReturnData;
        if (this.storefront && this.storefront.data) {
            logoutLinkUrlReturnData = '/' + this.storefront.data + '/secur/logout.jsp';
        }
        return logoutLinkUrlReturnData;
    }

    handleCloseMenusEvent(event) {
        this.closeSubMenus();
    }

    determineLinkUrl() {
        if (this.menu && this.menu.mType) {
            switch (this.menu.mType) {
                case "Category":
                    const useProductListPageV2 = this.configValues.useProductListPageV2 ? this.configValues.useProductListPageV2 : 'true';
                    buildProductListPageUrl({
                        categoryId: this.menu.linkURL,
                        friendlyUrl: this.menu.friendlyUrl,
                        useProductListPageV2: useProductListPageV2
                    }).then(result => {
                        this.linkUrl = result;
                    }).catch(error => {
                        console.warn(error);
                    });
                    break;

                case "Product":
                    buildProductDetailsPageUrl({
                        sku: this.menu.linkURL,
                        friendlyUrl: this.menu.friendlyUrl
                    }).then(result => {
                        this.linkUrl = result;
                    }).catch(error => {
                        console.warn(error);
                    });
                    break;

                case "URL":
                    this.linkUrl = buildUrl({
                        url: this.menu.linkURL
                    }).then(result => {
                        this.linkUrl = result;
                    }).catch(error => {
                        console.warn(error);
                    });
            }
        }
    };

    get linkClassList() {
        let classList = "";

        if (this.menu && this.menu.mType) {
            switch (this.menu.mType) {
                case "Category":
                    classList = "cc_category gp_cat";
                    break;
                case "Product":
                    classList = "cc_product gp_prod";
            }
        }
        return classList;
    };

    closeMenu() {
        // close any open sub menus
        this.closeSubMenus();

        // close this menu
        const menuEl = this.template.querySelector('.dropdown');
        if (menuEl.classList.contains("open")) {
            menuEl.classList.remove("open");
        }

        // remove document event listener
        document.removeEventListener("click", this);
    };

    closeSubMenus() {
        const subMenuEls = this.template.querySelectorAll('c-b2b_-menu-item');

        subMenuEls.forEach(subMenuEl => {
            subMenuEl.closeMenu();
        });
    };

    toggleMenu(event) {
        const menuEl = this.template.querySelector('.dropdown');

        if (menuEl.classList.contains("open")) {
            this.closeMenu();
        } else {
            menuEl.classList.add("open");
            this.subMenuHasFocus = true;
            document.addEventListener("click", this);
        }
    };

    handleBlur(event) {
        if (!this.subMenuHasFocus) {
            this.closeMenu();
        }
    };

    handleMouseOver(event) {
        this.subMenuHasFocus = true;
    };

    handleMouseOut(event) {
        this.subMenuHasFocus = false;
    };

    // invoked from document click event listener
    handleEvent(event) {
        this.handleBlur(event);
    };

    handleMenuClick(event) {
        event.preventDefault();
        event.stopPropagation();

        switch (this.menu.mType) {
            case "URL":
                gotoURL({
                    url: this.menu.linkURL,
                    newWindow: this.menu.openInNewWindow
                });
                break;
            case "Category":
                gotoProductListPage({
                    categoryId: this.menu.linkURL,
                    friendlyUrl: this.menu.friendlyUrl,
                    useProductListPageV2: this.configValues.useProductListPageV2,
                    newWindow: this.menu.openInNewWindow
                });
                break;
            case "Product":
                gotoProductDetailsPage({
                    sku: this.menu.linkURL,
                    friendlyUrl: this.menu.friendlyUrl,
                    newWindow: this.menu.openInNewWindow
                });
        }
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